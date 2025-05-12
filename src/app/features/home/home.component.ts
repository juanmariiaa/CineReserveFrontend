import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ScreeningService } from '../../core/services/screening.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Screening } from '../../core/models/screening.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatToolbarModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="home-container">
      <mat-toolbar color="primary" class="header-toolbar">
        <span>CineReserve</span>
        <span class="spacer"></span>
        
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
          <button mat-button *ngIf="!isAdmin" routerLink="/movies">View Movies</button>
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

      <!-- Main content section -->
      <div class="content">
        <h1 class="section-title">Now Showing</h1>
        
        <!-- Loading spinner -->
        <div *ngIf="loading" class="loading-spinner">
          <mat-spinner></mat-spinner>
        </div>
        
        <!-- No screenings message -->
        <div *ngIf="!loading && screenings.length === 0" class="no-screenings">
          <p>No screenings available at the moment.</p>
        </div>
        
        <!-- Screenings grid -->
        <div class="screenings-grid">
          <mat-card *ngFor="let screening of screenings" class="screening-card">
            <div *ngIf="screening.movie?.posterUrl" class="movie-poster">
              <img [src]="screening.movie?.posterUrl" alt="{{ screening.movie?.title }} poster">
            </div>
            <div class="card-content">
              <mat-card-header>
                <mat-card-title>{{ screening.movie?.title }}</mat-card-title>
                <mat-card-subtitle>
                  Room {{ screening.room?.number }} | {{ screening.format }}
                  <span *ngIf="screening.is3D"> | 3D</span>
                </mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <p><strong>Date:</strong> {{ screening.startTime | date:'medium' }}</p>
                <p><strong>Price:</strong> {{ screening.ticketPrice | currency:'EUR' }}</p>
                <p *ngIf="screening.language"><strong>Language:</strong> {{ screening.language }}</p>
                <p *ngIf="screening.hasSubtitles"><mat-icon class="small-icon">subtitles</mat-icon> With subtitles</p>
              </mat-card-content>
              
              <mat-card-actions>
                <button 
                  mat-raised-button 
                  color="primary" 
                  [routerLink]="['/reserve', screening.id]"
                  [disabled]="!isLoggedIn"
                >
                  <mat-icon>event_seat</mat-icon> Reserve
                </button>
                <span *ngIf="!isLoggedIn" class="login-required-text">Login to reserve</span>
              </mat-card-actions>
            </div>
          </mat-card>
        </div>
      </div>
    </div>
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

    .section-title {
      margin-top: 30px;
      margin-bottom: 20px;
      font-size: 28px;
    }

    .screenings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .screening-card {
      display: flex;
      flex-direction: row;
      overflow: hidden;
    }

    .movie-poster {
      width: 120px;
      flex-shrink: 0;
      height: auto;
    }

    .movie-poster img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
    }

    .card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .small-icon {
      font-size: 18px;
      vertical-align: middle;
      margin-right: 4px;
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 50px 0;
    }

    .no-screenings {
      text-align: center;
      padding: 30px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .login-required-text {
      margin-left: 8px;
      font-size: 12px;
      color: #666;
    }

    mat-card-actions {
      display: flex;
      align-items: center;
    }
  `]
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  username = '';
  loginForm: FormGroup;
  screenings: Screening[] = [];
  loading = true;

  constructor(
    private authService: AuthService,
    private screeningService: ScreeningService,
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

    // Load screenings
    this.loadScreenings();
  }

  loadScreenings(): void {
    this.loading = true;
    this.screeningService.getAllScreenings().subscribe({
      next: (data) => {
        this.screenings = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading screenings:', error);
        this.snackBar.open('Could not load screenings. Please try again later.', 'Close', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }

  private updateAuthStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
    
    // Get username from stored user data
    const userData = this.authService.getUserData();
    this.username = userData?.username || '';
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
          // For regular users, stay on the home page with updated UI
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