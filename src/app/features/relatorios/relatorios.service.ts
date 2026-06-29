import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { RelatorioEscalaFiltros, RelatorioPagamentoFiltros } from './relatorios.models';

@Injectable({ providedIn: 'root' })
export class RelatoriosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/relatorios`;

  exportarEscalasExcel(filtros: RelatorioEscalaFiltros): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/escalas/excel`, {
      params: this.montarParamsEscala(filtros),
      responseType: 'blob'
    });
  }

  exportarEscalasPdf(filtros: RelatorioEscalaFiltros): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/escalas/pdf`, {
      params: this.montarParamsEscala(filtros),
      responseType: 'blob'
    });
  }

  exportarPagamentosExcel(filtros: RelatorioPagamentoFiltros): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/pagamentos/excel`, {
      params: this.montarParamsPagamento(filtros),
      responseType: 'blob'
    });
  }

  exportarPagamentosPdf(filtros: RelatorioPagamentoFiltros): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/pagamentos/pdf`, {
      params: this.montarParamsPagamento(filtros),
      responseType: 'blob'
    });
  }

  private montarParamsEscala(filtros: RelatorioEscalaFiltros): HttpParams {
    let params = new HttpParams()
      .set('dataInicio', filtros.dataInicio)
      .set('dataFim', filtros.dataFim);

    if (filtros.casaId) params = params.set('casaId', filtros.casaId);
    if (filtros.nomeEvento?.trim()) params = params.set('nomeEvento', filtros.nomeEvento.trim());

    return params;
  }

  private montarParamsPagamento(filtros: RelatorioPagamentoFiltros): HttpParams {
    let params = new HttpParams()
      .set('dataInicio', filtros.dataInicio)
      .set('dataFim', filtros.dataFim);

    if (filtros.busca?.trim()) params = params.set('busca', filtros.busca.trim());

    return params;
  }
}
