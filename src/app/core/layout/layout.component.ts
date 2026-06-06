import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  constructor(public auth: AuthService) {}

  get userInitial(): string {
    return this.auth.user()?.nome_completo?.charAt(0)?.toUpperCase() ?? '?';
  }

  get roleLabel(): string {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      enfermeiro_gestor: 'Enfermeiro Gestor',
      auxiliar_limpeza: 'Auxiliar de Limpeza'
    };
    return labels[this.auth.role() ?? ''] ?? '';
  }

  logout() {
    this.auth.logout();
  }
}
