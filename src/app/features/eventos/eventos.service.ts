import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PagedResponse } from '../../core/models/paged-response.model';
import { Evento, EventoListagemParams, EventoRequest } from './eventos.models';

@Injectable({ providedIn: 'root' })
export class EventosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/eventos`;

  listar(params: EventoListagemParams): Observable<PagedResponse<Evento>> {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('pageSize', params.pageSize);

    if (params.casaId) httpParams = httpParams.set('casaId', params.casaId);
    if (params.dataInicio) httpParams = httpParams.set('dataInicio', params.dataInicio);
    if (params.dataFim) httpParams = httpParams.set('dataFim', params.dataFim);
    if (params.nome) httpParams = httpParams.set('nome', params.nome);
    if (params.status) httpParams = httpParams.set('status', params.status);

    return this.http.get<PagedResponse<Evento>>(this.apiUrl, { params: httpParams });
  }

  criar(request: EventoRequest): Observable<Evento> {
    return this.http.post<Evento>(this.apiUrl, request);
  }

  atualizar(id: string, request: EventoRequest): Observable<Evento> {
    return this.http.put<Evento>(`${this.apiUrl}/${id}`, request);
  }

  cancelar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
