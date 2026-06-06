import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AndarHospital, QuartoHospital } from '../models/infraestrutura.model';

@Injectable({ providedIn: 'root' })
export class InfraestruturaService {
  constructor(private http: HttpClient) {}

  getAndares() {
    return this.http.get<AndarHospital[]>('/api/infraestrutura/andares');
  }

  getQuartos() {
    return this.http.get<QuartoHospital[]>('/api/infraestrutura/quartos');
  }

  criarAndar(data: { numero_piso: number; nome_ala: string }) {
    return this.http.post<AndarHospital>('/api/infraestrutura/andar', data);
  }

  criarQuarto(data: { numero_quarto: string; capacidade_maxima: number; tipo_quarto: string; andar_id: string }) {
    return this.http.post('/api/infraestrutura/quarto', data);
  }
}
