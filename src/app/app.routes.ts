import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { ADMIN_ROUTES } from './features/admin/admin.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(c => c.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'movies',
    loadComponent: () => import('./features/movies/movie-list/movie-list.component').then(c => c.MovieListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'movies/add',
    loadComponent: () => import('./features/movies/movie-create/movie-create.component').then(c => c.MovieCreateComponent),
    canActivate: [authGuard]
  },
  {
    path: 'movies/:id',
    loadComponent: () => import('./features/movies/movie-detail/movie-detail.component').then(c => c.MovieDetailComponent),
    canActivate: [authGuard]
  },
  ...ADMIN_ROUTES
];
