import { Routes } from '@angular/router';
import { AuthGuard } from './shared/auth.guard';
import { ObraEditComponent } from './works/obra-edit/obra-edit.component';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [AuthGuard] },
  { path: 'obras/criar', loadComponent: () => import('./works/obra-create/obra-create.component').then(m => m.ObraCreateComponent), canActivate: [AuthGuard] },
  { path: 'obras/edit/:id', loadComponent: () => import('./works/obra-edit/obra-edit.component').then(m => m.ObraEditComponent), canActivate: [AuthGuard] },
  { path: 'obras', loadComponent: () => import('./works/obra-list/obra-list.component').then(m => m.ObraListComponent), canActivate: [AuthGuard] },
  { path: 'obras/:id', loadComponent: () => import('./works/obra-detail/obra-detail.component').then(m => m.ObraDetailComponent), canActivate: [AuthGuard] },
  { path: 'chatbot', loadComponent: () => import('./chatbot/chatbot.component').then(m => m.ChatbotComponent), canActivate: [AuthGuard] },
  { path: 'landing-page', loadComponent: () => import('./landing-page/landing-page.component').then(m => m.LandingPageComponent) },
  { path: '', redirectTo: '/landing-page', pathMatch: 'full' },
  { path: '**', redirectTo: '/landing-page' }
];