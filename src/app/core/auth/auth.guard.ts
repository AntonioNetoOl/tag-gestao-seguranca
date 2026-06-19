import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

const validarAcesso = (): boolean | ReturnType<Router['createUrlTree']> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const authGuard: CanActivateFn = () => validarAcesso();
export const authChildGuard: CanActivateChildFn = () => validarAcesso();
