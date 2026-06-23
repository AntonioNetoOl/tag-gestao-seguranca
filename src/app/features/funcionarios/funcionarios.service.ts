import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PagedResponse } from '../../core/models/paged-response.model';
import { Funcionario, FuncionarioListagemParams, FuncionarioRequest } from './funcionarios.models';

@Injectable({
  providedIn: 'root'
})
export class FuncionariosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/funcionarios`;

  listar(params: FuncionarioListagemParams): Observable<PagedResponse<Funcionario>> {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('pageSize', params.pageSize);

    if (params.busca) {
      httpParams = httpParams.set('busca', params.busca);
    }

    httpParams = httpParams.set('ativo', params.ativo ?? true);

    return this.http.get<PagedResponse<Funcionario>>(this.apiUrl, { params: httpParams });
  }

  criar(request: FuncionarioRequest): Observable<Funcionario> {
    return this.http.post<Funcionario>(this.apiUrl, request);
  }

  atualizar(id: string, request: FuncionarioRequest): Observable<Funcionario> {
    return this.http.put<Funcionario>(`${this.apiUrl}/${id}`, request);
  }

  inativar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  ativar(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/ativar`, null);
  }
}
