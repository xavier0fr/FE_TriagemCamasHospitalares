import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InternamentoService } from '../../core/services/internamento.service';
import { CamaService } from '../../core/services/cama.service';
import { DoenteService } from '../../core/services/doente.service';
import { Internamento, CriarInternamentoRequest } from '../../core/models/internamento.model';
import { Cama } from '../../core/models/cama.model';
import { Doente } from '../../core/models/doente.model';

@Component({
  selector: 'app-internamentos',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe],
  templateUrl: './internamentos.component.html',
  styleUrl: './internamentos.component.scss'
})
export class InternamentosComponent implements OnInit {
  internamentos = signal<Internamento[]>([]);
  camasDisponiveis = signal<Cama[]>([]);
  doentes = signal<Doente[]>([]);
  loading = signal(true);
  mostrarFormulario = signal(false);

  form: CriarInternamentoRequest = { motivo_internamento: '', doente: '', cama: '' };

  constructor(
    private internamentoService: InternamentoService,
    private camaService: CamaService,
    private doenteService: DoenteService
  ) {}

  ngOnInit() {
    this.carregar();
    this.camaService.getAll().subscribe(c =>
      this.camasDisponiveis.set(c.filter(x => x.estado_ocupacao === 'Livre' && x.estado_limpeza === 'Limpa'))
    );
    this.doenteService.getAll().subscribe(d => this.doentes.set(d));
  }

  carregar() {
    this.loading.set(true);
    this.internamentoService.getAtivos().subscribe({
      next: i => { this.internamentos.set(i); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  submeter() {
    this.internamentoService.criar(this.form).subscribe(() => {
      this.mostrarFormulario.set(false);
      this.form = { motivo_internamento: '', doente: '', cama: '' };
      this.carregar();
    });
  }

  darAlta(id: string) {
    if (confirm('Confirmar alta do doente?')) {
      this.internamentoService.darAlta(id).subscribe(() => this.carregar());
    }
  }

  nomeDoente(i: Internamento): string {
    return typeof i.doente === 'object' ? (i.doente as Doente).nome_completo : i.doente;
  }

  codigoCama(i: Internamento): string {
    return typeof i.cama === 'object' ? (i.cama as Cama).codigo_cama : i.cama;
  }
}
