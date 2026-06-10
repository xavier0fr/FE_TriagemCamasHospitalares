import { Component, OnInit, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
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
  todosDoentes = signal<Doente[]>([]);
  especialidades = signal<Especialidade[]>([]);
  loading = signal(true);
  mostrarFormulario = signal(false);
  sugestao = signal<any | null>(null);
  sugestaoLoading = signal(false);
  sugestaoEspecialidade = signal('');
  erroForm = signal<string | null>(null);

  // Doentes sem internamento ativo
  doentesDisponiveis = computed(() => {
    const idsInternados = new Set(
      this.internamentos()
        .map(i => typeof i.doente === 'object' ? (i.doente as Doente)._id : i.doente)
    );
    return this.todosDoentes().filter(d => !idsInternados.has(d._id));
  });

  form: CriarInternamentoRequest = { motivo_internamento: '', doente: '', cama: '' };

  constructor(
    public auth: AuthService,
    private internamentoService: InternamentoService,
    private camaService: CamaService,
    private doenteService: DoenteService,
    private infraService: InfraestruturaService
  ) {}

  ngOnInit() {
    this.carregar();
    this.doenteService.getAll().subscribe(d => this.todosDoentes.set(d));
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
    this.erroForm.set(null);
    this.form = { motivo_internamento: '', doente: '', cama: '' };
    // Recarregar camas livres e limpas
    this.camaService.getLivres().subscribe(c => this.camasDisponiveis.set(c));
    this.mostrarFormulario.set(true);
  }

  pedirSugestao() {
    this.sugestaoLoading.set(true);
    const espId = this.sugestaoEspecialidade();
    this.internamentoService.sugerirCama(espId || undefined).subscribe({
      next: res => {
        this.sugestao.set(res);
        if (res.sugestao?._id) this.form.cama = res.sugestao._id;
        this.sugestaoLoading.set(false);
      },
      error: () => {
        this.sugestao.set({ erro: 'Sem camas livres e limpas para a especialidade selecionada.' });
        this.sugestaoLoading.set(false);
      }
    });
  }

  submeter() {
    this.erroForm.set(null);
    this.internamentoService.criar(this.form).subscribe({
      next: () => {
        this.mostrarFormulario.set(false);
        this.sugestao.set(null);
        this.form = { motivo_internamento: '', doente: '', cama: '' };
        this.carregar();
      },
      error: (e) => this.erroForm.set(e.error?.error ?? 'Erro ao criar internamento.')
    });
  }

  darAlta(id: string) {
    if (confirm('Confirmar alta do doente? A cama ficará sinalizada para higienização.')) {
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
      const q = (i.cama as Cama).quarto as any;
      if (q && typeof q === 'object') return q.numero_quarto ?? '—';
    }
    return '—';
  }
}
