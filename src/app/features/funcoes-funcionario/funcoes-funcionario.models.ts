export interface FuncaoFuncionario {
  id: string;
  nome: string;
  ativo: boolean;
  dataCriacao: string;
  dataAlteracao: string | null;
}

export interface FuncaoFuncionarioRequest {
  nome: string;
}

export interface FuncaoFuncionarioOpcao {
  id: string;
  nome: string;
}

export type FiltroAtivoFuncaoFuncionario = 'todos' | 'ativos' | 'inativos';

export interface FuncaoFuncionarioListagemParams {
  busca?: string;
  ativo?: boolean;
  page: number;
  pageSize: number;
}
