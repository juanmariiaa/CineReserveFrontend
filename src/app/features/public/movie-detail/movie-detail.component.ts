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
import { MatTabsModule } from '@angular/material/tabs';
import { trigger, transition, style, animate } from '@angular/animations';
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
    MatTabsModule,
    NavbarComponent,
  ],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('500ms ease-out', style({ transform: 'translateY(0)', opacity: 1 })),
      ]),
    ]),
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
            <button mat-raised-button color="accent" routerLink="/movies">
              Back to Movies
            </button>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Hero Section with Backdrop Image -->
      <div *ngIf="!loading && movie" class="hero-section" [style.background-image]="movie.backdropUrl ? 'url(' + movie.backdropUrl + ')' : 'none'">
        <div class="backdrop-overlay">
          <div class="hero-content" @fadeIn>
            <div class="hero-text">
              <h1 class="movie-title">{{ movie.title }}</h1>
              
              <div class="movie-meta">
                <div *ngIf="movie.durationMinutes" class="meta-item">
                  <mat-icon>schedule</mat-icon>
                  <span>{{ movie.durationMinutes }} min</span>
                </div>
                <div *ngIf="movie.releaseDate" class="meta-item">
                  <mat-icon>calendar_today</mat-icon>
                  <span>{{ movie.releaseDate | date : 'yyyy' }}</span>
                </div>
                <div *ngIf="movie.rating" class="meta-item rating-badge">
                  <span>{{ movie.rating }}</span>
                </div>
                <div *ngIf="movie.voteAverage" class="meta-item">
                  <mat-icon>star</mat-icon>
                  <span>{{ movie.voteAverage }}/10</span>
                </div>
              </div>
              
              <div *ngIf="movie.genres && movie.genres.length > 0" class="genres-container">
                <mat-chip-set>
                  <mat-chip *ngFor="let genre of movie.genres">{{ genre.name }}</mat-chip>
                </mat-chip-set>
              </div>
              
              <div class="hero-buttons">
                <button *ngIf="hasScreenings" mat-raised-button color="accent" (click)="scrollToScreenings()">
                  <mat-icon>event_seat</mat-icon> Reserve Tickets
                </button>
                <a *ngIf="movie.trailerUrl" mat-raised-button color="primary" [href]="movie.trailerUrl" target="_blank">
                  <mat-icon>play_arrow</mat-icon> Watch Trailer
                </a>
              </div>
            </div>
            
            <div *ngIf="movie.posterUrl" class="poster-container">
              <img [src]="movie.posterUrl" alt="{{ movie.title }} poster" />
            </div>
          </div>
        </div>
      </div>

      <!-- Details Section -->
      <div *ngIf="!loading && movie" class="details-section" @slideUp>
        <mat-card class="info-card">
          <mat-card-content>
            <div class="detail-grid">
              <div class="synopsis-column">
                <h2>Synopsis</h2>
                <p *ngIf="movie.description" class="description">{{ movie.description }}</p>
              </div>
              
              <div class="crew-column">
                <div *ngIf="movie.director" class="crew-item">
                  <h3>Director</h3>
                  <p>{{ movie.director }}</p>
                </div>
                
                <div class="movie-facts">
                  <div *ngIf="movie.durationMinutes" class="fact-item">
                    <h3>Runtime</h3>
                    <p>{{ movie.durationMinutes }} minutes</p>
                  </div>
                  
                  <div *ngIf="movie.releaseDate" class="fact-item">
                    <h3>Release Date</h3>
                    <p>{{ movie.releaseDate | date }}</p>
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Screenings Section -->
      <div id="screenings" *ngIf="!loading && movie" class="screenings-section" @slideUp>
        <h2>Available Screenings</h2>
        
        <div *ngIf="screenings.length === 0" class="no-screenings">
          <mat-icon>event_busy</mat-icon>
          <p>No screenings available for this movie at the moment.</p>
          <button mat-raised-button color="primary" routerLink="/movies">
            Browse Other Movies
          </button>
        </div>
        
        <div *ngIf="screenings.length > 0" class="screenings-container">
          <mat-card>
            <mat-card-content>
              <!-- Group screenings by date -->
              <div *ngFor="let date of getUniqueDates()" class="screening-date-group">
                <h3 class="screening-date">{{ formatDateHeading(date) }}</h3>
                
                <div class="screening-list">
                  <div *ngFor="let screening of getScreeningsByDate(date)" class="screening-item" @fadeIn>
                    <div class="screening-time">
                      <span class="time">{{ formatTime(screening.startTime) }}</span>
                    </div>
                    
                    <div class="screening-details">
                      <div class="room">
                        Room {{ screening.room?.number }}
                      </div>
                      
                      <div class="format-badges">
                        <span class="format-badge">{{ screening.format }}</span>
                        <span *ngIf="screening.is3D" class="format-badge">3D</span>
                        <span *ngIf="screening.hasSubtitles" class="format-badge">SUB</span>
                      </div>
                    </div>
                    
                    <div class="screening-price">
                      {{ screening.ticketPrice | currency : 'EUR' }}
                    </div>
                    
                    <div class="screening-action">
                      <button
                        mat-raised-button
                        color="accent"
                        *ngIf="isLoggedIn"
                        [routerLink]="['/reserve', screening.id]"
                      >
                        <mat-icon>event_seat</mat-icon> Reserve Seats
                      </button>
                      <button
                        mat-raised-button
                        color="accent"
                        *ngIf="!isLoggedIn"
                        routerLink="/login"
                        [queryParams]="{ returnUrl: '/reserve/' + screening.id }"
                      >
                        <mat-icon>login</mat-icon> Login to Reserve
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* Main container */
      .movie-detail-container {
        min-height: 100vh;
        background-color: #3c3b34;
        color: #ffffff;
        display: flex;
        flex-direction: column;
      }

      /* Loading & Not Found States */
      .loading-spinner {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 400px;
      }

      .not-found {
        text-align: center;
        padding: 30px;
        margin: 40px auto;
        max-width: 600px;
      }

      .not-found mat-card {
        background-color: #35342e !important;
        color: #ffffff !important;
        border-radius: 12px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
      }

      /* Hero Section with Backdrop */
      .hero-section {
        position: relative;
        height: 80vh;
        min-height: 480px;
        max-height: 700px;
        background-size: cover;
        background-position: center;
        margin-bottom: 30px;
      }

      .backdrop-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          to bottom,
          rgba(60, 59, 52, 0.7) 0%,
          rgba(60, 59, 52, 0.8) 50%,
          rgba(60, 59, 52, 0.95) 90%,
          rgba(60, 59, 52, 1) 100%
        );
        display: flex;
        align-items: center;
        padding: 0 40px;
      }

      .hero-content {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 40px;
      }

      .hero-text {
        flex: 1;
        max-width: 650px;
      }

      .movie-title {
        font-size: 3rem;
        font-weight: 700;
        margin-bottom: 10px;
        color: white;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      /* Poster in Hero Section */
      .poster-container {
        flex-shrink: 0;
        width: 300px;
        height: 450px;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.5);
        border: 2px solid rgba(255, 255, 255, 0.1);
        transform: translateY(20px);
      }

      .poster-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      /* Movie Meta Information */
      .movie-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        margin-bottom: 20px;
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 5px;
        color: rgba(255, 255, 255, 0.9);
      }

      .meta-item mat-icon {
        color: #ff6b6b;
      }

      .rating-badge {
        background-color: #ff6b6b;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-weight: 600;
      }

      /* Genres */
      .genres-container {
        margin-bottom: 25px;
      }

      ::ng-deep .mat-mdc-chip {
        background-color: transparent !important;
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
        color: rgba(255, 255, 255, 0.95) !important;
      }

      ::ng-deep .mat-mdc-chip:hover {
        border-color: #ff6b6b !important;
      }

      /* Hero Buttons */
      .hero-buttons {
        display: flex;
        gap: 15px;
        margin-top: 30px;
      }

      ::ng-deep .mat-mdc-raised-button.mat-accent {
        background-color: #ff6b6b !important;
      }

      ::ng-deep .mat-mdc-raised-button.mat-primary {
        background-color: rgba(255, 255, 255, 0.2) !important;
      }

      /* Details Section */
      .details-section {
        padding: 0 40px;
        margin-bottom: 40px;
      }

      .info-card {
        background-color: #35342e !important;
        border-radius: 12px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
      }

      .detail-grid {
        display: grid;
        grid-template-columns: 1.5fr 1fr;
        gap: 30px;
      }

      .synopsis-column h2,
      .crew-column h3 {
        color: white;
        margin-bottom: 15px;
        font-weight: 600;
      }

      .description {
        font-size: 1rem;
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.9);
      }

      .crew-item, .fact-item {
        margin-bottom: 20px;
      }

      .crew-item h3, .fact-item h3 {
        font-size: 1.1rem;
        margin-bottom: 8px;
        color: #ff6b6b;
      }

      .crew-item p, .fact-item p {
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.5;
      }

      /* Screenings Section */
      .screenings-section {
        padding: 0 40px;
        margin-bottom: 40px;
      }

      .screenings-section h2 {
        margin-bottom: 20px;
        font-size: 1.8rem;
        font-weight: 600;
        color: white;
      }

      .screenings-container mat-card {
        background-color: #35342e !important;
        border-radius: 12px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
      }

      .no-screenings {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
        padding: 40px;
        text-align: center;
        background-color: #35342e;
        border-radius: 12px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
      }

      .no-screenings mat-icon {
        font-size: 48px;
        height: 48px;
        width: 48px;
        color: rgba(255, 255, 255, 0.5);
      }

      .screening-date-group {
        margin-bottom: 30px;
      }

      .screening-date {
        margin-bottom: 15px;
        font-weight: 600;
        color: #ff6b6b;
        font-size: 1.3rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 10px;
      }

      .screening-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .screening-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 15px;
        transition: all 0.3s ease;
      }

      .screening-item:hover {
        background-color: rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .screening-time {
        text-align: center;
        width: 80px;
      }

      .time {
        font-size: 1.2rem;
        font-weight: 700;
        color: white;
      }

      .screening-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .room {
        font-weight: 600;
        color: white;
      }

      .format-badges {
        display: flex;
        gap: 8px;
      }

      .format-badge {
        background-color: rgba(255, 255, 255, 0.15);
        color: white;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 500;
      }

      .screening-price {
        font-weight: 600;
        font-size: 1.1rem;
        color: #ff6b6b;
        padding: 0 15px;
      }

      /* Back Button */
      .back-button-container {
        padding: 0 40px 40px;
      }

      /* Responsive Styles */
      @media (max-width: 992px) {
        .hero-content {
          flex-direction: column;
          padding-top: 100px;
          align-items: flex-start;
        }

        .poster-container {
          margin-top: 30px;
          align-self: center;
        }

        .hero-section {
          height: auto;
          min-height: 90vh;
        }

        .detail-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 768px) {
        .backdrop-overlay {
          padding: 0 20px;
        }

        .details-section,
        .screenings-section,
        .back-button-container {
          padding: 0 20px;
        }

        .movie-title {
          font-size: 2.2rem;
        }

        .screening-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 15px;
        }

        .screening-time,
        .screening-details,
        .screening-price,
        .screening-action {
          width: 100%;
          text-align: left;
        }

        .screening-action button {
          width: 100%;
        }

        .poster-container {
          width: 220px;
          height: 330px;
        }
      }

      @media (max-width: 576px) {
        .hero-buttons {
          flex-direction: column;
        }

        .hero-buttons button,
        .hero-buttons a {
          width: 100%;
        }
      }
    `,
  ],
})
export class PublicMovieDetailComponent implements OnInit {
  movie: Movie | null = null;
  screenings: Screening[] = [];
  loading = true;
  isLoggedIn = false;
  hasScreenings = false;

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
    this.authService.currentUser$.subscribe((user) => {
      this.isLoggedIn = this.authService.isLoggedIn();
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadMovieAndScreenings(+id);
      } else {
        this.router.navigate(['/movies']);
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
            this.hasScreenings = screenings.length > 0;
            this.loading = false;
          },
          error: (error: any) => {
            console.error('Error loading screenings:', error);
            this.loading = false;
          },
        });
      },
      error: (error: any) => {
        console.error('Error loading movie:', error);
        this.snackBar.open('Could not load movie details.', 'Close', {
          duration: 5000,
        });
        this.loading = false;
      },
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  formatDateHeading(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatGenres(genres: any[]): string {
    if (!genres || genres.length === 0) return '';
    return genres.map((genre) => genre.name).join(', ');
  }

  scrollToScreenings(): void {
    const element = document.getElementById('screenings');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Get unique dates from screenings
  getUniqueDates(): string[] {
    const dates = this.screenings.map(screening => {
      const date = new Date(screening.startTime);
      return date.toISOString().split('T')[0]; // Get only date part
    });
    
    // Remove duplicates
    return [...new Set(dates)].sort();
  }

  // Get screenings for a specific date
  getScreeningsByDate(date: string): Screening[] {
    return this.screenings.filter(screening => {
      const screeningDate = new Date(screening.startTime);
      return screeningDate.toISOString().split('T')[0] === date;
    }).sort((a, b) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
  }
}
