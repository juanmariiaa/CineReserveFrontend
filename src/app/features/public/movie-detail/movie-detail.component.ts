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
            <button mat-raised-button color="accent" routerLink="/public/movies">Back to Movies</button>
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
              {{ formatGenres(movie.genres) }}
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
                  color="accent" 
                  *ngIf="isLoggedIn"
                  [routerLink]="['/reserve', screening.id]"
                >
                  <mat-icon>event_seat</mat-icon> Reserve
                </button>
                <button 
                  mat-raised-button 
                  color="accent" 
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
        <button mat-button color="accent" routerLink="/public/movies">
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
      background-color: #181818;
      color: #FFFFFF;
      min-height: 100vh;
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
    
    .not-found mat-card {
      background-color: #202020 !important;
      color: #FFFFFF !important;
      border: 1px solid #303030;
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
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
    }
    
    .poster-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .movie-info {
      flex: 1;
    }
    
    .movie-info h1 {
      margin-top: 0;
      margin-bottom: 20px;
      font-size: 32px;
      color: #FFFFFF;
    }
    
    .movie-meta {
      display: flex;
      gap: 20px;
      margin-bottom: 15px;
    }
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 5px;
      color: rgba(255, 255, 255, 0.8);
    }
    
    .genres {
      margin-bottom: 20px;
    }
    
    ::ng-deep .mat-mdc-chip {
      background-color: #303030 !important;
      color: #FFFFFF !important;
    }
    
    .description {
      margin-bottom: 20px;
      line-height: 1.6;
      font-size: 16px;
      color: rgba(255, 255, 255, 0.9);
    }
    
    .director {
      margin-bottom: 20px;
      color: rgba(255, 255, 255, 0.9);
    }
    
    .trailer-button {
      margin-bottom: 20px;
    }
    
    .section-divider {
      margin: 20px 0;
      background-color: #303030 !important;
    }
    
    .screenings-section {
      padding: 10px 0;
    }
    
    .screenings-section h2 {
      margin-bottom: 20px;
      font-size: 24px;
      color: #FFFFFF;
    }
    
    .no-screenings {
      padding: 20px;
      background-color: #202020;
      border-radius: 8px;
      text-align: center;
      color: rgba(255, 255, 255, 0.7);
      border: 1px solid #303030;
    }
    
    .screenings-container {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .screening-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px;
      background-color: #202020;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      border: 1px solid #303030;
    }
    
    .screening-time {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    
    .date {
      font-weight: 500;
      color: #FFFFFF;
    }
    
    .time {
      font-size: 18px;
      font-weight: bold;
      color: rgba(0, 176, 32, 0.9);
    }
    
    .screening-info {
      display: flex;
      flex-direction: column;
      gap: 5px;
      text-align: center;
      flex: 1;
      padding: 0 20px;
    }
    
    .room {
      font-weight: 500;
      color: #FFFFFF;
    }
    
    .format {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
    }
    
    .price {
      font-weight: 500;
      font-size: 18px;
      color: #FFFFFF;
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
        gap: 15px;
        text-align: center;
      }
      
      .screening-info {
        padding: 0;
      }
      
      .action {
        width: 100%;
      }
      
      .action button {
        width: 100%;
      }
    }
    
    .action button {
      background-color: rgba(0, 176, 32, 0.1) !important;
      border: 1px solid rgba(0, 176, 32, 0.5) !important;
    }
    
    .action button:hover {
      background-color: rgba(0, 176, 32, 0.2) !important;
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
  
  formatGenres(genres: any[]): string {
    if (!genres || genres.length === 0) return '';
    return genres.map(genre => genre.name).join(', ');
  }
} 