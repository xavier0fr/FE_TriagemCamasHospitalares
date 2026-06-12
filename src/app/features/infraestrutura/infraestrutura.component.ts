import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InfraestruturaService } from '../../core/services/infraestrutura.service';
import { AndarHospital, Especialidade, QuartoHospital } from '../../core/models/infraestrutura.model';

type Modal = 'andar' | 'quarto' | 'editAndar' | 'editQuarto' | 'especialidade' | 'gestesp' | null;

@Component({
  selector: 'app-infraestrutura',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './infraestrutura.component.html',
  styleUrl: './infraestrutura.component.scss'
})
export class InfraestruturaComponent implements OnInit {
  andares = signal<AndarHospital[]>([]);
  quartos = signal<QuartoHospital[]>([]);
  especialidades = signal<Especialidade[]>([]);

  modal = signal<Modal>(null);
  erro = signal<string | null>(null);
  modalConf = signal<{ msg: string; fn: () => void } | null>(null);

  formAndar = { numero_piso: null as number | null, nome_ala: '' };
  formQuarto = { numero_quarto: '', capacidade_maxima: 1, tipo_quarto: '', andar_id: '' };
  formEspecialidade = { nome_especialidade: '' };

  // Número do piso do andar selecionado no form de criar quarto (para hint)
  get pisoCriacao(): string {
    if (!this.formQuarto.andar_id) return '';
    const a = this.andares().find(x => x._id === this.formQuarto.andar_id);
    return a ? String(a.numero_piso) : '';
  }

  editAndarId = signal('');
  editAndarForm = { numero_piso: null as number | null, nome_ala: '' };

  editQuartoId = signal('');
  editQuartoForm = { numero_quarto: '', tipo_quarto: '', capacidade_maxima: 1 };

  gestEspAndarId = signal('');
  gestEspAndar = signal<AndarHospital | null>(null);
  assocEspId = signal('');

  constructor(private infra: InfraestruturaService) {}

  ngOnInit() { this.carregar(); }

  carregar() {
    this.infra.getAndares().subscribe(a => this.andares.set(a));
    this.infra.getQuartos().subscribe(q => this.quartos.set(q));
    this.infra.getEspecialidades().subscribe(e => this.especialidades.set(e));
  }

  // --- ANDARES ---
  submeterAndar() {
    this.erro.set(null);
    this.infra.criarAndar({ numero_piso: this.formAndar.numero_piso!, nome_ala: this.formAndar.nome_ala }).subscribe({
      next: () => { this.modal.set(null); this.formAndar = { numero_piso: null, nome_ala: '' }; this.carregar(); },
      error: (e) => this.erro.set(e.error?.error ?? 'Erro ao criar andar.')
    });
  }

  abrirEditAndar(a: AndarHospital) {
    this.editAndarId.set(a._id);
    this.editAndarForm = { numero_piso: a.numero_piso, nome_ala: a.nome_ala };
    this.erro.set(null);
    this.modal.set('editAndar');
  }

  submeterEditAndar() {
    this.erro.set(null);
    this.infra.updateAndar(this.editAndarId(), { numero_piso: this.editAndarForm.numero_piso!, nome_ala: this.editAndarForm.nome_ala }).subscribe({
      next: () => { this.modal.set(null); this.carregar(); },
      error: (e) => this.erro.set(e.error?.error ?? 'Erro ao editar andar.')
    });
  }

  apagarAndar(a: AndarHospital) {
    const n = this.countQuartos(a._id);
    const msg = n > 0
      ? `Apagar "Piso ${a.numero_piso} — ${a.nome_ala}"? Isto irá apagar também ${n} quarto(s) e todas as suas camas.`
      : `Apagar "Piso ${a.numero_piso} — ${a.nome_ala}"?`;
    this.modalConf.set({ msg, fn: () => this.infra.deleteAndar(a._id).subscribe(() => this.carregar()) });
  }

