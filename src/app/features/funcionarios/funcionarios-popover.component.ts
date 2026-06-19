import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-funcionarios-popover',
  standalone: true,
  template: `<div></div>`
})
export class FuncionariosPopoverComponent {
  @Input() titulo = '';
  @Output() fechar = new EventEmitter<void>();
}
