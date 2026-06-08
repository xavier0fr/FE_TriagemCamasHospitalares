import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { DoenteService } from '../../core/services/doente.service';
import { Doente } from '../../core/models/doente.model';

@Component({
  selector: 'app-doentes',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './doentes.component.html',
  styleUrl: './doentes.component.scss'
})
export class DoenteComponent implements OnInit {
  doentes = signal<Doente[]>([]);
  loading = signal(true);
  modal = signal<'criar' | 'editar' | null>(null);
  editId = signal('');
  erro = signal<string | null>(null);

  form: Partial<Doente> = { numero_sns: '', nome_completo: '', data_nascimento: '', contacto_emergencia: '' };

  constructor(public auth: AuthService, private doenteService: DoenteService) {}

  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading.set(true);
    this.doenteService.getAll().subscribe({
      next: d => { this.doentes.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  abrirCriar() {
    this.form = { numero_sns: '', nome_completo: '', data_nascimento: '', contacto_emergencia: '' };
    this.erro.set(null);
    this.modal.set('criar');
  }

  abrirEditar(d: Doente) {
    this.editId.set(d._id);
    this.form = { numero_sns: d.numero_sns, nome_completo: d.nome_completo, data_nascimento: d.data_nascimento?.substring(0, 10), contacto_emergencia: d.contacto_emergencia };
    this.erro.set(null);
    this.modal.set('editar');
  }

  submeter() {
    this.erro.set(null);
    this.doenteService.create(this.form).subscribe({
      next: () => { this.modal.set(null); this.carregar(); },
      error: (e) => this.erro.set(e.error?.error ?? 'Erro ao registar doente.')
    });
  }

  submeterEditar() {
    this.erro.set(null);
    this.doenteService.update(this.editId(), this.form).subscribe({
      next: () => { this.modal.set(null); this.carregar(); },
      error: (e) => this.erro.set(e.error?.error ?? 'Erro ao editar doente.')
    });
  }

  apagar(d: Doente) {
    if (!confirm(`Apagar o doente "${d.nome_completo}" (SNS: ${d.numero_sns})?`)) return;
    this.doenteService.delete(d._id).subscribe(() => this.carregar());
  }

  fecharModal() { this.modal.set(null); this.erro.set(null); }

  idade(dataNasc: string): number {
    const diff = Date.now() - new Date(dataNasc).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }
}
