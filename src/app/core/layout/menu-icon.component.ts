import { Component, Input } from '@angular/core';

export type MenuIconName =
  | 'dashboard'
  | 'cadastros'
  | 'funcionarios'
  | 'casas'
  | 'tipos-evento'
  | 'usuarios'
  | 'eventos'
  | 'pagamentos'
  | 'relatorios';

@Component({
  selector: 'app-menu-icon',
  standalone: true,
  template: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      @switch (name) {
        @case ('dashboard') {
          <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h4A1.5 1.5 0 0 1 11 5.5v5A1.5 1.5 0 0 1 9.5 12h-4A1.5 1.5 0 0 1 4 10.5v-5Z" />
          <path d="M13 5.5A1.5 1.5 0 0 1 14.5 4h4A1.5 1.5 0 0 1 20 5.5v2A1.5 1.5 0 0 1 18.5 9h-4A1.5 1.5 0 0 1 13 7.5v-2Z" />
          <path d="M13 13.5a1.5 1.5 0 0 1 1.5-1.5h4a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5v-5Z" />
          <path d="M4 16.5A1.5 1.5 0 0 1 5.5 15h4a1.5 1.5 0 0 1 1.5 1.5v2A1.5 1.5 0 0 1 9.5 20h-4A1.5 1.5 0 0 1 4 18.5v-2Z" />
        }
        @case ('cadastros') {
          <path d="M5 7.5A2.5 2.5 0 0 1 7.5 5h2.8l2 2H18a2 2 0 0 1 2 2v7.5a2.5 2.5 0 0 1-2.5 2.5h-10A2.5 2.5 0 0 1 5 16.5v-9Z" />
          <path d="M12.5 11v5" />
          <path d="M10 13.5h5" />
        }
        @case ('funcionarios') {
          <path d="M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          <path d="M3.8 19a4.8 4.8 0 0 1 9.4 0" />
          <path d="M16.5 10.5a2.4 2.4 0 1 0 0-4.8" />
          <path d="M15.4 14.2a4.2 4.2 0 0 1 4.8 3.8" />
        }
        @case ('casas') {
          <path d="M4 11.5 12 5l8 6.5" />
          <path d="M6.5 10.5V19h11v-8.5" />
          <path d="M10 19v-5h4v5" />
        }
        @case ('tipos-evento') {
          <path d="M7 4.5h10A2.5 2.5 0 0 1 19.5 7v10a2.5 2.5 0 0 1-2.5 2.5H7A2.5 2.5 0 0 1 4.5 17V7A2.5 2.5 0 0 1 7 4.5Z" />
          <path d="M8 9h8" />
          <path d="M8 12h8" />
          <path d="M8 15h4" />
        }
        @case ('usuarios') {
          <path d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
          <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
          <path d="M18.5 6.5v4" />
          <path d="M16.5 8.5h4" />
        }
        @case ('eventos') {
          <path d="M7 4v3" />
          <path d="M17 4v3" />
          <path d="M5.5 7h13A1.5 1.5 0 0 1 20 8.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8.5A1.5 1.5 0 0 1 5.5 7Z" />
          <path d="M4 11h16" />
          <path d="m9 15 2 2 4-4" />
        }
        @case ('pagamentos') {
          <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
          <path d="M4 9h16" />
          <path d="M7 15h4" />
          <path d="M15.5 15h1" />
        }
        @case ('relatorios') {
          <path d="M7 4.5h7l3 3V19a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 6 19V6A1.5 1.5 0 0 1 7.5 4.5Z" />
          <path d="M14 4.5V8h3.5" />
          <path d="M9 16v-3" />
          <path d="M12 16v-5" />
          <path d="M15 16v-2" />
        }
      }
    </svg>
  `,
  styles: [`
    :host {
      align-items: center;
      display: inline-flex;
      height: 18px;
      justify-content: center;
      width: 18px;
    }

    svg {
      display: block;
      fill: none;
      height: 18px;
      stroke: currentColor;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 1.8;
      width: 18px;
    }
  `]
})
export class MenuIconComponent {
  @Input({ required: true }) name!: MenuIconName;
}
