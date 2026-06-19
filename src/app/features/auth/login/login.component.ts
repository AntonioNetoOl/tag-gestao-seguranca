import { Component, inject } from '@angular/core';
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
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  enviando = false;
  erro = '';

  readonly form = this.formBuilder.nonNullable.group({
    email: ['admin@tag.com', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]]
  });

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
