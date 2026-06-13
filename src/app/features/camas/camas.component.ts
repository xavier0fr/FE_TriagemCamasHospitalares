import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CamaService } from '../../core/services/cama.service';
import { PrioridadeService, Prioridade } from '../../core/services/prioridade.service';
import { RelatorioService } from '../../core/services/relatorio.service';
import { Cama, Quarto } from '../../core/models/cama.model';

@Component({
  selector: 'app-camas',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './camas.component.html',
  styleUrl: './camas.component.scss'
})
export class CamasComponent implements OnInit {
  camas = signal<Cama[]>([]);
  prioridades = signal<Prioridade[]>([]);
  loading = signal(true);
  erro = signal<string | null>(null);
  filtro = signal<'todas' | 'livres' | 'ocupadas' | 'higienizar'>('todas');

  camasFiltradas = computed(() => {
    const f = this.filtro();
    return this.camas().filter(c => {
      if (f === 'livres')      return c.estado_ocupacao === 'Livre' && c.estado_limpeza === 'Limpa';
      if (f === 'ocupadas')   return c.estado_ocupacao === 'Ocupada';
      if (f === 'higienizar') return c.estado_limpeza === 'Suja' || c.estado_limpeza === 'A Aguardar';
      return true;
    });
  });

  // ── Filtros XML (admin) ─────────────────────────────────────
  filtroXmlAndar = signal<string>('');
  filtroXmlQuarto = signal<string>('');

