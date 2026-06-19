import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { DashboardResumo } from './dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private readonly http: HttpClient) {}

  obterResumo(): Observable<DashboardResumo> {
    return this.http.get<DashboardResumo>(`${environment.apiUrl}/dashboard`);
  }
}
