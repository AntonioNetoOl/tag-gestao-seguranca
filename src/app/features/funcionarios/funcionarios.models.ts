export interface Funcionario {
  id: string;
  nomeCompleto: string;
  rg: string;
  cpf: string;
  chavePix: string | null;
  telefone: string | null;
  email: string | null;
  funcaoFuncionarioId: string | null;
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
  funcaoFuncionarioId: string;
  funcao: string;
}

export interface FuncionarioOpcao {
  id: string;
  nome: string;
}

export type FiltroAtivoFuncionario = 'todos' | 'ativos' | 'inativos';

export interface FuncionarioListagemParams {
  busca?: string;
  ativo?: boolean;
  page: number;
  pageSize: number;
}
