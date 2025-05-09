import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { ADMIN_ROUTES } from './features/admin/admin.routes';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(c => c.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(c => c.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(c => c.RegisterComponent)
  },
  {
    path: 'not-allowed',
    loadComponent: () => import('./features/shared/not-allowed/not-allowed.component').then(c => c.NotAllowedComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'movies',
    loadComponent: () => import('./features/movies/movie-list/movie-list.component').then(c => c.MovieListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'movies/add',
    loadComponent: () => import('./features/movies/movie-create/movie-create.component').then(c => c.MovieCreateComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'movies/:id',
    loadComponent: () => import('./features/movies/movie-detail/movie-detail.component').then(c => c.MovieDetailComponent),
    canActivate: [authGuard]
  },
  ...ADMIN_ROUTES
];
