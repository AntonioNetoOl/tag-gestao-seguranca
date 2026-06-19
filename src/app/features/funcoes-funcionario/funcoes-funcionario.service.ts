import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { FuncaoFuncionario, FuncaoFuncionarioOpcao, FuncaoFuncionarioRequest } from './funcoes-funcionario.models';

@Injectable({ providedIn: 'root' })
export class FuncoesFuncionarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/funcoes-funcionario`;

  listarOpcoes(): Observable<FuncaoFuncionarioOpcao[]> {
    return this.http.get<FuncaoFuncionarioOpcao[]>(`${this.apiUrl}/opcoes`);
  }

  criar(request: FuncaoFuncionarioRequest): Observable<FuncaoFuncionario> {
    return this.http.post<FuncaoFuncionario>(this.apiUrl, request);
  }
}
