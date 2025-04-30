// Crear un nuevo archivo: src/app/core/guards/admin.guard.ts
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  // Redirigir al dashboard si el usuario está autenticado pero no es admin
  if (authService.isLoggedIn()) {
    return router.createUrlTree(['/dashboard']);
  }

  return router.createUrlTree(['/login']);
};