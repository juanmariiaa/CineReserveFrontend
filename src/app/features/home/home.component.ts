import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatToolbarModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule,
    MatSnackBarModule,
    RouterLink
  ],
  template: `
      <mat-toolbar color="primary" class="header-toolbar">
        <span>CineReserve</span>
        <span class="spacer"></span>
        
        <!-- Not logged in: Show login dropdown -->
        <div *ngIf="!isLoggedIn">
          <button mat-button [matMenuTriggerFor]="loginMenu" #loginMenuTrigger="matMenuTrigger">
            Login <mat-icon>arrow_drop_down</mat-icon>
          </button>
          <mat-menu #loginMenu="matMenu" class="login-menu">
            <div class="login-form-container" (click)="$event.stopPropagation()">
              <h2>Login to your account</h2>
              <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Username</mat-label>
                  <input matInput formControlName="username" placeholder="Username">
                  <mat-error *ngIf="loginForm.get('username')?.hasError('required')">Username is required</mat-error>
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Password</mat-label>
                  <input matInput type="password" formControlName="password" placeholder="Password">
                  <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Password is required</mat-error>
                </mat-form-field>
                
                <button type="submit" mat-raised-button color="primary" class="full-width" [disabled]="loginForm.invalid">
                  Login
                </button>
              </form>
              <mat-divider class="divider"></mat-divider>
              <div class="register-link">
                <span>Don't have an account?</span>
                <a routerLink="/register" mat-button color="accent" (click)="closeLoginMenu()">Register</a>
              </div>
            </div>
          </mat-menu>
          
          <button mat-raised-button color="accent" routerLink="/register">Register</button>
        </div>
        
        <!-- Logged in: Show user dropdown -->
        <div *ngIf="isLoggedIn">
          <button mat-button *ngIf="isAdmin" routerLink="/admin/dashboard">Admin Dashboard</button>
          <button mat-button *ngIf="!isAdmin" routerLink="/movies">View Movies</button>
          
          <button mat-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon> {{ username }} <mat-icon>arrow_drop_down</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item routerLink="/profile">
              <mat-icon>person</mat-icon>
              <span>My Profile</span>
            </button>
            <button mat-menu-item routerLink="/my-reservations">
              <mat-icon>book</mat-icon>
              <span>My Reservations</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>exit_to_app</mat-icon>
              <span>Sign Out</span>
            </button>
          </mat-menu>
        </div>
      </mat-toolbar>



        
  `,
  styles: [`
    .home-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .header-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .content {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 30px;
    }
    
    .welcome-card {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
      padding: 20px;
    }
    
    .featured-movies {
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }
    
    .movie-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }
    
    .movie-image-placeholder {
      height: 150px;
      background-color: #e0e0e0;
      margin-bottom: 10px;
    }
    
    /* Login dropdown styles */
    .login-form-container {
      padding: 16px;
      min-width: 300px;
    }
    
    .login-form-container h2 {
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 18px;
      font-weight: 500;
    }
    
    .full-width {
      width: 100%;
    }
    
    .divider {
      margin: 16px 0;
    }
    
    .register-link {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
    }
    
    ::ng-deep .mat-mdc-menu-panel.mat-mdc-menu-panel.login-menu {
      max-width: none;
      overflow: visible;
    }
  `]
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  username = '';
  loginForm: FormGroup;
  
  @ViewChild('loginMenuTrigger') loginMenuTrigger!: MatMenuTrigger;

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
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
    
    // Get current user info if logged in
    if (this.isLoggedIn) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.username = currentUser.username;
      }
    }
    
    // Subscribe to auth changes
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isAdmin = this.authService.isAdmin();
      this.username = user?.username || '';
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login({ username, password }).subscribe({
        next: () => {
          // Successfully logged in
          this.username = username;
          
          // Reset form and close menu
          this.loginForm.reset();
          this.closeLoginMenu();
          
          // Show success message
          this.snackBar.open('Successfully logged in', 'Close', {
            duration: 3000
          });
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

  closeLoginMenu(): void {
    if (this.loginMenuTrigger) {
      this.loginMenuTrigger.closeMenu();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
    this.snackBar.open('Successfully logged out', 'Close', {
      duration: 3000
    });
  }
} 