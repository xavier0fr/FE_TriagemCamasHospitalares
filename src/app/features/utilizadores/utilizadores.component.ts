import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService, Utilizador } from '../../core/services/user.service';

@Component({
  selector: 'app-utilizadores',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './utilizadores.component.html',
  styleUrl: './utilizadores.component.scss'
})
export class UtilizadoresComponent implements OnInit {
  todosUtilizadores = signal<Utilizador[]>([]);
  loading = signal(true);
  modal = signal<'criar' | 'editar' | null>(null);
  erro = signal<string | null>(null);
  editId = signal('');

  // Filtrar admins da lista (admins não gerem admins)
  utilizadores = computed(() =>
    this.todosUtilizadores().filter(u => u.tipo_utilizador !== 'admin')
  );

  form = {
    nome_completo: '',
    email: '',
    password_hash: '',
    tipo_utilizador: '' as string,
    cedula_profissional: '',
    turno_trabalho: ''
  };

  // Mostrar cédula apenas para enfermeiro
  get mostrarCedula(): boolean { return this.form.tipo_utilizador === 'enfermeiro_gestor'; }
  // Mostrar turno apenas para auxiliar
  get mostrarTurno(): boolean { return this.form.tipo_utilizador === 'auxiliar_limpeza'; }

  // Validar nome: sem números, mínimo 3 chars
  get nomeValido(): boolean {
    return /^[^\d]+$/.test(this.form.nome_completo.trim()) && this.form.nome_completo.trim().length >= 3;
  }

  constructor(private userService: UserService) {}

  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading.set(true);
    this.userService.getAll().subscribe({
      next: u => { this.todosUtilizadores.set(u); this.loading.set(false); },
      error: () => this.loading.set(false)
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
    if (!this.nomeValido) { this.erro.set('O nome não pode conter números.'); return; }

    const payload: any = {
      nome_completo: this.form.nome_completo.trim(),
      email: this.form.email.trim(),
      password_hash: this.form.password_hash,
      tipo_utilizador: this.form.tipo_utilizador,
    };
    if (this.mostrarCedula) payload.cedula_profissional = this.form.cedula_profissional;
    if (this.mostrarTurno)  payload.turno_trabalho = this.form.turno_trabalho;

    this.userService.criar(payload).subscribe({
      next: () => { this.modal.set(null); this.carregar(); },
      error: (e) => this.erro.set(e.error?.error ?? 'Erro ao criar utilizador.')
    });
  }

  submeterEditar() {
    this.erro.set(null);
    if (!this.nomeValido) { this.erro.set('O nome não pode conter números.'); return; }

    const dados: any = {
      nome_completo: this.form.nome_completo.trim(),
      email: this.form.email.trim(),
      tipo_utilizador: this.form.tipo_utilizador,
    };
    if (this.mostrarCedula) dados.cedula_profissional = this.form.cedula_profissional;
    if (this.mostrarTurno)  dados.turno_trabalho = this.form.turno_trabalho;

    this.userService.update(this.editId(), dados).subscribe({
      next: () => { this.modal.set(null); this.carregar(); },
      error: (e) => this.erro.set(e.error?.error ?? 'Erro ao editar utilizador.')
    });
  }

  apagar(u: Utilizador) {
    if (!confirm(`Apagar o utilizador "${u.nome_completo}"?`)) return;
    this.userService.delete(u._id).subscribe(() => this.carregar());
  }

  fecharModal() { this.modal.set(null); this.erro.set(null); }

  roleLabel(tipo: string): string {
    const map: Record<string, string> = { enfermeiro_gestor: 'Enfermeiro Gestor', auxiliar_limpeza: 'Auxiliar de Limpeza' };
    return map[tipo] ?? tipo;
  }

  roleBadgeClass(tipo: string): string {
    if (tipo === 'enfermeiro_gestor') return 'role-enf';
    return 'role-aux';
  }
}
