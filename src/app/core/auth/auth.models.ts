export const AUTH_TOKEN_STORAGE_KEY = 'tag.auth.token';
export const AUTH_USER_STORAGE_KEY = 'tag.auth.user';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  nome: string;
  email: string;
  perfil: string;
}

export interface AuthUser {
  nome: string;
  email: string;
  perfil: string;
}
