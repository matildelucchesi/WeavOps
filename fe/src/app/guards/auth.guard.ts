import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  const storage = getStorage();
  const token = storage?.getItem('access_token') ?? null;

  if (token && isTokenValid(token)) {
    return true;
  }

  storage?.removeItem('access_token');
  snackBar.open('Autenticarsi, sessione scaduta', 'Chiudi', {
    duration: 4000,
    horizontalPosition: 'end',
    verticalPosition: 'bottom',
    panelClass: ['auth-snackbar'],
  });

  return router.createUrlTree(['/login']);
};

const getStorage = (): Storage | null =>
  typeof globalThis.localStorage === 'undefined' ? null : globalThis.localStorage;

const isTokenValid = (token: string): boolean => {
  const payload = readJwtPayload(token);
  return typeof payload?.exp === 'number' && payload.exp > Math.floor(Date.now() / 1000);
};

const readJwtPayload = (token: string): { exp?: number } | null => {
  const [, payload] = token.split('.');

  if (!payload) {
    return null;
  }

  try {
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '=',
    );

    return JSON.parse(atob(paddedPayload)) as { exp?: number };
  } catch {
    return null;
  }
};