  // --- QUARTOS ---
  submeterQuarto() {
    this.erro.set(null);
    this.infra.criarQuarto(this.formQuarto).subscribe({
      next: () => { this.modal.set(null); this.formQuarto = { numero_quarto: '', capacidade_maxima: 1, tipo_quarto: '', andar_id: '' }; this.carregar(); },
      error: (e) => this.erro.set(e.error?.error ?? 'Erro ao criar quarto.')
    });
  }

  abrirEditQuarto(q: QuartoHospital) {
    this.editQuartoId.set(q._id);
    this.editQuartoForm = { numero_quarto: q.numero_quarto, tipo_quarto: q.tipo_quarto, capacidade_maxima: q.capacidade_maxima };
    this.erro.set(null);
    this.modal.set('editQuarto');
  }

  submeterEditQuarto() {
    this.erro.set(null);
    this.infra.updateQuarto(this.editQuartoId(), this.editQuartoForm).subscribe({
      next: () => { this.modal.set(null); this.carregar(); },
      error: (e) => this.erro.set(e.error?.error ?? 'Erro ao editar quarto.')
    });
  }

  apagarQuarto(q: QuartoHospital) {
    this.modalConf.set({
      msg: `Apagar o quarto ${q.numero_quarto}? Todas as suas camas serão eliminadas.`,
      fn: () => this.infra.deleteQuarto(q._id).subscribe(() => this.carregar())
    });
  }

  // --- ESPECIALIDADES ---
  submeterEspecialidade() {
    this.erro.set(null);
    this.infra.criarEspecialidade(this.formEspecialidade).subscribe({
      next: () => { this.modal.set(null); this.formEspecialidade = { nome_especialidade: '' }; this.carregar(); },
      error: (e) => this.erro.set(e.error?.error ?? 'Erro ao criar especialidade.')
    });
  }

  apagarEspecialidade(e: Especialidade) {
    this.modalConf.set({
      msg: `Apagar a especialidade "${e.nome_especialidade}"? Será desassociada de todos os andares.`,
      fn: () => this.infra.deleteEspecialidade(e._id).subscribe(() => this.carregar())
    });
  }

  abrirGestEsp(a: AndarHospital) {
    this.gestEspAndarId.set(a._id);
    this.gestEspAndar.set(a);
    this.assocEspId.set('');
    this.erro.set(null);
    this.modal.set('gestesp');
  }

  associar() {
    if (!this.assocEspId()) return;
    this.infra.associarEspecialidade(this.gestEspAndarId(), this.assocEspId()).subscribe({
      next: (andarAtualizado) => { this.gestEspAndar.set(andarAtualizado); this.assocEspId.set(''); this.carregar(); },
      error: (e) => this.erro.set(e.error?.error ?? 'Erro.')
    });
  }

  desassociar(espId: string) {
    this.infra.desassociarEspecialidade(this.gestEspAndarId(), espId).subscribe({
      next: (andarAtualizado) => { this.gestEspAndar.set(andarAtualizado); this.carregar(); },
      error: (e) => this.erro.set(e.error?.error ?? 'Erro.')
    });
  }

  especialidadesNaoAssociadas() {
    const andar = this.gestEspAndar();
    if (!andar) return this.especialidades();
    const ids = andar.especialidades.map(e => e._id);
    return this.especialidades().filter(e => !ids.includes(e._id));
  }

  nomeAndar(quarto: QuartoHospital): string {
    return typeof quarto.andar === 'object'
      ? `Piso ${quarto.andar.numero_piso} — ${quarto.andar.nome_ala}`
      : quarto.andar;
  }

  countQuartos(andarId: string): number {
    return this.quartos().filter(q => {
      const id = typeof q.andar === 'object' ? q.andar._id : q.andar;
      return id === andarId;
    }).length;
  }

  fecharModal() { this.modal.set(null); this.erro.set(null); }
}
