import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'camas', loadComponent: () => import('./features/camas/camas.component').then(m => m.CamasComponent), canActivate: [authGuard] },
  { path: 'doentes', loadComponent: () => import('./features/doentes/doentes.component').then(m => m.DoenteComponent), canActivate: [roleGuard(['enfermeiro_gestor', 'admin'])] },
  { path: 'internamentos', loadComponent: () => import('./features/internamentos/internamentos.component').then(m => m.InternamentosComponent), canActivate: [roleGuard(['enfermeiro_gestor', 'admin'])] },
  { path: '**', redirectTo: 'dashboard' }
];
