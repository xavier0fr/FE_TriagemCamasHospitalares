import { Component, OnInit, signal, computed } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CamaService } from '../../core/services/cama.service';
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

  constructor(public auth: AuthService, private camaService: CamaService) {}

  ngOnInit() {
    this.carregar();
    if (this.auth.role() === 'auxiliar_limpeza') {
      this.filtro.set('higienizar');
    }
  }

  carregar() {
    this.loading.set(true);
    this.camaService.getAll().subscribe({
      next: c => { this.camas.set(c); this.loading.set(false); },
      error: () => { this.erro.set('Erro ao carregar camas.'); this.loading.set(false); }
    });
  }

  // Auxiliar: Suja → A Aguardar (inicia limpeza)
  iniciarLimpeza(id: string) {
    this.camaService.aguardar(id).subscribe(() => this.carregar());
  }

  // Auxiliar: A Aguardar → Limpa (conclui limpeza)
  concluirLimpeza(id: string) {
    this.camaService.higienizar(id).subscribe(() => this.carregar());
  }

  badgeOcupacao(estado: string) {
    return estado === 'Livre' ? 'badge-livre' : 'badge-ocupada';
  }

  badgeLimpeza(estado: string) {
    if (estado === 'Limpa')      return 'badge-limpa';
    if (estado === 'Suja')       return 'badge-suja';
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

  get countLivres()     { return this.camas().filter(c => c.estado_ocupacao === 'Livre' && c.estado_limpeza === 'Limpa').length; }
  get countOcupadas()   { return this.camas().filter(c => c.estado_ocupacao === 'Ocupada').length; }
  get countHigienizar() { return this.camas().filter(c => c.estado_limpeza === 'Suja' || c.estado_limpeza === 'A Aguardar').length; }
}
