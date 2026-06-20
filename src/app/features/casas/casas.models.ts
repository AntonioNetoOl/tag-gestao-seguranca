export interface Casa {
  id: string;
  nome: string;
  endereco: string;
  cep: string | null;
  dataCriacao: string;
  dataAlteracao: string | null;
}

export interface CasaRequest {
  nome: string;
  endereco: string;
  cep: string | null;
}

export interface CasaOpcao {
  id: string;
  nome: string;
}

export interface CasaListagemParams {
  busca?: string;
  page: number;
  pageSize: number;
}
