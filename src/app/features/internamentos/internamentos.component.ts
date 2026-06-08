import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InternamentoService } from '../../core/services/internamento.service';
import { CamaService } from '../../core/services/cama.service';
import { DoenteService } from '../../core/services/doente.service';
import { InfraestruturaService } from '../../core/services/infraestrutura.service';
import { Internamento, CriarInternamentoRequest } from '../../core/models/internamento.model';
import { Cama } from '../../core/models/cama.model';
import { Doente } from '../../core/models/doente.model';
import { Especialidade } from '../../core/models/infraestrutura.model';

@Component({
  selector: 'app-internamentos',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './internamentos.component.html',
  styleUrl: './internamentos.component.scss'
})
export class InternamentosComponent implements OnInit {
  internamentos = signal<Internamento[]>([]);
  camasDisponiveis = signal<Cama[]>([]);
  doentes = signal<Doente[]>([]);
  especialidades = signal<Especialidade[]>([]);
  loading = signal(true);
  mostrarFormulario = signal(false);
  sugestao = signal<any | null>(null);
  sugestaoLoading = signal(false);
  sugestaoEspecialidade = signal('');

  form: CriarInternamentoRequest = { motivo_internamento: '', doente: '', cama: '' };

  constructor(
    private internamentoService: InternamentoService,
    private camaService: CamaService,
    private doenteService: DoenteService,
    private infraService: InfraestruturaService
  ) {}

  ngOnInit() {
    this.carregar();
    this.camaService.getLivres().subscribe(c => this.camasDisponiveis.set(c));
    this.doenteService.getAll().subscribe(d => this.doentes.set(d));
    this.infraService.getEspecialidades().subscribe(e => this.especialidades.set(e));
  }

  carregar() {
    this.loading.set(true);
    this.internamentoService.getAtivos().subscribe({
      next: i => { this.internamentos.set(i); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  abrirFormulario() {
    this.sugestao.set(null);
    this.sugestaoEspecialidade.set('');
    this.form = { motivo_internamento: '', doente: '', cama: '' };
    this.camaService.getLivres().subscribe(c => this.camasDisponiveis.set(c));
    this.mostrarFormulario.set(true);
  }

  pedirSugestao() {
    this.sugestaoLoading.set(true);
    const espId = this.sugestaoEspecialidade();
    this.internamentoService.sugerirCama(espId || undefined).subscribe({
      next: res => {
        this.sugestao.set(res);
        if (res.sugestao?._id) {
          this.form.cama = res.sugestao._id;
        }
        this.sugestaoLoading.set(false);
      },
      error: () => {
        this.sugestao.set({ erro: 'Sem camas disponíveis para a especialidade selecionada.' });
        this.sugestaoLoading.set(false);
      }
    });
  }

  submeter() {
    this.internamentoService.criar(this.form).subscribe(() => {
      this.mostrarFormulario.set(false);
      this.sugestao.set(null);
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

  snsDoente(i: Internamento): string {
    return typeof i.doente === 'object' ? (i.doente as Doente).numero_sns : '—';
  }

  codigoCama(i: Internamento): string {
    return typeof i.cama === 'object' ? (i.cama as Cama).codigo_cama : i.cama;
  }

  quartoInfo(i: Internamento): string {
    if (typeof i.cama === 'object') {
      const cama = i.cama as Cama;
      if (typeof cama.quarto === 'object' && cama.quarto) {
        const q = cama.quarto as any;
        return q.numero_quarto ?? '—';
      }
    }
    return '—';
  }
}
