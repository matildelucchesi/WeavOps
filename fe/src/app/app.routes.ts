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


export const routes: Routes = [
  {
    path: 'login',
    component: LoginPage,
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
        path: 'articoli',
        component: ItemPage,
      },
      {
        path: 'aggiungi-articolo',
        component: ItemAddNewPage,
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
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
];
