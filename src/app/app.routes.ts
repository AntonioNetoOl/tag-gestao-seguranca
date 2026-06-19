import { Routes } from '@angular/router';

import { authChildGuard, authGuard } from './core/auth/auth.guard';
import { ShellComponent } from './core/layout/shell.component';

const carregarPlaceholder = () =>
  import('./features/placeholder/placeholder.component').then((m) => m.PlaceholderComponent);

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'funcionarios',
        loadComponent: carregarPlaceholder,
        data: {
          eyebrow: 'Cadastros',
          title: 'Funcionários',
          description: 'Cadastro e manutenção da equipe operacional, com dados pessoais, status e informações necessárias para escalação.'
        }
      },
      {
        path: 'casas',
        loadComponent: carregarPlaceholder,
        data: {
          eyebrow: 'Cadastros',
          title: 'Casas',
          description: 'Cadastro das casas e locais de evento usados no planejamento das operações de segurança.'
        }
      },
      {
        path: 'tipos-evento',
        loadComponent: carregarPlaceholder,
        data: {
          eyebrow: 'Cadastros',
          title: 'Tipos de evento',
          description: 'Configuração dos tipos de evento para padronizar agenda, escala, pagamentos e relatórios.'
        }
      },
      {
        path: 'eventos',
        loadComponent: carregarPlaceholder,
        data: {
          eyebrow: 'Operação',
          title: 'Eventos',
          description: 'Planejamento e acompanhamento dos eventos, incluindo datas, horários, status e equipe vinculada.'
        }
      },
      {
        path: 'pagamentos',
        loadComponent: carregarPlaceholder,
        data: {
          eyebrow: 'Financeiro',
          title: 'Pagamentos',
          description: 'Controle de pagamentos pendentes e realizados para funcionários escalados nos eventos.'
        }
      },
      {
        path: 'relatorios',
        loadComponent: carregarPlaceholder,
        data: {
          eyebrow: 'Gestão',
          title: 'Relatórios',
          description: 'Exportações e consultas consolidadas para operação, financeiro e acompanhamento gerencial.'
        }
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
