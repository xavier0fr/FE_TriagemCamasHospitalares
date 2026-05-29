import { Component, OnInit, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CamaService } from '../../core/services/cama.service';
import { InternamentoService } from '../../core/services/internamento.service';
import { Cama } from '../../core/models/cama.model';
import { Internamento } from '../../core/models/internamento.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, TitleCasePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  camas = signal<Cama[]>([]);
  internamentosAtivos = signal<Internamento[]>([]);

  get camasLivresLimpas() {
    return this.camas().filter(c => c.estado_ocupacao === 'Livre' && c.estado_limpeza === 'Limpa').length;
  }
  get camasOcupadas() {
    return this.camas().filter(c => c.estado_ocupacao === 'Ocupada').length;
  }
  get camasParaLimpar() {
    return this.camas().filter(c => c.estado_limpeza === 'Suja').length;
  }

  constructor(
    public auth: AuthService,
    private camaService: CamaService,
    private internamentoService: InternamentoService
  ) {}

  ngOnInit() {
    this.camaService.getAll().subscribe(c => this.camas.set(c));
    this.internamentoService.getAtivos().subscribe(i => this.internamentosAtivos.set(i));
  }
}
