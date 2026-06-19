import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css'
})
export class ShellComponent {
  readonly usuario = this.authService.usuarioAtual;

  readonly menu = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Funcionários', route: '/funcionarios' },
    { label: 'Casas', route: '/casas' },
    { label: 'Tipos de evento', route: '/tipos-evento' },
    { label: 'Eventos', route: '/eventos' },
    { label: 'Pagamentos', route: '/pagamentos' },
    { label: 'Relatórios', route: '/relatorios' }
  ];

  constructor(private readonly authService: AuthService) {}

  sair(): void {
    this.authService.logout();
  }
}
