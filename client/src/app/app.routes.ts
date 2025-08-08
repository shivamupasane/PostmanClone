import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/api-tester/api-tester.component').then(m => m.ApiTesterComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];