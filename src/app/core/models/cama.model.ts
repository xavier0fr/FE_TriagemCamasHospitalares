export type EstadoOcupacao = 'Livre' | 'Ocupada';
export type EstadoLimpeza = 'Limpa' | 'Suja' | 'A Aguardar';

export interface Cama {
  _id: string;
  codigo_cama: string;
  estado_ocupacao: EstadoOcupacao;
  estado_limpeza: EstadoLimpeza;
  quarto: string | Quarto;
  ultimo_limpador?: string | { nome_completo: string };
  iniciado_por?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quarto {
  _id: string;
  numero_quarto: string;
  andar: string | Andar;
}

export interface Andar {
  _id: string;
  numero_andar: number;
  especialidade: string | Especialidade;
}

export interface Especialidade {
  _id: string;
  nome: string;
}
