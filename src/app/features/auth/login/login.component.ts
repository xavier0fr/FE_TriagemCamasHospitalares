import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

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

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
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
