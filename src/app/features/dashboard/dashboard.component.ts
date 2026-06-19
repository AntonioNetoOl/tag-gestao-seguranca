import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { obterMensagemErroApi } from '../../core/api/api-error.util';
import { DashboardProximoEvento, DashboardResumo } from './dashboard.models';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  resumo: DashboardResumo | null = null;
  carregando = true;
  erro = '';

  constructor(private readonly dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.carregarDashboard();
  }

  carregarDashboard(): void {
    this.carregando = true;
    this.erro = '';

    this.dashboardService.obterResumo().subscribe({
      next: (resumo) => {
        this.resumo = resumo;
        this.carregando = false;
      },
      error: (error: unknown) => {
        this.erro = obterMensagemErroApi(error);
        this.carregando = false;
      }
    });
  }

  formatarHorario(valor: string): string {
    return valor ? valor.substring(0, 5) : '--:--';
  }

  classeStatus(evento: DashboardProximoEvento): string {
    const status = evento.status.toLowerCase();

    if (status === 'finalizado') {
      return 'tag-badge-success';
    }

    if (status === 'cancelado') {
      return 'tag-badge-danger';
    }

    if (status === 'escalado') {
      return 'tag-badge-info';
    }

    return 'tag-badge-neutral';
  }
}
