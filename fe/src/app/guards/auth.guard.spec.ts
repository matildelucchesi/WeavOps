import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let loginUrlTree: UrlTree;
  let router: { createUrlTree: ReturnType<typeof vi.fn> };
  let snackBar: { open: ReturnType<typeof vi.fn> };

  const runGuard = () =>
    TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

  const createToken = (payload: object): string => {
    const encode = (value: object) =>
      btoa(JSON.stringify(value))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.`;
  };

  beforeEach(() => {
    loginUrlTree = {} as UrlTree;
    router = {
      createUrlTree: vi.fn().mockReturnValue(loginUrlTree),
    };
    snackBar = {
      open: vi.fn(),
    };
    localStorage.clear();
    vi.useRealTimers();

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    });
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it('redirects to login and shows a purple snackbar when no token is stored', () => {
    expect(runGuard()).toBe(loginUrlTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(snackBar.open).toHaveBeenCalledWith(
      'Autenticarsi, sessione scaduta',
      'Chiudi',
      {
        duration: 4000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
        panelClass: ['auth-snackbar'],
      },
    );
  });

  it('redirects to login and removes an expired token', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T10:00:00.000Z'));
    localStorage.setItem(
      'access_token',
      createToken({ exp: Math.floor(Date.now() / 1000) - 60 }),
    );

    expect(runGuard()).toBe(loginUrlTree);
    expect(localStorage.getItem('access_token')).toBeNull();
  });

  it('allows navigation with a non-expired token', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T10:00:00.000Z'));
    localStorage.setItem(
      'access_token',
      createToken({ exp: Math.floor(Date.now() / 1000) + 60 }),
    );

    expect(runGuard()).toBe(true);
    expect(snackBar.open).not.toHaveBeenCalled();
  });
});
