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
        loadComponent: () => import('./features/funcionarios').then((m) => m.FuncionariosComponent)
      },
      {
        path: 'funcoes-funcionario',
        loadComponent: () => import('./features/funcoes-funcionario').then((m) => m.FuncoesFuncionarioComponent)
      },
      {
        path: 'casas',
        loadComponent: () => import('./features/casas').then((m) => m.CasasComponent)
      },
      {
        path: 'tipos-evento',
        loadComponent: () => import('./features/tipos-evento').then((m) => m.TiposEventoComponent)
      },
      {
        path: 'usuarios',
        loadComponent: carregarPlaceholder,
        data: {
          eyebrow: 'Cadastros',
          title: 'Usuários',
          description: 'Tela reservada para o cadastro de usuários.'
        }
      },
      {
        path: 'eventos',
        loadComponent: carregarPlaceholder,
        data: {
          eyebrow: 'Operação',
          title: 'Eventos',
          description: 'Planejamento e acompanhamento dos eventos.'
        }
      },
      {
        path: 'pagamentos',
        loadComponent: carregarPlaceholder,
        data: {
          eyebrow: 'Financeiro',
          title: 'Pagamentos',
          description: 'Controle de pagamentos.'
        }
      },
      {
        path: 'relatorios',
        loadComponent: carregarPlaceholder,
        data: {
          eyebrow: 'Gestão',
          title: 'Relatórios',
          description: 'Exportações e consultas consolidadas.'
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
