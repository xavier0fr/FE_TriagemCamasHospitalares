import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CamaService } from '../../core/services/cama.service';
import { Cama } from '../../core/models/cama.model';

@Component({
  selector: 'app-camas',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './camas.component.html',
  styleUrl: './camas.component.scss'
})
export class CamasComponent implements OnInit {
  camas = signal<Cama[]>([]);
  loading = signal(true);
  erro = signal<string | null>(null);

  constructor(public auth: AuthService, private camaService: CamaService) {}

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.loading.set(true);
    this.camaService.getAll().subscribe({
      next: c => { this.camas.set(c); this.loading.set(false); },
      error: () => { this.erro.set('Erro ao carregar camas.'); this.loading.set(false); }
    });
  }

  higienizar(id: string) {
    this.camaService.higienizar(id).subscribe(() => this.carregar());
  }

  badgeOcupacao(estado: string) {
    return estado === 'Livre' ? 'badge-livre' : 'badge-ocupada';
  }

  badgeLimpeza(estado: string) {
    if (estado === 'Limpa') return 'badge-limpa';
    if (estado === 'Suja') return 'badge-suja';
    return 'badge-aguardar';
  }
}