  // Andares únicos derivados das camas carregadas
  andaresXml = computed(() => {
    const map = new Map<string, { _id: string; label: string }>();
    for (const c of this.camas()) {
      if (typeof c.quarto === 'object' && c.quarto) {
        const q = c.quarto as Quarto;
        if (typeof (q as any).andar === 'object' && (q as any).andar) {
          const a = (q as any).andar;
          if (!map.has(a._id)) {
            map.set(a._id, { _id: a._id, label: `Piso ${a.numero_piso} — ${a.nome_ala}` });
          }
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  });

  // Quartos únicos derivados das camas (filtrados pelo andar selecionado)
  quartosXml = computed(() => {
    const andarId = this.filtroXmlAndar();
    const map = new Map<string, { _id: string; label: string; andarId: string }>();
    for (const c of this.camas()) {
      if (typeof c.quarto === 'object' && c.quarto) {
        const q = c.quarto as Quarto;
        const qId = (q as any)._id;
        const aId = typeof (q as any).andar === 'object' ? (q as any).andar._id : '';
        if (!map.has(qId)) {
          map.set(qId, { _id: qId, label: q.numero_quarto, andarId: aId });
        }
      }
    }
    const todos = Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
    return andarId ? todos.filter(q => q.andarId === andarId) : todos;
  });

  exportarCamasXml() {
    this.relatorioService.exportarCamas(
      this.filtroXmlAndar() || undefined,
      this.filtroXmlQuarto() || undefined
    );
  }

  // ── Importação XML ──────────────────────────────────────────
  importResult = signal<{ valido: boolean; importado?: any; erros?: string[]; avisos?: string[] } | null>(null);
  importLoading = signal(false);

  abrirImportar(input: HTMLInputElement) {
    input.value = '';
    input.click();
  }

  onFicheiroImportar(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.importLoading.set(true);
    this.importResult.set(null);
    const reader = new FileReader();
    reader.onload = () => {
      const xml = reader.result as string;
      this.relatorioService.importarCamas(xml).subscribe({
        next: (r: any) => {
          this.importResult.set(r);
          this.importLoading.set(false);
          if (r.valido) this.carregar();
        },
        error: (e: any) => {
          this.importResult.set(e.error ?? { valido: false, erros: ['Erro desconhecido.'] });
          this.importLoading.set(false);
        }
      });
    };
    reader.readAsText(file);
  }

  fecharImportResult() { this.importResult.set(null); }

  // IDs das camas com prioridade ativa
  camasComPrioridade = computed(() =>
    new Set(this.prioridades().map(p => typeof p.cama === 'object' ? p.cama._id : p.cama))
  );

  constructor(
    public auth: AuthService,
    private camaService: CamaService,
    private prioridadeService: PrioridadeService,
    public relatorioService: RelatorioService
  ) {}

  ngOnInit() {
    this.carregar();
    if (this.auth.role() === 'auxiliar_limpeza') {
      this.filtro.set('higienizar');
    }
  }

  carregar() {
    this.loading.set(true);
    this.erro.set(null);
    this.camaService.getAll().subscribe({
      next: c => { this.camas.set(c); this.loading.set(false); },
      error: () => { this.erro.set('Erro ao carregar camas.'); this.loading.set(false); }
    });
    this.prioridadeService.getAtivas().subscribe({
      next: p => this.prioridades.set(p),
      error: () => {}
    });
  }

  iniciarLimpeza(id: string) {
    this.camaService.aguardar(id).subscribe({
      next: () => this.carregar(),
      error: (e) => this.erro.set(e.error?.error ?? 'Erro ao iniciar limpeza.')
    });
  }

  concluirLimpeza(id: string) {
    this.camaService.higienizar(id).subscribe({
      next: () => {
        // Dispensar prioridade associada a esta cama (se existir)
        const prioridade = this.prioridades().find(p => {
          const camaId = typeof p.cama === 'object' ? p.cama._id : p.cama;
          return camaId === id;
        });
        if (prioridade) {
          this.prioridadeService.dispensar(prioridade._id).subscribe();
        }
        this.carregar();
      },
      error: (e) => this.erro.set(e.error?.error ?? 'Não foi possível concluir a limpeza.')
    });
  }

  marcarPrioridade(camaId: string) {
    this.erro.set(null);
    this.prioridadeService.criar(camaId).subscribe({
      next: () => this.carregar(),
      error: (e) => this.erro.set(e.error?.error ?? 'Erro ao marcar prioridade.')
    });
  }

  dispensarPrioridade(camaId: string) {
    const prioridade = this.prioridades().find(p => {
      const id = typeof p.cama === 'object' ? p.cama._id : p.cama;
      return id === camaId;
    });
    if (!prioridade) return;
    this.prioridadeService.dispensar(prioridade._id).subscribe({
      next: () => this.carregar(),
      error: () => {}
    });
  }

  temPrioridade(camaId: string): boolean {
    return this.camasComPrioridade().has(camaId);
  }

  // Prioridade para o auxiliar ver (incluindo dados da cama)
  prioridadesDaCama(camaId: string): Prioridade | undefined {
    return this.prioridades().find(p => {
      const id = typeof p.cama === 'object' ? p.cama._id : p.cama;
      return id === camaId;
    });
  }

  // Cores das linhas: verde=Livre+Limpa, amarelo=Ocupada+Limpa, vermelho=Livre+Suja
  rowClass(cama: Cama): string {
    if (cama.estado_ocupacao === 'Livre' && cama.estado_limpeza === 'Limpa') return 'row-livre-limpa';
    if (cama.estado_ocupacao === 'Livre' && (cama.estado_limpeza === 'Suja' || cama.estado_limpeza === 'A Aguardar')) return 'row-livre-suja';
    if (cama.estado_ocupacao === 'Ocupada' && cama.estado_limpeza === 'Limpa') return 'row-ocupada-limpa';
    return '';
  }

  // Badge "Livre" amarelo quando cama está suja (para diferenciar de livre+limpa)
  badgeOcupacao(cama: Cama): string {
    if (cama.estado_ocupacao === 'Livre' && (cama.estado_limpeza === 'Suja' || cama.estado_limpeza === 'A Aguardar')) return 'badge-livre-suja';
    return cama.estado_ocupacao === 'Livre' ? 'badge-livre' : 'badge-ocupada';
  }

  badgeLimpeza(estado: string) {
    if (estado === 'Limpa')  return 'badge-limpa';
    if (estado === 'Suja')   return 'badge-suja';
    return 'badge-aguardar';
  }

  nomeQuarto(cama: Cama): string {
    if (typeof cama.quarto === 'object') return (cama.quarto as Quarto).numero_quarto;
    return String(cama.quarto);
  }

  nomeAndar(cama: Cama): string {
    if (typeof cama.quarto === 'object') {
      const q = cama.quarto as Quarto;
      if (typeof q.andar === 'object' && q.andar)
        return `Piso ${(q.andar as any).numero_piso} — ${(q.andar as any).nome_ala}`;
    }
    return '—';
  }

  ultimoLimpador(cama: Cama): string {
    const ul = cama.ultimo_limpador;
    if (!ul) return '—';
    if (typeof ul === 'object') return (ul as any).nome_completo ?? '—';
    return '—';
  }

  get countLivres()     { return this.camas().filter(c => c.estado_ocupacao === 'Livre' && c.estado_limpeza === 'Limpa').length; }
  get countOcupadas()   { return this.camas().filter(c => c.estado_ocupacao === 'Ocupada').length; }
  get countHigienizar() { return this.camas().filter(c => c.estado_limpeza === 'Suja' || c.estado_limpeza === 'A Aguardar').length; }
  get countPrioridades() { return this.prioridades().length; }
}
