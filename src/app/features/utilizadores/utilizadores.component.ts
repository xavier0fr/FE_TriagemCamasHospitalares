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
  mostrarFormulario = signal(false);
  erro = signal<string | null>(null);

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

  submeter() {
    this.erro.set(null);
    this.userService.criar(this.form).subscribe({
      next: () => {
        this.mostrarFormulario.set(false);
        this.form = { nome_completo: '', email: '', password_hash: '', tipo_utilizador: '', cedula_profissional: '', turno_trabalho: '' };
        this.carregar();
      },
      error: (e) => this.erro.set(e.error?.error ?? 'Erro ao criar utilizador.')
    });
  }

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
