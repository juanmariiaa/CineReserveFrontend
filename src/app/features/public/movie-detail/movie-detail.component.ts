import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../core/services/auth.service';
import { MovieService } from '../../../core/services/movie.service';
import { ScreeningService } from '../../../core/services/screening.service';
import { Movie } from '../../../core/models/movie.model';
import { Screening } from '../../../core/models/screening.model';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-public-movie-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDividerModule,
    MatDialogModule,
    NavbarComponent
  ],
  template: `
    <div class="movie-detail-container">
      <app-navbar></app-navbar>
      
      <!-- Loading spinner -->
      <div *ngIf="loading" class="loading-spinner">
        <mat-spinner></mat-spinner>
      </div>
      
      <!-- Movie not found message -->
      <div *ngIf="!loading && !movie" class="not-found">
        <mat-card>
          <mat-card-content>
            <p>Movie not found or has been removed.</p>
            <button mat-raised-button color="primary" routerLink="/public/movies">Back to Movies</button>
          </mat-card-content>
        </mat-card>
      </div>
      
      <!-- Movie details -->
      <div *ngIf="!loading && movie" class="movie-content">
        <div class="movie-header">
          <div class="poster-container" *ngIf="movie.posterUrl">
            <img [src]="movie.posterUrl" alt="{{ movie.title }} poster">
          </div>
          <div class="movie-info">
            <h1>{{ movie.title }}</h1>
            
            <div class="movie-meta">
              <div *ngIf="movie.durationMinutes" class="meta-item">
                <mat-icon>schedule</mat-icon>
                <span>{{ movie.durationMinutes }} min</span>
              </div>
              <div *ngIf="movie.releaseDate" class="meta-item">
                <mat-icon>calendar_today</mat-icon>
                <span>{{ movie.releaseDate | date:'yyyy' }}</span>
              </div>
              <div *ngIf="movie.rating" class="meta-item">
                <mat-icon>star</mat-icon>
                <span>{{ movie.rating }}</span>
              </div>
            </div>
            
            <div *ngIf="movie.genres && movie.genres.length > 0" class="genres">
              <mat-chip-set>
                <mat-chip *ngFor="let genre of movie.genres">{{ genre.name }}</mat-chip>
              </mat-chip-set>
            </div>
            
            <p *ngIf="movie.description" class="description">{{ movie.description }}</p>
            
            <div *ngIf="movie.director" class="director">
              <strong>Director:</strong> {{ movie.director }}
            </div>
            
            <div *ngIf="movie.trailerUrl" class="trailer-button">
              <a mat-raised-button color="accent" [href]="movie.trailerUrl" target="_blank">
                <mat-icon>play_arrow</mat-icon> Watch Trailer
              </a>
            </div>
          </div>
        </div>
        
        <mat-divider class="section-divider"></mat-divider>
        
        <!-- Screenings section -->
        <div class="screenings-section">
          <h2>Available Screenings</h2>
          
          <div *ngIf="screenings.length === 0" class="no-screenings">
            <p>No screenings available for this movie at the moment.</p>
          </div>
          
          <div *ngIf="screenings.length > 0" class="screenings-container">
            <div *ngFor="let screening of screenings" class="screening-item">
              <div class="screening-time">
                <div class="date">{{ formatDate(screening.startTime) }}</div>
                <div class="time">{{ formatTime(screening.startTime) }}</div>
              </div>
              <div class="screening-info">
                <div class="room">Room {{ screening.room?.number }}</div>
                <div class="format">
                  {{ screening.format }}
                  <span *ngIf="screening.is3D"> | 3D</span>
                  <span *ngIf="screening.hasSubtitles"> | Subtitles</span>
                </div>
              </div>
              <div class="price">{{ screening.ticketPrice | currency:'EUR' }}</div>
              <div class="action">
                <button 
                  mat-raised-button 
                  color="primary" 
                  *ngIf="isLoggedIn"
                  [routerLink]="['/reserve', screening.id]"
                >
                  <mat-icon>event_seat</mat-icon> Reserve
                </button>
                <button 
                  mat-raised-button 
                  color="primary" 
                  *ngIf="!isLoggedIn"
                  routerLink="/login"
                  [queryParams]="{returnUrl: '/reserve/' + screening.id}"
                >
                  <mat-icon>login</mat-icon> Login to Reserve
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="back-button-container">
        <button mat-button color="primary" routerLink="/public/movies">
          <mat-icon>arrow_back</mat-icon> Back to Movies
        </button>
      </div>
    </div>
  `,
  styles: [`
    .movie-detail-container {
      padding-bottom: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 50px 0;
    }
    
    .not-found {
      text-align: center;
      padding: 30px;
    }
    
    .movie-content {
      display: flex;
      flex-direction: column;
      gap: 30px;
      padding: 0 20px;
    }
    
    .movie-header {
      display: flex;
      gap: 30px;
      margin-top: 20px;
    }
    
    .poster-container {
      flex-shrink: 0;
      width: 300px;
      height: 450px;
      overflow: hidden;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }
    
    .poster-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .movie-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .movie-info h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
    }
    
    .movie-meta {
      display: flex;
      gap: 20px;
      color: #666;
    }
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    .meta-item mat-icon {
      font-size: 18px;
      height: 18px;
      width: 18px;
    }
    
    .genres {
      margin-top: 10px;
    }
    
    .description {
      margin: 10px 0;
      line-height: 1.6;
      font-size: 16px;
    }
    
    .director {
      margin-top: 10px;
      font-size: 16px;
    }
    
    .trailer-button {
      margin-top: 20px;
    }
    
    .section-divider {
      margin: 20px 0;
    }
    
    .screenings-section {
      margin-top: 20px;
    }
    
    .screenings-section h2 {
      font-size: 24px;
      margin-bottom: 20px;
    }
    
    .no-screenings {
      text-align: center;
      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }
    
    .screenings-container {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .screening-item {
      display: flex;
      align-items: center;
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 15px;
      gap: 20px;
    }
    
    .screening-time {
      width: 120px;
      text-align: center;
    }
    
    .date {
      font-size: 14px;
      color: #666;
    }
    
    .time {
      font-size: 18px;
      font-weight: bold;
    }
    
    .screening-info {
      flex: 1;
    }
    
    .room {
      font-weight: bold;
    }
    
    .format {
      font-size: 14px;
      color: #666;
    }
    
    .price {
      font-weight: bold;
      font-size: 18px;
      width: 80px;
      text-align: right;
    }
    
    .action {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
    }
    
    .login-required {
      font-size: 12px;
    }
    
    .back-button-container {
      margin-top: 30px;
      padding: 0 20px;
    }
    
    @media (max-width: 768px) {
      .movie-header {
        flex-direction: column;
      }
      
      .poster-container {
        width: 200px;
        height: 300px;
        margin: 0 auto;
      }
      
      .screening-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
      
      .screening-time, .screening-info, .price {
        width: 100%;
        text-align: left;
      }
      
      .action {
        width: 100%;
        align-items: flex-start;
      }
    }
  `]
})
export class PublicMovieDetailComponent implements OnInit {
  movie: Movie | null = null;
  screenings: Screening[] = [];
  loading = true;
  isLoggedIn = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private screeningService: ScreeningService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    
    // Subscribe to auth changes
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = this.authService.isLoggedIn();
    });
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadMovieAndScreenings(+id);
      } else {
        this.router.navigate(['/public/movies']);
      }
    });
  }
  
  loadMovieAndScreenings(movieId: number): void {
    this.loading = true;
    
    // Load movie details
    this.movieService.getMovie(movieId).subscribe({
      next: (movie: Movie) => {
        this.movie = movie;
        
        // Load screenings for this movie
        this.screeningService.getScreeningsByMovie(movieId).subscribe({
          next: (screenings) => {
            this.screenings = screenings;
            this.loading = false;
          },
          error: (error: any) => {
            console.error('Error loading screenings:', error);
            this.loading = false;
          }
        });
      },
      error: (error: any) => {
        console.error('Error loading movie:', error);
        this.snackBar.open('Could not load movie details.', 'Close', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short', 
      month: 'short', 
      day: 'numeric'
    });
  }
  
  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
} 