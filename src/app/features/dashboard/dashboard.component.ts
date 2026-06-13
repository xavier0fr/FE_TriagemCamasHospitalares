import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { CamaService } from '../../core/services/cama.service';
import { InternamentoService } from '../../core/services/internamento.service';
import { PrioridadeService, Prioridade } from '../../core/services/prioridade.service';
import { Cama } from '../../core/models/cama.model';
import { Internamento } from '../../core/models/internamento.model';
import { Doente } from '../../core/models/doente.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  camas = signal<Cama[]>([]);
  internamentosAtivos = signal<Internamento[]>([]);
  prioridades = signal<Prioridade[]>([]);

  get countPrioridades() { return this.prioridades().length; }

  // Contadores
  get camasLivresLimpas()  { return this.camas().filter(c => c.estado_ocupacao === 'Livre' && c.estado_limpeza === 'Limpa').length; }
  get camasOcupadas()      { return this.camas().filter(c => c.estado_ocupacao === 'Ocupada').length; }
  get camasParaLimpar()    { return this.camas().filter(c => c.estado_limpeza === 'Suja').length; }
  get camasLimpas()     { return this.camas().filter(c => c.estado_limpeza === 'Limpa').length; }
  get camasAaguardar()     { return this.camas().filter(c => c.estado_limpeza === 'A Aguardar').length; }
  get totalCamas()         { return this.camas().length; }

  // Taxa de ocupação (0–100)
  get taxaOcupacao(): number {
    return this.totalCamas ? Math.round((this.camasOcupadas / this.totalCamas) * 100) : 0;
  }

  // SVG donut (raio 48, circunferência ~301.6)
  private readonly C = 2 * Math.PI * 48; // 301.59...
  get donutOcupada():  string { return `${(this.camasOcupadas  / (this.totalCamas || 1)) * this.C} ${this.C}`; }
  get donutLivre():    string { return `${(this.camasLivresLimpas / (this.totalCamas || 1)) * this.C} ${this.C}`; }
  get donutLimpar():   string { return `${(this.camasParaLimpar / (this.totalCamas || 1)) * this.C} ${this.C}`; }
  get donutAaguardar():string { return `${(this.camasAaguardar / (this.totalCamas || 1)) * this.C} ${this.C}`; }

  // Offsets para o donut (empilhados)
  get offsetLivre():    number { return 0; }
  get offsetOcupada():  number { return (this.camasLivresLimpas / (this.totalCamas || 1)) * this.C; }
  get offsetLimpar():   number { return this.offsetOcupada + (this.camasOcupadas / (this.totalCamas || 1)) * this.C; }
  get offsetAaguardar():number { return this.offsetLimpar  + (this.camasParaLimpar / (this.totalCamas || 1)) * this.C; }

  // Últimos 5 internamentos para a lista
  get recentesInternamentos(): Internamento[] {
    return [...this.internamentosAtivos()]
      .sort((a, b) => new Date(b.data_hora_entrada).getTime() - new Date(a.data_hora_entrada).getTime())
      .slice(0, 5);
  }

  nomeDoente(i: Internamento): string {
    return typeof i.doente === 'object' ? (i.doente as Doente).nome_completo : i.doente;
  }

  codigoCama(i: Internamento): string {
    return typeof i.cama === 'object' ? (i.cama as Cama).codigo_cama : i.cama;
  }

  constructor(
    public auth: AuthService,
    private camaService: CamaService,
    private internamentoService: InternamentoService,
    private prioridadeService: PrioridadeService
  ) {}

  ngOnInit() {
    this.camaService.getAll().subscribe(c => this.camas.set(c));
    if (this.auth.role() !== 'auxiliar_limpeza') {
      this.internamentoService.getAtivos().subscribe(i => this.internamentosAtivos.set(i));
    } else {
      // Auxiliar de limpeza: carregar camas com limpeza prioritária
      this.prioridadeService.getAtivas().subscribe(p => this.prioridades.set(p));
    }
  }
}
