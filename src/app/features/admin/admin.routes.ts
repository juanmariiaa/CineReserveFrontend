import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';
import { AdminLayoutComponent } from './layouts/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/admin-dashboard.component').then(c => c.AdminDashboardComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'movies',
        loadComponent: () => import('./movies/movie-management/movie-management.component').then(c => c.MovieManagementComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'movies/edit/:id',
        loadComponent: () => import('./movies/movie-edit/movie-edit.component').then(c => c.MovieEditComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'rooms',
        loadComponent: () => import('./rooms/room-management/room-management.component').then(c => c.RoomManagementComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'rooms/create',
        loadComponent: () => import('./rooms/room-create/room-create.component').then(c => c.RoomCreateComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'screenings',
        loadComponent: () => import('./screenings/screening-management/screening-management.component').then(c => c.ScreeningManagementComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'screenings/create',
        loadComponent: () => import('./screenings/screening-create/screening-create.component').then(c => c.ScreeningCreateComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'screenings/edit/:id',
        loadComponent: () => import('./screenings/screening-create/screening-create.component').then(c => c.ScreeningCreateComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'reservations',
        loadComponent: () => import('./reservations/reservation-management/reservation-management.component').then(c => c.ReservationManagementComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'users',
        loadComponent: () => import('./users/user-management/user-management.component').then(c => c.UserManagementComponent),
        canActivate: [adminGuard]
      }
    ],
    canActivate: [adminGuard]
  }
];
