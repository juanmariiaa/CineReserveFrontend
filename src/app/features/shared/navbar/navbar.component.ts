import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  template: `
    <mat-toolbar color="primary" class="header-toolbar">
      <span routerLink="/" style="cursor: pointer;">CineReserve</span>
      <span class="spacer"></span>
      
      <!-- Browse movies button - visible to all users -->
      <button mat-button routerLink="/public/movies">
        <mat-icon>movie</mat-icon> Browse Movies
      </button>
      
      <!-- Not logged in: show login dropdown -->
      <div *ngIf="!isLoggedIn">
        <button mat-button [matMenuTriggerFor]="loginMenu">
          Login <mat-icon>arrow_drop_down</mat-icon>
        </button>
        <mat-menu #loginMenu="matMenu" class="login-menu">
          <div class="login-form-container" (click)="$event.stopPropagation()">
            <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
              <mat-form-field appearance="outline">
                <mat-label>Username</mat-label>
                <input matInput formControlName="username">
                <mat-error *ngIf="loginForm.get('username')?.hasError('required')">Required</mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Password</mat-label>
                <input matInput type="password" formControlName="password">
                <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Required</mat-error>
              </mat-form-field>
              
              <div class="login-actions">
                <button mat-raised-button color="primary" type="submit" [disabled]="loginForm.invalid">
                  Login
                </button>
              </div>
            </form>
            <div class="register-link">
              <a mat-button routerLink="/register">Don't have an account? Register</a>
            </div>
          </div>
        </mat-menu>
        <button mat-raised-button color="accent" routerLink="/register">Register</button>
      </div>
      
      <!-- Logged in: show username with dropdown -->
      <div *ngIf="isLoggedIn">
        <button mat-button *ngIf="isAdmin" routerLink="/admin/dashboard">Admin Dashboard</button>
        <button mat-button *ngIf="!isAdmin" routerLink="/movies">My Account</button>
        <button mat-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon> 
          {{ username }} <mat-icon>arrow_drop_down</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item (click)="logout()">
            <mat-icon>exit_to_app</mat-icon> Sign Out
          </button>
        </mat-menu>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .header-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .login-form-container {
      padding: 16px;
      min-width: 300px;
    }
    
    .login-form-container mat-form-field {
      width: 100%;
      margin-bottom: 10px;
    }
    
    .login-actions {
      display: flex;
      justify-content: center;
      margin-top: 10px;
    }
    
    .register-link {
      margin-top: 10px;
      text-align: center;
    }
    
    ::ng-deep .mat-mdc-menu-panel.login-menu {
      max-width: none !important;
    }
  `]
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  username = '';
  loginForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.updateAuthStatus();
    
    // Subscribe to auth changes
    this.authService.currentUser$.subscribe(user => {
      this.updateAuthStatus();
    });
  }

  private updateAuthStatus(): void {
    const previousStatus = this.isLoggedIn;
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
    
    // Get username from stored user data
    const userData = this.authService.getUserData();
    this.username = userData?.username || '';

    // If the login status has changed, dispatch a custom event
    if (previousStatus !== this.isLoggedIn) {
      const event = new CustomEvent('loginStatusChange', {
        detail: { 
          isLoggedIn: this.isLoggedIn,
          isAdmin: this.isAdmin
        },
        bubbles: true
      });
      document.dispatchEvent(event);
    }
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login({ username, password }).subscribe({
        next: () => {
          this.updateAuthStatus();
          // Redirect based on user role
          if (this.isAdmin) {
            this.router.navigate(['/admin/dashboard']);
          }
          // For regular users, stay on the current page with updated UI
        },
        error: (error) => {
          let errorMsg = 'Invalid credentials';
          
          if (error.error && error.error.message) {
            errorMsg = error.error.message;
          } else if (error.status === 0) {
            errorMsg = 'Could not connect to server. Please check your connection or if the server is active.';
          } else if (error.status === 401) {
            errorMsg = 'Invalid username or password';
          }
          
          this.snackBar.open('Login error: ' + errorMsg, 'Close', {
            duration: 5000
          });
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.isAdmin = false;
    this.username = '';
    this.router.navigate(['/']);
  }
} 