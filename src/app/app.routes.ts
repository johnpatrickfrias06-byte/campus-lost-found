import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage) },
  { path: 'report', loadComponent: () => import('./pages/report/report.page').then((m) => m.ReportPage) },
  // `id` is bound to the page's `id` input (see withComponentInputBinding in main.ts).
  { path: 'item/:id', loadComponent: () => import('./pages/detail/detail.page').then((m) => m.DetailPage) },
  { path: '**', redirectTo: 'home' },
];
