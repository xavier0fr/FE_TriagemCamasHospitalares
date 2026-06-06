import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./core/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'camas',
        loadComponent: () => import('./features/camas/camas.component').then(m => m.CamasComponent)
      },
      {
        path: 'doentes',
        canActivate: [roleGuard(['enfermeiro_gestor', 'admin'])],
        loadComponent: () => import('./features/doentes/doentes.component').then(m => m.DoenteComponent)
      },
      {
        path: 'internamentos',
        canActivate: [roleGuard(['enfermeiro_gestor', 'admin'])],
        loadComponent: () => import('./features/internamentos/internamentos.component').then(m => m.InternamentosComponent)
      },
      {
        path: 'utilizadores',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () => import('./features/utilizadores/utilizadores.component').then(m => m.UtilizadoresComponent)
      },
      {
        path: 'infraestrutura',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () => import('./features/infraestrutura/infraestrutura.component').then(m => m.InfraestruturaComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
