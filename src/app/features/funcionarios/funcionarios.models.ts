export interface Funcionario {
  id: string;
  nomeCompleto: string;
  rg: string;
  cpf: string;
  chavePix: string | null;
  telefone: string | null;
  email: string | null;
  funcao: string;
  ativo: boolean;
  dataCriacao: string;
  dataAlteracao: string | null;
}

export interface FuncionarioRequest {
  nomeCompleto: string;
  rg: string;
  cpf: string;
  chavePix: string | null;
  telefone: string | null;
  email: string | null;
  funcao: string;
}

export type FiltroAtivoFuncionario = 'todos' | 'ativos' | 'inativos';

export interface FuncionarioListagemParams {
  busca?: string;
  ativo?: boolean;
  page: number;
  pageSize: number;
}
