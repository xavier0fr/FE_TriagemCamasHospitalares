import { Component, OnInit, signal } from '@angular/core';
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
  utilizadores = signal<Utilizador[]>([]);
  loading = signal(true);
  modal = signal<'criar' | 'editar' | null>(null);
  erro = signal<string | null>(null);
  editId = signal('');

  form = {
    nome_completo: '',
    email: '',
    password_hash: '',
    tipo_utilizador: '',
    cedula_profissional: '',
    turno_trabalho: ''
  };

  constructor(private userService: UserService) {}

  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading.set(true);
    this.userService.getAll().subscribe({
      next: u => { this.utilizadores.set(u); this.loading.set(false); },
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
    this.userService.criar(this.form as any).subscribe({
      next: () => { this.modal.set(null); this.carregar(); },
      error: (e) => this.erro.set(e.error?.error ?? 'Erro ao criar utilizador.')
    });
  }

  submeterEditar() {
    this.erro.set(null);
    const { password_hash, ...dados } = this.form;
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
    const map: Record<string, string> = {
      admin: 'Administrador',
      enfermeiro_gestor: 'Enfermeiro Gestor',
      auxiliar_limpeza: 'Auxiliar de Limpeza'
    };
    return map[tipo] ?? tipo;
  }

  roleBadgeClass(tipo: string): string {
    if (tipo === 'admin') return 'role-admin';
    if (tipo === 'enfermeiro_gestor') return 'role-enf';
    return 'role-aux';
  }
}
