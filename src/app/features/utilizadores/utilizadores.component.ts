import { Component, OnInit, signal, computed } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, Utilizador } from '../../core/services/user.service';

@Component({
  selector: 'app-utilizadores',
  standalone: true,
  imports: [FormsModule, SlicePipe],
  templateUrl: './utilizadores.component.html',
  styleUrl: './utilizadores.component.scss'
})
export class UtilizadoresComponent implements OnInit {
  todosUtilizadores = signal<Utilizador[]>([]);
  pendentes = signal<Utilizador[]>([]);
  loading = signal(true);
  modal = signal<'criar' | 'editar' | null>(null);
  erro = signal<string | null>(null);
  editId = signal('');
  aba = signal<'utilizadores' | 'pendentes'>('utilizadores');

  // Modal de confirmação personalizado
  modalConf = signal<{ msg: string; fn: () => void } | null>(null);

  form = {
    nome_completo: '',
    email: '',
    password_hash: '',
    tipo_utilizador: '' as string,
    cedula_profissional: '',
    turno_trabalho: ''
  };

  get mostrarCedula(): boolean { return this.form.tipo_utilizador === 'enfermeiro_gestor'; }
  get mostrarTurno(): boolean  { return this.form.tipo_utilizador === 'auxiliar_limpeza'; }

  get nomeValido(): boolean {
    return /^[^\d]+$/.test(this.form.nome_completo.trim()) && this.form.nome_completo.trim().length >= 3;
  }

  get cedulaValida(): boolean {
    if (!this.mostrarCedula) return true;
    return this.form.cedula_profissional.trim().length >= 3;
  }

  get turnoValido(): boolean {
    if (!this.mostrarTurno) return true;
    return this.form.turno_trabalho !== '';
  }

  get formValido(): boolean {
    return this.nomeValido && this.cedulaValida && this.turnoValido;
  }

  constructor(private userService: UserService) {}

  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading.set(true);
    this.userService.getAll().subscribe({
      next: u => { this.todosUtilizadores.set(u); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.userService.getPendentes().subscribe({
      next: p => this.pendentes.set(p),
      error: () => {}
    });
  }

  abrirCriar() {
    this.form = { nome_completo: '', email: '', password_hash: '', tipo_utilizador: '', cedula_profissional: '', turno_trabalho: '' };
    this.erro.set(null);
    this.modal.set('criar');
  }

  abrirEditar(u: Utilizador) {
    this.editId.set(u._id);
    this.form = {
      nome_completo: u.nome_completo,
      email: u.email,
      password_hash: '',
      tipo_utilizador: u.tipo_utilizador,
      cedula_profissional: u.cedula_profissional ?? '',
      turno_trabalho: u.turno_trabalho ?? ''
    };
    this.erro.set(null);
    this.modal.set('editar');
  }

  submeter() {
    this.erro.set(null);
    if (!this.nomeValido) { this.erro.set('O nome não pode conter números (mín. 3 caracteres).'); return; }
    if (!this.cedulaValida) { this.erro.set('A cédula profissional é obrigatória para enfermeiros.'); return; }
    if (!this.turnoValido) { this.erro.set('O turno de trabalho é obrigatório para auxiliares.'); return; }

    const payload: any = {
      nome_completo: this.form.nome_completo.trim(),
      email: this.form.email.trim(),
      password_hash: this.form.password_hash,
      tipo_utilizador: this.form.tipo_utilizador,
    };
    if (this.mostrarCedula) payload.cedula_profissional = this.form.cedula_profissional.trim();
    if (this.mostrarTurno)  payload.turno_trabalho = this.form.turno_trabalho;

    this.userService.criar(payload).subscribe({
      next: () => { this.modal.set(null); this.carregar(); },
      error: (e) => this.erro.set(e.error?.error ?? 'Erro ao criar utilizador.')
    });
  }

  submeterEditar() {
    this.erro.set(null);
    if (!this.nomeValido) { this.erro.set('O nome não pode conter números (mín. 3 caracteres).'); return; }
    if (!this.cedulaValida) { this.erro.set('A cédula profissional é obrigatória para enfermeiros.'); return; }
    if (!this.turnoValido) { this.erro.set('O turno de trabalho é obrigatório para auxiliares.'); return; }

    const dados: any = {
      nome_completo: this.form.nome_completo.trim(),
      email: this.form.email.trim(),
      tipo_utilizador: this.form.tipo_utilizador,
    };
    if (this.mostrarCedula) dados.cedula_profissional = this.form.cedula_profissional.trim();
    if (this.mostrarTurno)  dados.turno_trabalho = this.form.turno_trabalho;

    this.userService.update(this.editId(), dados).subscribe({
      next: () => { this.modal.set(null); this.carregar(); },
      error: (e) => this.erro.set(e.error?.error ?? 'Erro ao editar utilizador.')
    });
  }

  apagar(u: Utilizador) {
    this.modalConf.set({
      msg: `Apagar o utilizador "${u.nome_completo}"? Esta ação não pode ser desfeita.`,
      fn: () => this.userService.delete(u._id).subscribe(() => this.carregar())
    });
  }

  aprovar(u: Utilizador) {
    this.userService.aprovar(u._id).subscribe(() => this.carregar());
  }

  rejeitar(u: Utilizador) {
    this.modalConf.set({
      msg: `Rejeitar e eliminar a conta de "${u.nome_completo}"?`,
      fn: () => this.userService.rejeitarPendente(u._id).subscribe(() => this.carregar())
    });
  }

  fecharModal() { this.modal.set(null); this.erro.set(null); }

  roleLabel(tipo: string): string {
    const map: Record<string, string> = {
      enfermeiro_gestor: 'Enfermeiro Gestor',
      auxiliar_limpeza: 'Auxiliar de Limpeza',
      admin: 'Administrador'
    };
    return map[tipo] ?? tipo;
  }

  roleBadgeClass(tipo: string): string {
    if (tipo === 'enfermeiro_gestor') return 'role-enf';
    if (tipo === 'admin')             return 'role-admin';
    return 'role-aux';
  }

  ehAdmin(u: Utilizador): boolean {
    return u.tipo_utilizador === 'admin';
  }
}
