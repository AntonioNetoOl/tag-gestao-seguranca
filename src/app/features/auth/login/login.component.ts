import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { obterMensagemErroApi } from '../../../core/api/api-error.util';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  enviando = false;
  erro = '';

  readonly form = this.formBuilder.nonNullable.group({
    email: ['admin@tag.com', [Validators.required, Validators.email]],
    senha: ['Admin@123456', [Validators.required]]
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  entrar(): void {
    this.erro = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando = true;

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.enviando = false;
        void this.router.navigateByUrl('/dashboard');
      },
      error: (error: unknown) => {
        this.enviando = false;
        this.erro = obterMensagemErroApi(error);
      }
    });
  }

  campoInvalido(campo: 'email' | 'senha'): boolean {
    const controle = this.form.controls[campo];
    return controle.invalid && (controle.dirty || controle.touched);
  }
}
