import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Prioridade {
  _id: string;
  cama: any;
  criado_por: any;
  activo: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class PrioridadeService {
  private readonly base = '/api/prioridades';

  constructor(private http: HttpClient) {}

  getAtivas() {
    return this.http.get<Prioridade[]>(this.base);
  }

  criar(cama_id: string) {
    return this.http.post<Prioridade>(this.base, { cama_id });
  }

  dispensar(id: string) {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
}
