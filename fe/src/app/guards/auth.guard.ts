import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  const token =
    typeof localStorage === 'undefined'
      ? null
      : localStorage.getItem('access_token');

  return token ? true : router.createUrlTree(['/login']);
};