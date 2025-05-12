import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ScreeningService } from '../../core/services/screening.service';
import { Screening } from '../../core/models/screening.model';
import { NavbarComponent } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterLink,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    NavbarComponent
  ],
  template: `
    <div class="home-container">
      <app-navbar></app-navbar>

      <!-- Main content section -->
      <div class="content">
        <div class="hero-section">
          <div class="hero-content">
            <h1>Welcome to CineReserve</h1>
            <p>Discover the latest movies and reserve your seats today!</p>
            <button mat-raised-button color="accent" routerLink="/public/movies">
              <mat-icon>movie</mat-icon> Browse All Movies
            </button>
          </div>
        </div>
      
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
    
    .content {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 30px;
    }
    
    .hero-section {
      background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('/assets/cinema-background.jpg');
      background-size: cover;
      background-position: center;
      color: white;
      padding: 60px 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .hero-content {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
    }
    
    .hero-content h1 {
      font-size: 2.5rem;
      margin-bottom: 20px;
    }
    
    .hero-content p {
      font-size: 1.2rem;
      margin-bottom: 30px;
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
  screenings: Screening[] = [];
  loading = true;

  constructor(
    private screeningService: ScreeningService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Check login status from NavbarComponent
    document.addEventListener('loginStatusChange', (event: any) => {
      this.isLoggedIn = event.detail.isLoggedIn;
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
} 