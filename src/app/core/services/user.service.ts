import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Utilizador {
  _id: string;
  nome_completo: string;
  email: string;
  tipo_utilizador: string;
  cedula_profissional?: string;
  turno_trabalho?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Utilizador[]>('/api/users');
  }

  getById(id: string) {
    return this.http.get<Utilizador>(`/api/users/${id}`);
  }

  getMe() {
    return this.http.get<Utilizador>('/api/users/me');
  }

  criar(data: Omit<Utilizador, '_id'> & { password_hash: string }) {
    return this.http.post<Utilizador>('/api/users/register', data);
  }

  update(id: string, data: Partial<Omit<Utilizador, '_id'>>) {
    return this.http.put<Utilizador>(`/api/users/${id}`, data);
  }

  delete(id: string) {
    return this.http.delete<{ message: string }>(`/api/users/${id}`);
  }
}
