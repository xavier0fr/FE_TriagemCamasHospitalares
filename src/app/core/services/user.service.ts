import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Utilizador {
  _id: string;
  nome_completo: string;
  email: string;
  tipo_utilizador: string;
  cedula_profissional: string;
  turno_trabalho: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Utilizador[]>('/api/users');
  }

  criar(data: Omit<Utilizador, '_id'> & { password_hash: string }) {
    return this.http.post<Utilizador>('/api/users/register', data);
  }
}
