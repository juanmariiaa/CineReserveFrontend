import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { JwtResponse, LoginRequest, SignupRequest } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth-token';
  private readonly USER_KEY = 'auth-user';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
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
          localStorage.setItem(this.TOKEN_KEY, response.token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(response));
          this.currentUserSubject.next(response);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  register(user: SignupRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/signup`, user);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): any {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  private tokenExpired(token: string): boolean {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expiryTime;
    } catch (e) {
      return true; // Si hay error al decodificar, consideramos que ha expirado
    }
  }
  
  // Modifica el método isLoggedIn para verificar la expiración
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    const isExpired = this.tokenExpired(token);
    if (isExpired) {
      this.logout(); // Limpiar si está expirado
      return false;
    }
    
    return true;
  }
  
  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.roles?.includes('ROLE_ADMIN');
  }
}