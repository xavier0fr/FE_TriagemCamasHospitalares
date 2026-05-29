import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cama } from '../models/cama.model';

@Injectable({ providedIn: 'root' })
export class CamaService {
  private readonly base = '/api/camas';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Cama[]>(this.base);
  }

  getById(id: string) {
    return this.http.get<Cama>(`${this.base}/${id}`);
  }

  higienizar(id: string) {
    return this.http.put<Cama>(`${this.base}/${id}/higienizar`, {});
  }

  create(data: Partial<Cama>) {
    return this.http.post<Cama>(this.base, data);
  }

  update(id: string, data: Partial<Cama>) {
    return this.http.put<Cama>(`${this.base}/${id}`, data);
  }

  delete(id: string) {
    return this.http.delete<Cama>(`${this.base}/${id}`);
  }
}
