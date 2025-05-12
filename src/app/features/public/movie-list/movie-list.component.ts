import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MovieService } from '../../../core/services/movie.service';
import { ScreeningService } from '../../../core/services/screening.service';
import { Movie } from '../../../core/models/movie.model';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-public-movie-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    NavbarComponent
  ],
  template: `
    <div class="movie-list-page">
      <app-navbar></app-navbar>
      
      <div class="movie-list-container">
        <h1 class="section-title">Now Showing</h1>
        
        <!-- Loading spinner -->
        <div *ngIf="loading" class="loading-spinner">
          <mat-spinner></mat-spinner>
        </div>
        
        <!-- No movies message -->
        <div *ngIf="!loading && movies.length === 0" class="no-movies">
          <p>No movies available at the moment.</p>
        </div>
        
        <!-- Movies grid -->
        <div class="movies-grid">
          <mat-card *ngFor="let movie of movies" class="movie-card" [routerLink]="['/public/movies', movie.id]">
            <div class="movie-poster">
              <img *ngIf="movie.posterUrl" [src]="movie.posterUrl" alt="{{ movie.title }} poster">
              <div *ngIf="!movie.posterUrl" class="no-poster">
                <mat-icon>movie</mat-icon>
              </div>
            </div>
            <div class="movie-content">
              <mat-card-header>
                <mat-card-title>{{ movie.title }}</mat-card-title>
                <mat-card-subtitle *ngIf="movie.genres && movie.genres.length > 0">
                  {{ getGenresList(movie) }}
                </mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <p *ngIf="movie.durationMinutes">{{ movie.durationMinutes }} min</p>
                <p *ngIf="movie.rating">{{ movie.rating }}</p>
              </mat-card-content>
              
              <mat-card-actions>
                <button mat-button color="primary" [routerLink]="['/public/movies', movie.id]">
                  <mat-icon>info</mat-icon> Details
                </button>
              </mat-card-actions>
            </div>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .movie-list-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .movie-list-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      flex: 1;
    }
    
    .section-title {
      margin-top: 30px;
      margin-bottom: 20px;
      font-size: 28px;
    }
    
    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 50px 0;
    }
    
    .no-movies {
      text-align: center;
      padding: 30px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }
    
    .movies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    
    .movie-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      cursor: pointer;
      transition: transform 0.2s;
    }
    
    .movie-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }
    
    .movie-poster {
      height: 300px;
      overflow: hidden;
    }
    
    .movie-poster img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .no-poster {
      height: 100%;
      background-color: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .no-poster mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #999;
    }
    
    .movie-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    mat-card-header {
      padding: 16px 16px 0;
    }
    
    mat-card-content {
      padding: 0 16px;
      flex: 1;
    }
    
    mat-card-actions {
      padding: 8px 16px 16px;
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class PublicMovieListComponent implements OnInit {
  movies: Movie[] = [];
  loading = true;
  
  constructor(
    private movieService: MovieService, 
    private screeningService: ScreeningService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.loadMoviesWithScreenings();
  }
  
  loadMoviesWithScreenings(): void {
    this.loading = true;
    this.movieService.getAllMovies().subscribe({
      next: (movies) => {
        // We'll store promises for all async operations
        const promises: Promise<Movie | null>[] = [];
        
        // For each movie, check if it has screenings
        movies.forEach(movie => {
          const promise = new Promise<Movie | null>((resolve, reject) => {
            this.screeningService.getScreeningsByMovie(movie.id!).subscribe({
              next: (screenings) => {
                // Only include the movie if it has screenings
                if (screenings && screenings.length > 0) {
                  resolve(movie);
                } else {
                  resolve(null);
                }
              },
              error: () => resolve(null)
            });
          });
          
          promises.push(promise);
        });
        
        // Wait for all promises to resolve
        Promise.all(promises).then(results => {
          // Filter out null results
          this.movies = results.filter(movie => movie !== null) as Movie[];
          this.loading = false;
        });
      },
      error: (error) => {
        console.error('Error loading movies:', error);
        this.snackBar.open('Could not load movies. Please try again later.', 'Close', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }
  
  getGenresList(movie: Movie): string {
    if (!movie.genres || movie.genres.length === 0) return '';
    return movie.genres.map(genre => genre.name).join(', ');
  }
} 