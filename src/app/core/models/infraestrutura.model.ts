export interface AndarHospital {
  _id: string;
  numero_piso: number;
  nome_ala: string;
}

export interface QuartoHospital {
  _id: string;
  numero_quarto: string;
  capacidade_maxima: number;
  tipo_quarto: string;
  andar: AndarHospital | string;
}
