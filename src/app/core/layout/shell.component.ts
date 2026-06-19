import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../auth/auth.service';

type MenuItem = {
  label: string;
  route: string;
  icon: string;
};

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css'
})
export class ShellComponent {
  private readonly authService = inject(AuthService);

  readonly usuario = this.authService.usuarioAtual;

  sidebarCompacta = false;
  cadastrosAberto = true;

  readonly dashboardItem: MenuItem = { label: 'Dashboard', route: '/dashboard', icon: 'D' };

  readonly cadastrosMenu: MenuItem[] = [
    { label: 'Funcionários', route: '/funcionarios', icon: 'F' },
    { label: 'Casas', route: '/casas', icon: 'C' },
    { label: 'Tipos', route: '/tipos-evento', icon: 'T' }
  ];

  readonly operacaoMenu: MenuItem[] = [
    { label: 'Eventos', route: '/eventos', icon: 'E' },
    { label: 'Pagamentos', route: '/pagamentos', icon: 'P' },
    { label: 'Relatórios', route: '/relatorios', icon: 'R' }
  ];

  alternarMenu(): void {
    this.sidebarCompacta = !this.sidebarCompacta;
  }

  alternarCadastros(): void {
    if (this.sidebarCompacta) {
      this.sidebarCompacta = false;
      this.cadastrosAberto = true;
      return;
    }

    this.cadastrosAberto = !this.cadastrosAberto;
  }

  sair(): void {
    this.authService.logout();
  }
}
