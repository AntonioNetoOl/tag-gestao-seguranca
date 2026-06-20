export interface TipoEvento {
  id: string;
  nome: string;
  ativo: boolean;
  dataCriacao: string;
  dataAlteracao: string | null;
}

export interface TipoEventoRequest {
  nome: string;
}

export type FiltroAtivoTipoEvento = 'todos' | 'ativos' | 'excluidos';

export interface TipoEventoListagemParams {
  busca?: string;
  ativo?: boolean;
  page: number;
  pageSize: number;
}
