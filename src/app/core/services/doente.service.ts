import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Doente } from '../models/doente.model';

@Injectable({ providedIn: 'root' })
export class DoenteService {
  private readonly base = '/api/doentes';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Doente[]>(this.base);
  }

  getById(id: string) {
    return this.http.get<Doente>(`${this.base}/${id}`);
  }

  getBySns(sns: string) {
    return this.http.get<Doente>(`${this.base}/sns/${sns}`);
  }

  create(data: Partial<Doente>) {
    return this.http.post<Doente>(this.base, data);
  }

  update(id: string, data: Partial<Doente>) {
    return this.http.put<Doente>(`${this.base}/${id}`, data);
  }

  delete(id: string) {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
}
