import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PagedResponse } from '../../core/models/paged-response.model';
import {
  Evento,
  EventoFuncionario,
  EventoFuncionarioRequest,
  EventoListagemParams,
  EventoRequest,
  RemoverFuncionarioEventoRequest,
  SubstituirFuncionarioEventoRequest
} from './eventos.models';

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

  obter(id: string): Observable<Evento> {
    return this.http.get<Evento>(`${this.apiUrl}/${id}`);
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

  listarFuncionarios(eventoId: string, incluirRemovidos = false): Observable<EventoFuncionario[]> {
    const params = new HttpParams().set('incluirRemovidos', incluirRemovidos);
    return this.http.get<EventoFuncionario[]>(`${this.apiUrl}/${eventoId}/funcionarios`, { params });
  }

  adicionarFuncionario(eventoId: string, request: EventoFuncionarioRequest): Observable<EventoFuncionario> {
    return this.http.post<EventoFuncionario>(`${this.apiUrl}/${eventoId}/funcionarios`, request);
  }

  removerFuncionario(eventoId: string, funcionarioId: string, request: RemoverFuncionarioEventoRequest): Observable<void> {
    return this.http.request<void>('DELETE', `${this.apiUrl}/${eventoId}/funcionarios/${funcionarioId}`, { body: request });
  }

  substituirFuncionario(eventoId: string, request: SubstituirFuncionarioEventoRequest): Observable<EventoFuncionario> {
    return this.http.post<EventoFuncionario>(`${this.apiUrl}/${eventoId}/funcionarios/substituir`, request);
  }
}
