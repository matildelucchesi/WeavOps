import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/pages/login-page/login-page').then((page) => page.LoginPage),
  },
  {
    path: 'telaio/:id/mobile/logs',
    loadComponent: () => import('./features/pages/loom-log-page/loom-log-page').then((page) => page.LoomLogPage),
  },
  {
    path: 'telaio/:id/mobile/:action',
    loadComponent: () => import('./features/pages/loom-mobile-page/loom-mobile-page').then((page) => page.LoomMobilePage),
  },
  {
    path: 'telaio/:id/mobile',
    loadComponent: () => import('./features/pages/loom-mobile-page/loom-mobile-page').then((page) => page.LoomMobilePage),
  },
  {
    path: '',
    loadComponent: () => import('./features/pages/main-page/main-page').then((page) => page.MainPage),
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./features/pages/home-page/home-page').then((page) => page.HomePage),
      },
      {
        path: 'telai',
        loadComponent: () => import('./features/pages/loom-page/loom-page').then((page) => page.LoomPage),
      },
      {
        path: 'dettaglio-produzione/:id',
        loadComponent: () => import('./features/pages/loom-production-details-page/loom-production-details-page')
          .then((component) => component.LoomProductionDetailsPage),
      },
      {
        path: 'cronologia-produzione/:id',
        loadComponent: () => import('./features/pages/loom-history-page/loom-history-page').then((page) => page.LoomHistoryPage),
      },
      {
        path: 'loom-log-page/:id',
        loadComponent: () => import('./features/pages/loom-log-page/loom-log-page').then((page) => page.LoomLogPage),
      },
      {
        path: 'storico-lavoro-telai',
        loadComponent: () => import('./features/pages/loom-log-page/loom-log-page').then((page) => page.LoomLogPage),
      },
      {
        path: 'articoli',
        loadComponent: () => import('./features/pages/item-page/item-page').then((page) => page.ItemPage),
      },
      {
        path: 'aggiungi-articolo',
        loadComponent: () => import('./features/pages/item-add-new-page/item-add-new-page').then((page) => page.ItemAddNewPage),
      },
      {
        path: 'dettaglio-articolo',
        loadComponent: () => import('./features/pages/item-details-page/item-details-page')
          .then((component) => component.ItemDetailsPage),
      },
      {
        path: 'clienti',
        loadComponent: () => import('./features/pages/customer-page/customer-page').then((page) => page.CustomerPage),
      },
      {
        path: 'destinazioni',
        loadComponent: () => import('./features/pages/destinations-page/destinations-page').then(page => page.DestinationsPage),
      },
      {
        path: 'certificazioni',
        loadComponent: () => import('./features/pages/certifications-page/certifications-page').then(page => page.CertificationsPage),
      },
      {
        path: 'audit',
        loadComponent: () => import('./features/pages/audit-page/audit-page').then(page => page.AuditPage),
      },
      {
        path: 'tariffe',
        loadComponent: () => import('./features/pages/rates-page/rates-page').then(page => page.RatesPage),
      },
      {
        path: 'documenti',
        redirectTo: 'documenti/documenti-di-trasporto',
        pathMatch: 'full',
      },
      {
        path: 'documenti/documenti-di-trasporto',
        data: {title: 'DDT', icon: 'local_shipping'},
        loadComponent: () => import('./features/pages/documents-page/delivery-notes-page').then(page => page.DeliveryNotesPage),
      },
      {
        path: 'documenti/fatture',
        data: {title: 'Fatture', icon: 'receipt_long'},
        loadComponent: () => import('./features/pages/documents-page/documents-page').then(page => page.DocumentsPage),
      },
      {
        path: 'aggiungi-cliente',
        loadComponent: () => import('./features/pages/customer-details-page/customer-details-page').then((page) => page.CustomerDetailsPage),
      },
      {
        path: 'cronologia-articoli',
        loadComponent: () => import('./features/pages/customer-items-history-page/customer-items-history-page').then((page) => page.CustomerItemsHistoryPage),
      },
      {
        path: 'modifica-cliente',
        loadComponent: () => import('./features/pages/customer-details-page/customer-details-page').then((page) => page.CustomerDetailsPage),
      },
      {
        path: 'calendario',
        loadComponent: () => import('./features/pages/calendar-page/calendar-page').then((page) => page.CalendarPage),
      },
      {
        path: 'profilo',
        loadComponent: () => import('./features/pages/profile-page/profile-page').then((page) => page.ProfilePage),
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
