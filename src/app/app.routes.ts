import { Routes } from '@angular/router';
import { AuthGuard } from './shared/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [AuthGuard] },
  { path: 'obras', loadComponent: () => import('./works/obra-list/obra-list.component').then(m => m.ObraListComponent), canActivate: [AuthGuard] },
  { path: 'obras/:id', loadComponent: () => import('./works/obra-detail/obra-detail.component').then(m => m.ObraDetailComponent), canActivate: [AuthGuard] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }, // Redirect to dashboard after login
  { path: '**', redirectTo: '/dashboard' } // Wildcard route for a 404 page or redirect to dashboard
];