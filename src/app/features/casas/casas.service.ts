import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PagedResponse } from '../../core/models/paged-response.model';
import { Casa, CasaListagemParams, CasaRequest } from './casas.models';

@Injectable({ providedIn: 'root' })
export class CasasService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/casas`;

  listar(params: CasaListagemParams): Observable<PagedResponse<Casa>> {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('pageSize', params.pageSize);

    if (params.busca) {
      httpParams = httpParams.set('busca', params.busca);
    }

    return this.http.get<PagedResponse<Casa>>(this.apiUrl, { params: httpParams });
  }

  criar(request: CasaRequest): Observable<Casa> {
    return this.http.post<Casa>(this.apiUrl, request);
  }

  atualizar(id: string, request: CasaRequest): Observable<Casa> {
    return this.http.put<Casa>(`${this.apiUrl}/${id}`, request);
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
