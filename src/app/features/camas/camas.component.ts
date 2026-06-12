import { Component, OnInit, signal, computed } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CamaService } from '../../core/services/cama.service';
import { PrioridadeService, Prioridade } from '../../core/services/prioridade.service';
import { Cama, Quarto } from '../../core/models/cama.model';

@Component({
  selector: 'app-camas',
  standalone: true,
  imports: [],
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

  // IDs das camas com prioridade ativa
  camasComPrioridade = computed(() =>
    new Set(this.prioridades().map(p => typeof p.cama === 'object' ? p.cama._id : p.cama))
  );

  constructor(
    public auth: AuthService,
    private camaService: CamaService,
    private prioridadeService: PrioridadeService
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
