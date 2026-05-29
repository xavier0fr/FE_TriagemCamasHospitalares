export type TipoUtilizador = 'enfermeiro_gestor' | 'auxiliar_limpeza' | 'admin';

export interface User {
  _id: string;
  nome_completo: string;
  email: string;
  tipo_utilizador: TipoUtilizador;
  cedula_profissional?: string;
  turno_trabalho?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password_hash: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
