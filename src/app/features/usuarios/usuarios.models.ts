export type UsuarioPerfil = 'Master' | 'Administrador' | 'Operador';
export type UsuarioStatusFiltro = 'todos' | 'ativos' | 'excluidos';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: UsuarioPerfil;
  ativo: boolean;
  dataCriacao: string;
}

export interface UsuarioRequest {
  nome: string;
  email: string;
  perfil: UsuarioPerfil;
  senha?: string | null;
}

export interface UsuarioListagemParams {
  busca?: string;
  perfil?: UsuarioPerfil;
  ativo?: boolean;
  page: number;
  pageSize: number;
}
