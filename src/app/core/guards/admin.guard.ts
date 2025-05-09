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

  // Redirect to not-allowed page if the user is authenticated but not admin
  if (authService.isLoggedIn()) {
    return router.createUrlTree(['/not-allowed']);
  }

  return router.createUrlTree(['/login']);
};