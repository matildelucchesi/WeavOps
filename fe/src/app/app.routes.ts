import { Routes } from '@angular/router';
import { LoginPage } from './features/pages/login-page/login-page';
import { MainPage } from './features/pages/main-page/main-page';
import { LoomPage } from './features/pages/loom-page/loom-page';
import { HomePage } from './features/pages/home-page/home-page';
import { authGuard } from './guards/auth.guard';


export const routes: Routes = [
  {
    path: 'login',
    component: LoginPage,
  },
  {
    path: '',
    component: MainPage,
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        component: HomePage,
      },
      {
        path: 'telai',
        component: LoomPage,
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
];
