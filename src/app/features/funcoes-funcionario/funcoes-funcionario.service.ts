import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PagedResponse } from '../../core/models/paged-response.model';
import {
  FuncaoFuncionario,
  FuncaoFuncionarioListagemParams,
  FuncaoFuncionarioOpcao,
  FuncaoFuncionarioRequest
} from './funcoes-funcionario.models';

@Injectable({ providedIn: 'root' })
export class FuncoesFuncionarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/funcoes-funcionario`;

  listar(params: FuncaoFuncionarioListagemParams): Observable<PagedResponse<FuncaoFuncionario>> {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('pageSize', params.pageSize);

    if (params.busca) {
      httpParams = httpParams.set('busca', params.busca);
    }

    httpParams = httpParams.set('ativo', params.ativo ?? true);

    return this.http.get<PagedResponse<FuncaoFuncionario>>(this.apiUrl, { params: httpParams });
  }

  listarOpcoes(): Observable<FuncaoFuncionarioOpcao[]> {
    return this.http.get<FuncaoFuncionarioOpcao[]>(`${this.apiUrl}/opcoes`);
  }

  criar(request: FuncaoFuncionarioRequest): Observable<FuncaoFuncionario> {
    return this.http.post<FuncaoFuncionario>(this.apiUrl, request);
  }

  atualizar(id: string, request: FuncaoFuncionarioRequest): Observable<FuncaoFuncionario> {
    return this.http.put<FuncaoFuncionario>(`${this.apiUrl}/${id}`, request);
  }

  inativar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  ativar(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/ativar`, {});
  }
}
