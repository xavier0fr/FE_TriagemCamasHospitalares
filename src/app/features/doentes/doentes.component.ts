import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { DoenteService } from '../../core/services/doente.service';
import { Doente } from '../../core/models/doente.model';

@Component({
  selector: 'app-doentes',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './doentes.component.html',
  styleUrl: './doentes.component.scss'
})
export class DoenteComponent implements OnInit {
  doentes = signal<Doente[]>([]);
  loading = signal(true);
  modal = signal<'criar' | 'editar' | null>(null);
  editId = signal('');
  erro = signal<string | null>(null);
  modalConf = signal<{ msg: string; fn: () => void } | null>(null);

  form: Partial<Doente> = {
    numero_sns: '', nome_completo: '', data_nascimento: '', contacto_emergencia: ''
  };

  // Campo separado para os 9 dígitos do telemóvel (sem o +351)
  telefoneSufixo = '';

  readonly hoje = new Date().toISOString().substring(0, 10);
  readonly dataMin = new Date(new Date().getFullYear() - 120, 0, 1).toISOString().substring(0, 10);

  get nomeValido(): boolean {
    return /^[^\d]+$/.test((this.form.nome_completo ?? '').trim()) && (this.form.nome_completo ?? '').trim().length >= 3;
  }

  get snsValido(): boolean {
    return /^\d{9}$/.test(this.form.numero_sns ?? '');
  }

  get dataValida(): boolean {
    if (!this.form.data_nascimento) return false;
    return this.form.data_nascimento <= this.hoje && this.form.data_nascimento >= this.dataMin;
  }

  get contactoValido(): boolean {
    return /^\d{9}$/.test(this.telefoneSufixo);
  }

  get formValido(): boolean {
    return this.nomeValido && this.snsValido && this.dataValida && this.contactoValido;
  }

  constructor(public auth: AuthService, private doenteService: DoenteService) {}

  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading.set(true);
    this.doenteService.getAll().subscribe({
      next: d => { this.doentes.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  abrirCriar() {
    this.form = { numero_sns: '', nome_completo: '', data_nascimento: '', contacto_emergencia: '' };
    this.telefoneSufixo = '';
    this.erro.set(null);
    this.modal.set('criar');
  }

  abrirEditar(d: Doente) {
    this.editId.set(d._id);
    this.form = {
      numero_sns: d.numero_sns,
      nome_completo: d.nome_completo,
      data_nascimento: d.data_nascimento?.substring(0, 10),
      contacto_emergencia: d.contacto_emergencia
    };
    // Extrair os 9 dígitos do número guardado
    const tel = d.contacto_emergencia ?? '';
    const digits = tel.replace(/\D/g, '');
    this.telefoneSufixo = digits.length >= 9 ? digits.slice(-9) : digits;
    this.erro.set(null);
    this.modal.set('editar');
  }

  submeter() {
    this.erro.set(null);
    if (!this.formValido) { this.erro.set('Verifique os campos assinalados.'); return; }
    const payload = { ...this.form, contacto_emergencia: '+351' + this.telefoneSufixo };
    this.doenteService.create(payload).subscribe({
      next: () => { this.modal.set(null); this.carregar(); },
      error: (e) => this.erro.set(e.error?.error ?? 'Erro ao registar doente.')
    });
  }

  submeterEditar() {
    this.erro.set(null);
    if (!this.formValido) { this.erro.set('Verifique os campos assinalados.'); return; }
    const payload = { ...this.form, contacto_emergencia: '+351' + this.telefoneSufixo };
    this.doenteService.update(this.editId(), payload).subscribe({
      next: () => { this.modal.set(null); this.carregar(); },
      error: (e) => this.erro.set(e.error?.error ?? 'Erro ao editar doente.')
    });
  }

  apagar(d: Doente) {
    this.modalConf.set({
      msg: `Apagar o doente "${d.nome_completo}" (SNS: ${d.numero_sns})? Esta ação não pode ser desfeita.`,
      fn: () => this.doenteService.delete(d._id).subscribe(() => this.carregar())
    });
  }

  fecharModal() { this.modal.set(null); this.erro.set(null); }

  idade(dataNasc: string): number {
    const diff = Date.now() - new Date(dataNasc).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }
}
