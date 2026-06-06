import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InfraestruturaService } from '../../core/services/infraestrutura.service';
import { AndarHospital, QuartoHospital } from '../../core/models/infraestrutura.model';

@Component({
  selector: 'app-infraestrutura',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './infraestrutura.component.html',
  styleUrl: './infraestrutura.component.scss'
})
export class InfraestruturaComponent implements OnInit {
  andares = signal<AndarHospital[]>([]);
  quartos = signal<QuartoHospital[]>([]);
  mostrarFormAndar = signal(false);
  mostrarFormQuarto = signal(false);
  erroAndar = signal<string | null>(null);
  erroQuarto = signal<string | null>(null);

  formAndar = { numero_piso: null as number | null, nome_ala: '' };
  formQuarto = { numero_quarto: '', capacidade_maxima: 1, tipo_quarto: '', andar_id: '' };

  constructor(private infra: InfraestruturaService) {}

  ngOnInit() { this.carregar(); }

  carregar() {
    this.infra.getAndares().subscribe(a => this.andares.set(a));
    this.infra.getQuartos().subscribe(q => this.quartos.set(q));
  }

  submeterAndar() {
    this.erroAndar.set(null);
    this.infra.criarAndar({ numero_piso: this.formAndar.numero_piso!, nome_ala: this.formAndar.nome_ala }).subscribe({
      next: () => {
        this.mostrarFormAndar.set(false);
        this.formAndar = { numero_piso: null, nome_ala: '' };
        this.carregar();
      },
      error: (e) => this.erroAndar.set(e.error?.error ?? 'Erro ao criar andar.')
    });
  }

  submeterQuarto() {
    this.erroQuarto.set(null);
    this.infra.criarQuarto(this.formQuarto).subscribe({
      next: () => {
        this.mostrarFormQuarto.set(false);
        this.formQuarto = { numero_quarto: '', capacidade_maxima: 1, tipo_quarto: '', andar_id: '' };
        this.carregar();
      },
      error: (e) => this.erroQuarto.set(e.error?.error ?? 'Erro ao criar quarto.')
    });
  }

  nomeAndar(quarto: QuartoHospital): string {
    return typeof quarto.andar === 'object' ? `Piso ${quarto.andar.numero_piso} — ${quarto.andar.nome_ala}` : quarto.andar;
  }

  countQuartos(andarId: string): number {
    return this.quartos().filter(q => {
      const id = typeof q.andar === 'object' ? q.andar._id : q.andar;
      return id === andarId;
    }).length;
  }
}
