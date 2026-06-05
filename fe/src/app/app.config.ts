import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideApi } from './api';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

const getAccessToken = (): string | undefined => {
  if (typeof localStorage === 'undefined') {
    return undefined;
  }

  return localStorage.getItem('access_token') ?? undefined;
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideApi({
      basePath: environment.apiUrl,
      credentials: {
        bearerAuth: getAccessToken,
      },
    }),
  ],
};
