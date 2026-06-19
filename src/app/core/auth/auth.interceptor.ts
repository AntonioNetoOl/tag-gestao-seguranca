import { HttpInterceptorFn } from '@angular/common/http';

import { AUTH_TOKEN_STORAGE_KEY } from './auth.models';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

  if (!token) {
    return next(request);
  }

  const requestComToken = request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(requestComToken);
};
