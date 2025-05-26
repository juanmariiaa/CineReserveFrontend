import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Check if this is a login request - if so, don't redirect
          const isLoginRequest =
            request.url.includes('/auth/signin') ||
            request.url.includes('/auth/google') ||
            request.url.includes('/auth/signup');

          if (!isLoginRequest) {
            console.log('No autorizado: Sesión expirada o token inválido');
            this.authService.logout();
            this.router.navigate(['/login']);
          }
          // If it's a login request, let the component handle the error
        } else if (error.status === 403) {
          console.log('Acceso prohibido: No tienes permiso para esta acción');
          // Puedes redirigir a una página de error o mostrar un mensaje
        }
        return throwError(() => error);
      })
    );
  }
}
