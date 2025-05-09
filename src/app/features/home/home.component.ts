import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatToolbarModule,
    MatCardModule,
    RouterLink
  ],
  template: `
    <div class="home-container">
      <mat-toolbar color="primary" class="header-toolbar">
        <span>CineReserve</span>
        <span class="spacer"></span>
        <div *ngIf="!isLoggedIn">
          <button mat-button routerLink="/login">Login</button>
          <button mat-raised-button color="accent" routerLink="/register">Register</button>
        </div>
        <div *ngIf="isLoggedIn">
          <button mat-button *ngIf="isAdmin" routerLink="/admin/dashboard">Admin Dashboard</button>
          <button mat-button *ngIf="!isAdmin" routerLink="/movies">View Movies</button>
          <button mat-button (click)="logout()">Logout</button>
        </div>
      </mat-toolbar>

      <div class="content">
        <mat-card class="welcome-card">
          <mat-card-header>
            <mat-card-title>Welcome to CineReserve</mat-card-title>
            <mat-card-subtitle>Your cinema ticket reservation system</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Find the latest movies and reserve your favorite seats</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" routerLink="/movies">View Movies</button>
          </mat-card-actions>
        </mat-card>

        <div class="featured-movies">
          <h2>Featured Movies</h2>
          <div class="movie-grid">
            <!-- Placeholder for featured movies -->
            <div class="movie-placeholder" *ngFor="let i of [1,2,3,4]">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Movie {{i}}</mat-card-title>
                </mat-card-header>
                <div class="movie-image-placeholder"></div>
                <mat-card-actions>
                  <button mat-button color="primary" [routerLink]="['/movies', i]">View details</button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
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
  `]
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
    
    // Subscribe to auth changes
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isAdmin = this.authService.isAdmin();
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
} 