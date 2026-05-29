import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (auth.isLoggedIn()) return true;
  return inject(Router).createUrlTree(['/login']);
};

export const roleGuard = (roles: string[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  if (!auth.isLoggedIn()) return inject(Router).createUrlTree(['/login']);
  if (roles.includes(auth.role()!)) return true;
  return inject(Router).createUrlTree(['/dashboard']);
};
