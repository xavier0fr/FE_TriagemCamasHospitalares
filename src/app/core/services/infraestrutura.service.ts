import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AndarHospital, Especialidade, QuartoHospital } from '../models/infraestrutura.model';

@Injectable({ providedIn: 'root' })
export class InfraestruturaService {
  constructor(private http: HttpClient) {}

  // Andares
  getAndares() {
    return this.http.get<AndarHospital[]>('/api/infraestrutura/andares');
  }

  getAndarById(id: string) {
    return this.http.get<AndarHospital>(`/api/infraestrutura/andares/${id}`);
  }

  criarAndar(data: { numero_piso: number; nome_ala: string; especialidades?: string[] }) {
    return this.http.post<AndarHospital>('/api/infraestrutura/andar', data);
  }

  updateAndar(id: string, data: Partial<{ numero_piso: number; nome_ala: string; especialidades: string[] }>) {
    return this.http.put<AndarHospital>(`/api/infraestrutura/andares/${id}`, data);
  }

  deleteAndar(id: string) {
    return this.http.delete<{ message: string }>(`/api/infraestrutura/andares/${id}`);
  }

  // Quartos
  getQuartos() {
    return this.http.get<QuartoHospital[]>('/api/infraestrutura/quartos');
  }

  getQuartoById(id: string) {
    return this.http.get<QuartoHospital>(`/api/infraestrutura/quartos/${id}`);
  }

  criarQuarto(data: { numero_quarto: string; capacidade_maxima: number; tipo_quarto: string; andar_id: string }) {
    return this.http.post('/api/infraestrutura/quarto', data);
  }

  updateQuarto(id: string, data: Partial<QuartoHospital>) {
    return this.http.put<QuartoHospital>(`/api/infraestrutura/quartos/${id}`, data);
  }

  deleteQuarto(id: string) {
    return this.http.delete<{ message: string }>(`/api/infraestrutura/quartos/${id}`);
  }

  // Especialidades
  getEspecialidades() {
    return this.http.get<Especialidade[]>('/api/especialidades');
  }

  criarEspecialidade(data: { nome_especialidade: string }) {
    return this.http.post<Especialidade>('/api/especialidades', data);
  }

  updateEspecialidade(id: string, data: { nome_especialidade: string }) {
    return this.http.put<Especialidade>(`/api/especialidades/${id}`, data);
  }

  deleteEspecialidade(id: string) {
    return this.http.delete<{ message: string }>(`/api/especialidades/${id}`);
  }

  associarEspecialidade(andarId: string, especialidadeId: string) {
    return this.http.post<AndarHospital>('/api/especialidades/associar-andar', { andarId, especialidadeId });
  }

  desassociarEspecialidade(andarId: string, especialidadeId: string) {
    return this.http.delete<AndarHospital>('/api/especialidades/desassociar-andar', { body: { andarId, especialidadeId } });
  }
}
