export interface Especialidade {
  _id: string;
  nome_especialidade: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AndarHospital {
  _id: string;
  numero_piso: number;
  nome_ala: string;
  especialidades: Especialidade[];
  createdAt?: string;
  updatedAt?: string;
}

export interface QuartoHospital {
  _id: string;
  numero_quarto: string;
  capacidade_maxima: number;
  tipo_quarto: string;
  andar: AndarHospital | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SugestaoResponse {
  sugestao: any;
  total_disponiveis: number;
  opcoes: any[];
}
