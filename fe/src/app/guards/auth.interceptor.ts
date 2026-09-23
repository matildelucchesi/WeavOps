import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

const TOKEN_KEY = 'access_token';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = getMobileTokenFromUrl() ?? getStoredToken();
  const apiRequest = isApiRequest(request.url);
  const loginRequest = isLoginRequest(request.url);

  const authenticatedRequest = apiRequest && !loginRequest && token && !request.headers.has('Authorization')
    ? request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : request;

  return next(authenticatedRequest);
};

const getStoredToken = (): string | null => getStorage()?.getItem(TOKEN_KEY)?.trim() || null;

const getMobileTokenFromUrl = (): string | null => {
  if (typeof window === 'undefined' || !/^\/telaio\/[^/]+\/mobile(?:\/|$)/.test(window.location.pathname)) {
    return null;
  }

  return new URLSearchParams(window.location.hash.replace(/^#/, '')).get('mobileToken')?.trim() || null;
};

const getStorage = (): Storage | null =>
  typeof globalThis.localStorage === 'undefined' ? null : globalThis.localStorage;

const isApiRequest = (url: string): boolean => {
  const apiUrl = environment.apiUrl.replace(/\/$/, '');

  return url === apiUrl || url.startsWith(`${apiUrl}/`);
};

const isLoginRequest = (url: string): boolean => url.endsWith('/auth/login');
