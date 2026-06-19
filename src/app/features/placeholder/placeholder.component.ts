import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './placeholder.component.html',
  styleUrl: './placeholder.component.css'
})
export class PlaceholderComponent {
  private readonly route = inject(ActivatedRoute);

  readonly eyebrow = this.route.snapshot.data['eyebrow'] as string;
  readonly title = this.route.snapshot.data['title'] as string;
  readonly description = this.route.snapshot.data['description'] as string;

  readonly pontos = [
    'Tela preparada para receber listagem, filtros e paginação da API.',
    'Estado visual isolado por rota para evitar reaproveitamento indevido de tela.',
    'Base de cartões, bordas e ações pronta para os próximos CRUDs.'
  ];
}
