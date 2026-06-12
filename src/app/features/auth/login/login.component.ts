import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

interface QuickUser {
  label: string;
  role: string;
  email: string;
  password_hash: string;
  color: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  // Login
  email = '';
  password_hash = '';
  erro = signal<string | null>(null);
  loading = signal(false);

  // Registo
  mostrarRegisto = signal(false);
  erroRegisto = signal<string | null>(null);
  sucessoRegisto = signal(false);
  loadingRegisto = signal(false);
  registo = {
    nome_completo: '',
    email: '',
    password_hash: '',
    confirmar_password: '',
    tipo_utilizador: '',
    cedula_profissional: '',
    turno_trabalho: ''
  };

  readonly quickUsers: QuickUser[] = [
    { label: 'Admin',      role: 'Administrador',    email: 'diogo@infmed.com',   password_hash: 'diogo123', color: 'admin' },
    { label: 'Enfermeiro', role: 'Enfermeiro Gestor', email: 'xavier@hospital.pt', password_hash: '123456',   color: 'enf'   },
    { label: 'Auxiliar',   role: 'Aux. Limpeza',      email: 'artur@hospital.com', password_hash: 'artur123', color: 'aux'   },
  ];

  // Validações do nome: sem números
  get nomeValido(): boolean {
    return /^[^\d]+$/.test(this.registo.nome_completo.trim()) && this.registo.nome_completo.trim().length >= 3;
  }

  // Formato de email válido
  get emailValido(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.registo.email.trim());
  }

  // Password match
  get passwordsIguais(): boolean {
    return this.registo.password_hash === this.registo.confirmar_password;
  }

  // Mostrar/ocultar campos conforme tipo
  get mostrarCedula(): boolean {
    return this.registo.tipo_utilizador === 'enfermeiro_gestor';
  }

  get mostrarTurno(): boolean {
    return this.registo.tipo_utilizador === 'auxiliar_limpeza';
  }

  constructor(private auth: AuthService, private router: Router, private http: HttpClient) {}

  quickLogin(user: QuickUser) {
    this.email = user.email;
    this.password_hash = user.password_hash;
    this.submit();
  }

  onSubmit() { this.submit(); }

  private submit() {
    this.erro.set(null);
    this.loading.set(true);
    this.auth.login({ email: this.email, password_hash: this.password_hash }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => {
        this.erro.set(e.error?.error ?? 'Email ou password incorretos.');
        this.loading.set(false);
      }
    });
  }

  abrirRegisto() {
    this.registo = { nome_completo: '', email: '', password_hash: '', confirmar_password: '', tipo_utilizador: '', cedula_profissional: '', turno_trabalho: '' };
    this.erroRegisto.set(null);
    this.sucessoRegisto.set(false);
    this.mostrarRegisto.set(true);
  }

  submeterRegisto() {
    this.erroRegisto.set(null);

    if (!this.nomeValido) {
      this.erroRegisto.set('O nome não pode conter números.');
      return;
    }
    if (!this.emailValido) {
      this.erroRegisto.set('Introduz um email com formato válido (ex: nome@hospital.pt).');
      return;
    }
    if (!this.passwordsIguais) {
      this.erroRegisto.set('As passwords não coincidem.');
      return;
    }
    if (this.registo.password_hash.length < 6) {
      this.erroRegisto.set('A password deve ter pelo menos 6 caracteres.');
      return;
    }

    const payload: any = {
      nome_completo: this.registo.nome_completo.trim(),
      email: this.registo.email.trim(),
      password_hash: this.registo.password_hash,
      tipo_utilizador: this.registo.tipo_utilizador,
    };
    if (this.mostrarCedula && this.registo.cedula_profissional)
      payload.cedula_profissional = this.registo.cedula_profissional;
    if (this.mostrarTurno && this.registo.turno_trabalho)
      payload.turno_trabalho = this.registo.turno_trabalho;

    this.loadingRegisto.set(true);
    this.http.post('/api/users/register', payload).subscribe({
      next: () => {
        this.loadingRegisto.set(false);
        this.sucessoRegisto.set(true);
      },
      error: (e) => {
        this.loadingRegisto.set(false);
        this.erroRegisto.set(e.error?.error ?? 'Erro ao criar conta.');
      }
    });
  }
}
