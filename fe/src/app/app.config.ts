import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideApi } from './api';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { authInterceptor } from './guards/auth.interceptor';

const getAccessToken = (): string | undefined => {
  if (typeof localStorage === 'undefined') {
    return undefined;
  }

  return localStorage.getItem('access_token')?.trim() || undefined;
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideApi({
      basePath: environment.apiUrl,
      credentials: {
        bearerAuth: getAccessToken,
      },
    }),
  ],
};
