import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MovieService } from '../../../core/services/movie.service';
import { Movie } from '../../../core/models/movie.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="movie-list-container">
      <div class="movie-list-header">
        <h1>Películas</h1>
        <button mat-raised-button color="primary" routerLink="/movies/add">
          <mat-icon>add</mat-icon> Añadir película
        </button>
      </div>
      
      <div *ngIf="loading" class="loading-spinner">
        <mat-spinner></mat-spinner>
      </div>
      
      <div *ngIf="!loading && movies.length === 0" class="no-movies">
        <p>No hay películas disponibles</p>
      </div>
      
      <div class="movie-grid">
        <mat-card *ngFor="let movie of movies" class="movie-card">
          <img 
            *ngIf="movie.posterUrl" 
            [src]="movie.posterUrl" 
            [alt]="movie.title" 
            class="movie-poster"
          >
          <div *ngIf="!movie.posterUrl" class="movie-poster-placeholder">
            <mat-icon>image_not_supported</mat-icon>
          </div>
          
          <mat-card-content>
            <h3>{{ movie.title }}</h3>
            <p class="year" *ngIf="movie.releaseDate">{{ movie.releaseDate | date:'yyyy' }}</p>
            <p class="rating" *ngIf="movie.voteAverage">
              <mat-icon class="star-icon">star</mat-icon> {{ movie.voteAverage }}
            </p>
            <p class="duration" *ngIf="movie.durationMinutes">
              {{ movie.durationMinutes }} min
            </p>
          </mat-card-content>
          
          <mat-card-actions>
            <button mat-button color="primary" [routerLink]="['/movies', movie.id]">
              <mat-icon>visibility</mat-icon> Detalles
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .movie-list-container {
      padding: 20px;
    }
    
    .movie-list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 50px 0;
    }
    
    .no-movies {
      text-align: center;
      padding: 50px 0;
    }
    
    .movie-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
    }
    
    .movie-card {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    
    .movie-poster {
      height: 300px;
      object-fit: cover;
    }
    
    .movie-poster-placeholder {
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f0f0f0;
    }
    
    .star-icon {
      color: gold;
      font-size: 18px;
      height: 18px;
      width: 18px;
      vertical-align: middle;
      margin-right: 4px;
    }
  `]
})
export class MovieListComponent implements OnInit {
  movies: Movie[] = [];
  loading = true;

  constructor(
    private movieService: MovieService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.loading = true;
    this.movieService.getAllMovies().subscribe({
      next: (data) => {
        this.movies = data;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Error al cargar películas: ' + error.message, 'Cerrar', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }
}