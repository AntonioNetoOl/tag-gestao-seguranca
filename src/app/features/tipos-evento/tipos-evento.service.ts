import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PagedResponse } from '../../core/models/paged-response.model';
import { TipoEvento, TipoEventoListagemParams, TipoEventoOpcao, TipoEventoRequest } from './tipos-evento.models';

@Injectable({ providedIn: 'root' })
export class TiposEventoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/tipos-evento`;

  listar(params: TipoEventoListagemParams): Observable<PagedResponse<TipoEvento>> {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('pageSize', params.pageSize);

    if (params.busca) {
      httpParams = httpParams.set('busca', params.busca);
    }

    httpParams = httpParams.set('ativo', params.ativo ?? true);

    return this.http.get<PagedResponse<TipoEvento>>(this.apiUrl, { params: httpParams });
  }

  listarOpcoes(): Observable<TipoEventoOpcao[]> {
    return this.http.get<TipoEventoOpcao[]>(`${this.apiUrl}/opcoes`);
  }

  criar(request: TipoEventoRequest): Observable<TipoEvento> {
    return this.http.post<TipoEvento>(this.apiUrl, request);
  }

  atualizar(id: string, request: TipoEventoRequest): Observable<TipoEvento> {
    return this.http.put<TipoEvento>(`${this.apiUrl}/${id}`, request);
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  restaurar(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/ativar`, {});
  }
}
