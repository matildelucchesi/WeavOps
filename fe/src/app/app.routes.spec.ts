import { authGuard } from './guards/auth.guard';
import { routes } from './app.routes';

describe('routes', () => {
  it('protects the main shell and its child pages with the auth guard', () => {
    const mainRoute = routes.find(route => route.path === '');

    expect(mainRoute?.canActivate).toEqual([authGuard]);
    expect(mainRoute?.canActivateChild).toEqual([authGuard]);
  });
});
