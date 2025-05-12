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

interface MovieCategory {
  name: string;
  movies: Movie[];
}

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
        <h1 class="page-title">Discover Movies</h1>
        
        <!-- Loading spinner -->
        <div *ngIf="loading" class="loading-spinner">
          <mat-spinner></mat-spinner>
        </div>
        
        <!-- No movies message -->
        <div *ngIf="!loading && movies.length === 0" class="no-movies">
          <p>No movies available at the moment.</p>
        </div>
        
        <!-- Featured movies section -->
        <div *ngIf="!loading && movies.length > 0">
          <h2 class="section-title">Now Showing</h2>
          <div class="movies-scroll-container">
            <div class="movies-horizontal-list">
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
        
        <!-- Movie categories -->
        <div *ngFor="let category of movieCategories">
          <div *ngIf="category.movies.length > 0">
            <h2 class="section-title">{{ category.name }}</h2>
            <div class="movies-scroll-container">
              <div class="movies-horizontal-list">
                <mat-card *ngFor="let movie of category.movies" class="movie-card" [routerLink]="['/public/movies', movie.id]">
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
    
    .page-title {
      margin-top: 30px;
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 30px;
    }
    
    .section-title {
      margin-top: 40px;
      margin-bottom: 15px;
      font-size: 24px;
      font-weight: 600;
      position: relative;
      padding-left: 15px;
    }
    
    .section-title::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 5px;
      background-color: #673ab7;
      border-radius: 3px;
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
    
    .movies-scroll-container {
      width: 100%;
      overflow-x: auto;
      padding-bottom: 15px; /* Space for scrollbar */
      margin-bottom: 20px;
      scrollbar-width: thin;
      scrollbar-color: #888 #f1f1f1;
    }
    
    .movies-scroll-container::-webkit-scrollbar {
      height: 8px;
    }
    
    .movies-scroll-container::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }
    
    .movies-scroll-container::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 10px;
    }
    
    .movies-scroll-container::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
    
    .movies-horizontal-list {
      display: flex;
      flex-wrap: nowrap;
      gap: 20px;
      padding: 10px 5px;
      min-width: min-content;
    }
    
    .movie-card {
      display: flex;
      flex-direction: column;
      width: 220px;
      flex-shrink: 0;
      height: 420px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .movie-card:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }
    
    .movie-poster {
      height: 300px;
      overflow: hidden;
    }
    
    .movie-poster img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }
    
    .movie-card:hover .movie-poster img {
      transform: scale(1.05);
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
    
    mat-card-title {
      font-size: 1.1rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    mat-card-subtitle {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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
    
    /* Add responsive breakpoints for different screen sizes */
    @media (max-width: 768px) {
      .movie-card {
        width: 180px;
        height: 380px;
      }
      
      .movie-poster {
        height: 250px;
      }
    }
  `]
})
export class PublicMovieListComponent implements OnInit {
  movies: Movie[] = [];
  movieCategories: MovieCategory[] = [];
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
          this.organizeMoviesByGenre();
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
  
  organizeMoviesByGenre(): void {
    // Reset categories
    this.movieCategories = [];
    
    // Create a map of genre names to movies
    const genreMap = new Map<string, Movie[]>();
    
    // Populate the map
    this.movies.forEach(movie => {
      if (movie.genres && movie.genres.length > 0) {
        movie.genres.forEach(genre => {
          if (!genreMap.has(genre.name)) {
            genreMap.set(genre.name, []);
          }
          genreMap.get(genre.name)?.push(movie);
        });
      }
    });
    
    // Convert map to array of categories
    genreMap.forEach((movies, name) => {
      this.movieCategories.push({
        name,
        movies: [...new Set(movies)] // Remove duplicates
      });
    });
    
    // Sort categories by number of movies (descending)
    this.movieCategories.sort((a, b) => b.movies.length - a.movies.length);
  }
} 