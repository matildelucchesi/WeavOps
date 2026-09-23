import { Routes } from '@angular/router';
import { LoginPage } from './features/pages/login-page/login-page';
import { MainPage } from './features/pages/main-page/main-page';
import { LoomPage } from './features/pages/loom-page/loom-page';
import { HomePage } from './features/pages/home-page/home-page';
import { authGuard } from './guards/auth.guard';
import { ItemPage } from './features/pages/item-page/item-page';
import { CustomerPage } from './features/pages/customer-page/customer-page';
import { CustomerDetailsPage } from './features/pages/customer-details-page/customer-details-page';
import { CustomerItemsHistoryPage } from './features/pages/customer-items-history-page/customer-items-history-page';
import { ItemAddNewPage } from './features/pages/item-add-new-page/item-add-new-page';
import { CalendarPage } from './features/pages/calendar-page/calendar-page';
import { LoomHistoryPage } from './features/pages/loom-history-page/loom-history-page';
import { ProfilePage } from './features/pages/profile-page/profile-page';
import { LoomMobilePage } from './features/pages/loom-mobile-page/loom-mobile-page';
import { LoomLogPage } from './features/pages/loom-log-page/loom-log-page';
import { LoomMobileLogPage } from './features/pages/loom-mobile-log-page/loom-mobile-log-page';


export const routes: Routes = [
  {
    path: 'login',
    component: LoginPage,
  },
  {
    path: 'telaio/:id/mobile/logs',
    component: LoomMobileLogPage,
  },
  {
    path: 'telaio/:id/mobile/:action',
    component: LoomMobilePage,
  },
  {
    path: 'telaio/:id/mobile',
    component: LoomMobilePage,
  },
  {
    path: '',
    component: MainPage,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
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
        path: 'dettaglio-produzione/:id',
        loadComponent: () => import('./features/pages/loom-production-details-page/loom-production-details-page')
          .then((component) => component.LoomProductionDetailsPage),
      },
      {
        path: 'cronologia-produzione/:id',
        component: LoomHistoryPage,
      },
      {
        path: 'storico-lavoro-telai',
        component: LoomLogPage,
      },
      {
        path: 'articoli',
        component: ItemPage,
      },
      {
        path: 'aggiungi-articolo',
        component: ItemAddNewPage,
      },
      {
        path: 'dettaglio-articolo',
        loadComponent: () => import('./features/pages/item-details-page/item-details-page')
          .then((component) => component.ItemDetailsPage),
      },
      {
        path: 'clienti',
        component: CustomerPage,
      },
      {
        path: 'aggiungi-cliente',
        component: CustomerDetailsPage,
      },
      {
        path: 'cronologia-articoli',
        component: CustomerItemsHistoryPage,
      },
      {
        path: 'modifica-cliente',
        component: CustomerDetailsPage,
      },
      {
        path: 'calendario',
        component: CalendarPage,
      },
      {
        path: 'profilo',
        component: ProfilePage,
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'home',
      }
    ],
  },
];
