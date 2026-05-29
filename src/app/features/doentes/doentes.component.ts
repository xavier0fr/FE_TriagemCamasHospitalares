import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DoenteService } from '../../core/services/doente.service';
import { Doente } from '../../core/models/doente.model';

@Component({
  selector: 'app-doentes',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './doentes.component.html',
  styleUrl: './doentes.component.scss'
})
export class DoenteComponent implements OnInit {
  doentes = signal<Doente[]>([]);
  loading = signal(true);
  mostrarFormulario = signal(false);

  form: Partial<Doente> = { numero_sns: '', nome_completo: '', data_nascimento: '', contacto_emergencia: '' };

  constructor(private doenteService: DoenteService) {}

  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading.set(true);
    this.doenteService.getAll().subscribe({
      next: d => { this.doentes.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  submeter() {
    this.doenteService.create(this.form).subscribe(() => {
      this.mostrarFormulario.set(false);
      this.form = { numero_sns: '', nome_completo: '', data_nascimento: '', contacto_emergencia: '' };
      this.carregar();
    });
  }

  idade(dataNasc: string): number {
    const diff = Date.now() - new Date(dataNasc).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }
}
