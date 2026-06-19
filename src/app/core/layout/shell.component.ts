import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { MenuIconComponent, MenuIconName } from './menu-icon.component';

type MenuItem = {
  label: string;
  route: string;
  icon: MenuIconName;
};

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MenuIconComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css'
})
export class ShellComponent {
  private readonly authService = inject(AuthService);

  readonly usuario = this.authService.usuarioAtual;

  sidebarCompacta = false;
  cadastrosAberto = true;

  readonly dashboardItem: MenuItem = { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' };
  readonly cadastrosIcon: MenuIconName = 'cadastros';

  readonly cadastrosMenu: MenuItem[] = [
    { label: 'Funcionários', route: '/funcionarios', icon: 'funcionarios' },
    { label: 'Casas', route: '/casas', icon: 'casas' },
    { label: 'Tipos de evento', route: '/tipos-evento', icon: 'tipos-evento' },
    { label: 'Usuários', route: '/usuarios', icon: 'usuarios' }
  ];

  readonly operacaoMenu: MenuItem[] = [
    { label: 'Eventos', route: '/eventos', icon: 'eventos' },
    { label: 'Pagamentos', route: '/pagamentos', icon: 'pagamentos' },
    { label: 'Relatórios', route: '/relatorios', icon: 'relatorios' }
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
