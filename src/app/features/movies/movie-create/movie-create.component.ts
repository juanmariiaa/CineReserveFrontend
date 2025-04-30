import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MovieService } from '../../../core/services/movie.service';
import { MovieSearchResult } from '../../../core/models/movie.model';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, of } from 'rxjs';

@Component({
  selector: 'app-movie-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="movie-create-container">
      <h1>Añadir película</h1>
      
      <mat-card>
        <mat-card-content>
          <form [formGroup]="searchForm" class="search-form">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar película</mat-label>
              <input matInput formControlName="searchTerm" placeholder="Título de la película">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </form>
          
          <div *ngIf="searching" class="loading-spinner">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
          
          <div *ngIf="searchResults.length > 0" class="search-results-grid">
            <mat-card *ngFor="let movie of searchResults" class="movie-card">
              <div class="poster-container" *ngIf="movie.posterPath">
                <img *ngIf="movie.posterPath" [src]="movie.posterPath" 
                     [alt]="movie.title" class="movie-poster">
                <div *ngIf="!movie.posterPath" class="no-poster">

                  <mat-icon>movie</mat-icon>
                </div>
              </div>
              
              <mat-card-content class="movie-card-content">
                <h3 class="movie-title">{{ movie.title }}</h3>
                
                <div class="movie-metadata">
                  <span *ngIf="movie.releaseDate" class="release-date">
                    <mat-icon class="meta-icon">calendar_today</mat-icon>
                    {{ movie.releaseDate | date:'yyyy' }}
                  </span>
                  
                  <span *ngIf="movie.voteAverage" class="vote-average">
                    <mat-icon class="meta-icon star-icon">star</mat-icon>
                    {{ movie.voteAverage }} / 10
                  </span>
                </div>
                
                <p *ngIf="movie.overview" class="movie-overview">{{ movie.overview }}</p>
                

              </mat-card-content>
              
              <mat-card-actions align="end">
                <button mat-raised-button color="primary" (click)="importMovie(movie.id)">
                  <mat-icon>add</mat-icon> Importar
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
          
          <div *ngIf="!searching && searchResults.length === 0 && searchForm.get('searchTerm')?.value" class="no-results">
            <mat-icon>search_off</mat-icon>
            <p>No se encontraron resultados</p>
          </div>
          
          <div *ngIf="importing" class="importing-spinner">
            <mat-spinner></mat-spinner>
            <p>Importando película...</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .movie-create-container {
      padding: 20px;
    }
    
    .search-form {
      margin-bottom: 20px;
    }
    
    .search-field {
      width: 100%;
    }
    
    .loading-spinner, .importing-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 0;
    }
    
    .search-results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    
    .movie-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      transition: all 0.3s ease;
      overflow: hidden;
    }
    
    .movie-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 10px rgba(0,0,0,0.15);
    }
    
    .poster-container {
      height: 300px;
      overflow: hidden;
      background-color: #f0f0f0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .movie-poster {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .no-poster {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      background-color: #e0e0e0;
    }
    
    .no-poster mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #888;
    }
    
    .movie-card-content {
      flex-grow: 1;
      padding: 16px;
    }
    
    .movie-title {
      margin: 0 0 8px;
      font-size: 18px;
      font-weight: 500;
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .movie-metadata {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 12px;
      color: #666;
      font-size: 14px;
    }
    
    .meta-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      vertical-align: middle;
      margin-right: 4px;
    }
    
    .star-icon {
      color: gold;
    }
    
    .movie-overview {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      line-height: 1.5;
      font-size: 14px;
      color: #555;
      margin-bottom: 12px;
      height: 63px; /* Approximately 3 lines */
    }
    
    .genre-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 10px;
    }
    
    .genre-chips .mat-mdc-chip {
      font-size: 12px;
      min-height: 24px;
    }
    
    .no-results {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 30px;
      color: #888;
    }
    
    .no-results mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }
  `]
})
export class MovieCreateComponent implements OnInit {
  searchForm: FormGroup;
  searchResults: MovieSearchResult[] = [];
  searching = false;
  importing = false;
  
  // Simple genre mapping - you might want to fetch these from an API
  genres: Record<number, string> = {
    28: 'Acción',
    12: 'Aventura',
    16: 'Animación',
    35: 'Comedia',
    80: 'Crimen',
    99: 'Documental',
    18: 'Drama',
    10751: 'Familia',
    14: 'Fantasía',
    36: 'Historia',
    27: 'Terror',
    10402: 'Música',
    9648: 'Misterio',
    10749: 'Romance',
    878: 'Ciencia ficción',
    10770: 'Película de TV',
    53: 'Suspense',
    10752: 'Guerra',
    37: 'Western'
  };

  constructor(
    private fb: FormBuilder,
    private movieService: MovieService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.searchForm = this.fb.group({
      searchTerm: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.searchForm.get('searchTerm')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(term => {
        if (term && term.length >= 2) {
          this.searching = true;
          return this.movieService.searchMovies(term);
        }
        this.searchResults = [];
        return of([]);
      })
    ).subscribe({
      next: results => {
        this.searchResults = results;
        this.searching = false;
      },
      error: error => {
        this.searching = false;
        this.snackBar.open('Error al buscar películas: ' + error.message, 'Cerrar', {
          duration: 5000
        });
      }
    });
  }

  getGenreName(genreId: number): string {
    return this.genres[genreId] || 'Otro';
  }

  importMovie(tmdbId: number): void {
    this.importing = true;
    this.movieService.createMovieFromTMDB(tmdbId).subscribe({
      next: movie => {
        this.importing = false;
        this.snackBar.open(`Película "${movie.title}" importada con éxito`, 'Cerrar', {
          duration: 3000
        });
        this.router.navigate(['/movies']);
      },
      error: error => {
        this.importing = false;
        this.snackBar.open('Error al importar película: ' + error.message, 'Cerrar', {
          duration: 5000
        });
      }
    });
  }
}