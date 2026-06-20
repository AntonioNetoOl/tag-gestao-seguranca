import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PagedResponse } from '../../core/models/paged-response.model';
import { Usuario, UsuarioListagemParams, UsuarioRequest } from './usuarios.models';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/usuarios`;

  listar(params: UsuarioListagemParams): Observable<PagedResponse<Usuario>> {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('pageSize', params.pageSize);

    if (params.busca) httpParams = httpParams.set('busca', params.busca);
    if (params.perfil) httpParams = httpParams.set('perfil', params.perfil);
    if (params.ativo !== undefined) httpParams = httpParams.set('ativo', params.ativo);

    return this.http.get<PagedResponse<Usuario>>(this.apiUrl, { params: httpParams });
  }

  criar(request: UsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, request);
  }

  atualizar(id: string, request: UsuarioRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, request);
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  restaurar(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/ativar`, {});
  }
}
