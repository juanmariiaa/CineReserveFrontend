import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { GoogleTokenRequest, JwtResponse, LoginRequest, SignupRequest } from '../models/auth.model';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth-token';
  private readonly USER_KEY = 'auth-user';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Observable para manejar la apertura del modal de login
  private loginModalSubject = new BehaviorSubject<boolean>(false);
  public loginModal$ = this.loginModalSubject.asObservable();
  
  // Almacenar la URL a la que redirigir después del login
  private redirectUrl: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loadUser();
  }

  private loadUser(): void {
    const user = localStorage.getItem(this.USER_KEY);
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(credentials: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${environment.apiUrl}/auth/signin`, credentials)
      .pipe(
        tap(response => {
          this.storeUserData(response);
          // Redirigir si hay una URL guardada
          this.redirectAfterLogin();
        }),
        catchError(this.handleError)
      );
  }
  
  loginWithGoogle(token: string): Observable<JwtResponse> {
    const tokenRequest: GoogleTokenRequest = { token };
    return this.http.post<JwtResponse>(`${environment.apiUrl}/auth/google`, tokenRequest)
      .pipe(
        tap(response => {
          this.storeUserData(response);
          // Redirigir si hay una URL guardada
          this.redirectAfterLogin();
        }),
        catchError(this.handleError)
      );
  }

  private storeUserData(response: JwtResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response));
    this.currentUserSubject.next(response);
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Auth service error:', error);
    
    if (error.status === 0) {
      // A client-side or network error occurred
      return throwError(() => new Error('Network error. Please check your connection.'));
    }
    
    // Return an observable with a user-facing error message
    return throwError(() => error);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  register(user: SignupRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/signup`, user)
      .pipe(catchError(this.handleError));
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUserData(): JwtResponse | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  private tokenExpired(token: string): boolean {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expiryTime;
    } catch (e) {
      return true; // If there's an error decoding, we consider it expired
    }
  }
  
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    const isExpired = this.tokenExpired(token);
    if (isExpired) {
      this.logout(); // Clean up if expired
      return false;
    }
    
    return true;
  }
  
  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.roles?.includes('ROLE_ADMIN');
  }

  // Métodos para manejar el modal de login
  openLoginModal(redirectUrl: string | null = null): void {
    // Guardar URL de redirección si se proporciona
    if (redirectUrl) {
      this.redirectUrl = redirectUrl;
    }
    
    // Mostrar mensaje al usuario
    this.snackBar.open('You need to log in to reserve tickets', 'Close', {
      duration: 5000,
      panelClass: ['info-snackbar']
    });
    
    // Abrir el modal
    this.loginModalSubject.next(true);
  }

  closeLoginModal(): void {
    this.loginModalSubject.next(false);
  }

  // Redirigir después del login exitoso
  redirectAfterLogin(): void {
    if (this.redirectUrl) {
      this.router.navigateByUrl(this.redirectUrl);
      this.redirectUrl = null;
    }
  }

  // Guardar URL para redirección
  setRedirectUrl(url: string): void {
    this.redirectUrl = url;
  }

  getRedirectUrl(): string | null {
    return this.redirectUrl;
  }
}