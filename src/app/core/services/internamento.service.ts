import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CriarInternamentoRequest, Internamento } from '../models/internamento.model';

@Injectable({ providedIn: 'root' })
export class InternamentoService {
  private readonly base = '/api/internamentos';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Internamento[]>(this.base);
  }

  getAtivos() {
    return this.http.get<Internamento[]>(`${this.base}/ativos`);
  }

  getById(id: string) {
    return this.http.get<Internamento>(`${this.base}/${id}`);
  }

  criar(data: CriarInternamentoRequest) {
    return this.http.post<Internamento>(this.base, data);
  }

  darAlta(id: string) {
    return this.http.put<Internamento>(`${this.base}/${id}/alta`, {});
  }
}
