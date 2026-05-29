import { Cama } from './cama.model';
import { Doente } from './doente.model';
import { User } from './user.model';

export interface Internamento {
  _id: string;
  data_hora_entrada: string;
  data_hora_alta: string | null;
  motivo_internamento: string;
  doente: string | Doente;
  cama: string | Cama;
  enfermeiro_registo: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface CriarInternamentoRequest {
  motivo_internamento: string;
  doente: string;
  cama: string;
}
