import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_USER_STORAGE_KEY,
  AuthUser,
  LoginRequest,
  LoginResponse
} from './auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly usuarioAtual = signal<AuthUser | null>(this.carregarUsuario());

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, request)
      .pipe(tap((response) => this.salvarSessao(response)));
  }

  logout(): void {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    this.usuarioAtual.set(null);
    void this.router.navigateByUrl('/login');
  }

  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private salvarSessao(response: LoginResponse): void {
    const usuario: AuthUser = {
      nome: response.nome,
      email: response.email,
      perfil: response.perfil
    };

    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.token);
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(usuario));
    this.usuarioAtual.set(usuario);
  }

  private carregarUsuario(): AuthUser | null {
    const usuarioJson = localStorage.getItem(AUTH_USER_STORAGE_KEY);

    if (!usuarioJson) {
      return null;
    }

    try {
      return JSON.parse(usuarioJson) as AuthUser;
    } catch {
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      return null;
    }
  }
}
