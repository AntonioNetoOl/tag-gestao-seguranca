import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ConfirmarPagamentoRequest,
  PagamentoConfirmado,
  PagamentoPendenteDetalhe,
  PagamentoPendenteResumo,
  PagamentosConfirmadosResponse
} from './pagamentos.models';

@Injectable({ providedIn: 'root' })
export class PagamentosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/pagamentos`;

  listarPendentes(busca?: string): Observable<PagamentoPendenteResumo[]> {
    let params = new HttpParams();
    if (busca?.trim()) params = params.set('busca', busca.trim());
    return this.http.get<PagamentoPendenteResumo[]>(`${this.apiUrl}/pendentes`, { params });
  }

  obterPendente(funcionarioId: string): Observable<PagamentoPendenteDetalhe> {
    return this.http.get<PagamentoPendenteDetalhe>(`${this.apiUrl}/pendentes/${funcionarioId}`);
  }

  confirmar(request: ConfirmarPagamentoRequest): Observable<PagamentoConfirmado> {
    return this.http.post<PagamentoConfirmado>(`${this.apiUrl}/confirmar`, request);
  }

  listarConfirmados(filtros: {
    busca?: string;
    dataInicio?: string;
    dataFim?: string;
    page: number;
    pageSize: number;
  }): Observable<PagamentosConfirmadosResponse> {
    let params = new HttpParams()
      .set('page', filtros.page)
      .set('pageSize', filtros.pageSize);

    if (filtros.busca?.trim()) params = params.set('busca', filtros.busca.trim());
    if (filtros.dataInicio) params = params.set('dataInicio', filtros.dataInicio);
    if (filtros.dataFim) params = params.set('dataFim', filtros.dataFim);

    return this.http.get<PagamentosConfirmadosResponse>(this.apiUrl, { params });
  }

  obterConfirmado(id: string): Observable<PagamentoConfirmado> {
    return this.http.get<PagamentoConfirmado>(`${this.apiUrl}/${id}`);
  }
}
