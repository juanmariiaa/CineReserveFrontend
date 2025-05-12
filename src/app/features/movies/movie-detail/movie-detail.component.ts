import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../../../core/services/movie.service';
import { Movie } from '../../../core/models/movie.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="movie-detail-container">
      <button mat-raised-button color="primary" (click)="goBack()" class="back-button">
        <mat-icon>arrow_back</mat-icon> Volver
      </button>
      
      <div *ngIf="loading" class="loading-spinner">
        <mat-spinner></mat-spinner>
      </div>
      
      <div *ngIf="!loading && movie" class="movie-content">
        <div class="movie-header" [style.backgroundImage]="'url(' + (movie.backdropUrl || '') + ')'">
          <div class="movie-header-content">
            <div *ngIf="movie.posterUrl" class="movie-poster-container">
              <img [src]="movie.posterUrl" [alt]="movie.title" class="movie-poster">
            </div>
            <div class="movie-info">
              <h1>{{ movie.title }}</h1>
              <p *ngIf="movie.releaseDate">{{ movie.releaseDate | date }}</p>
              <p *ngIf="movie.durationMinutes">{{ movie.durationMinutes }} minutos</p>
              <div *ngIf="movie.genres && movie.genres.length > 0" class="genre-chips">
                <mat-chip *ngFor="let genre of movie.genres">{{ genre.name }}</mat-chip>
              </div>
              <p *ngIf="movie.voteAverage" class="rating">
                <mat-icon class="star-icon">star</mat-icon> {{ movie.voteAverage }} / 10
              </p>
            </div>
          </div>
        </div>
        
        <mat-card class="movie-details-card">
          <mat-card-content>
            <h2>Sinopsis</h2>
            <p>{{ movie.description || 'No hay descripción disponible' }}</p>
            
            <mat-divider class="divider"></mat-divider>
            
            <h2>Información adicional</h2>
            <div class="additional-info">
              <div class="info-item">
                <span class="info-label">Director:</span>
                <span>{{ movie.director || 'Desconocido' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Idioma:</span>
                <span>{{ movie.language || 'Desconocido' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">TMDB ID:</span>
                <span>{{ movie.tmdbId }}</span>
              </div>
              <div class="info-item" *ngIf="movie.imdbId">
                <span class="info-label">IMDB ID:</span>
                <span>{{ movie.imdbId }}</span>
              </div>
            </div>
            
            <div *ngIf="movie.trailerUrl" class="trailer-section">
              <h2>Trailer</h2>
              <a [href]="movie.trailerUrl" target="_blank" mat-raised-button color="accent">
                <mat-icon>play_circle_filled</mat-icon> Ver Trailer
              </a>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .movie-detail-container {
      padding: 20px;
    }
    
    .back-button {
      margin-bottom: 20px;
    }
    
    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 50px 0;
    }
    
    .movie-header {
      background-size: cover;
      background-position: center;
      background-color: rgba(0,0,0,0.7);
      background-blend-mode: darken;
      padding: 40px 20px;
      color: white;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .movie-header-content {
      display: flex;
      gap: 30px;
      align-items: flex-start;
    }
    
    .movie-poster-container {
      flex-shrink: 0;
    }
    
    .movie-poster {
      width: 200px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    }
    
    .movie-info {
      flex-grow: 1;
    }
    
    .genre-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 15px 0;
    }
    
    .star-icon {
      color: gold;
      vertical-align: middle;
      margin-right: 4px;
    }
    
    .divider {
      margin: 20px 0;
    }
    
    .additional-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    
    .info-label {
      font-weight: bold;
      margin-right: 5px;
    }
    
    .trailer-section {
      margin-top: 20px;
    }
  `]
})
export class MovieDetailComponent implements OnInit {
  movie: Movie | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMovie(+id);
    } else {
      this.router.navigate(['/movies']);
    }
  }

  loadMovie(id: number): void {
    this.loading = true;
    this.movieService.getMovie(id).subscribe({
      next: movie => {
        this.movie = movie;
        this.loading = false;
      },
      error: error => {
        this.loading = false;
        this.snackBar.open('Error al cargar película: ' + error.message, 'Cerrar', {
          duration: 5000
        });
        this.router.navigate(['/movies']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/movies']);
  }
}