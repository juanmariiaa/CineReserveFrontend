import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { ADMIN_ROUTES } from './features/admin/admin.routes';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((c) => c.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (c) => c.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (c) => c.RegisterComponent
      ),
  },
  {
    path: 'not-allowed',
    loadComponent: () =>
      import('./features/shared/not-allowed/not-allowed.component').then(
        (c) => c.NotAllowedComponent
      ),
  },
  {
    path: 'reserve/:id',
    loadComponent: () =>
      import('./features/reservation/reservation.component').then(
        (c) => c.ReservationComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/admin/dashboard/admin-dashboard.component').then(
        (c) => c.AdminDashboardComponent
      ),
    canActivate: [authGuard, adminGuard],
  },
  // Rutas públicas de películas
  {
    path: 'movies',
    loadComponent: () =>
      import('./features/public/movie-list/movie-list.component').then(
        (c) => c.PublicMovieListComponent
      ),
  },
  // Detalle de película (público, sin autenticación)
  {
    path: 'movies/:id',
    loadComponent: () =>
      import('./features/public/movie-detail/movie-detail.component').then(
        (c) => c.PublicMovieDetailComponent
      ),
  },
  {
    path: 'my-reservations',
    loadComponent: () =>
      import('./features/user/reservations/user-reservations.component').then(
        (c) => c.UserReservationsComponent
      ),
    canActivate: [authGuard],
  },
  // Payment routes
  {
    path: 'payment/success',
    loadComponent: () =>
      import('./features/payment/payment-success/payment-success.component').then(
        (c) => c.PaymentSuccessComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'payment/cancel',
    loadComponent: () =>
      import('./features/payment/payment-cancel/payment-cancel.component').then(
        (c) => c.PaymentCancelComponent
      ),
    canActivate: [authGuard],
  },
  ...ADMIN_ROUTES,
];
