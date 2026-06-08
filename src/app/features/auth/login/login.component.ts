import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  email = '';
  password_hash = '';
  erro = signal<string | null>(null);
  loading = signal(false);

  readonly quickUsers: QuickUser[] = [
    { label: 'Admin', role: 'Administrador', email: 'diogo@infmed.com', password_hash: 'diogo123', color: 'admin' },
    { label: 'Enfermeiro', role: 'Enfermeiro Gestor', email: 'xavier@hospital.pt', password_hash: '123456', color: 'enf' },
    { label: 'Auxiliar', role: 'Aux. Limpeza', email: 'artur@hospital.com', password_hash: 'artur123', color: 'aux' },
  ];

  constructor(private auth: AuthService, private router: Router) {}

  quickLogin(user: QuickUser) {
    this.email = user.email;
    this.password_hash = user.password_hash;
    this.submit();
  }

  onSubmit() {
    this.submit();
  }

  private submit() {
    this.erro.set(null);
    this.loading.set(true);
    this.auth.login({ email: this.email, password_hash: this.password_hash }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.erro.set('Email ou password incorretos.');
        this.loading.set(false);
      }
    });
  }
}
