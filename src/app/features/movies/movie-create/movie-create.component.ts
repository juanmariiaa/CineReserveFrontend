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
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
    MatListModule,
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
            </mat-form-field>
          </form>
          
          <div *ngIf="searching" class="loading-spinner">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
          
          <mat-list *ngIf="searchResults.length > 0">
            <h3 mat-subheader>Resultados de la búsqueda</h3>
            <mat-list-item *ngFor="let movie of searchResults" class="movie-result">
              <div class="movie-result-content">
                <h4>{{ movie.title }}</h4>
                <p *ngIf="movie.releaseDate">{{ movie.releaseDate | date }}</p>
                <p *ngIf="movie.overview" class="movie-overview">{{ movie.overview }}</p>
              </div>
              <button mat-raised-button color="primary" (click)="importMovie(movie.id)">
                Importar
              </button>
            </mat-list-item>
          </mat-list>
          
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
    
    .movie-result {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding: 10px;
      border-bottom: 1px solid #eee;
    }
    
    .movie-result-content {
      flex: 1;
    }
    
    .movie-overview {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      line-height: 1.5;
      max-width: 80%;
    }
  `]
})
export class MovieCreateComponent implements OnInit {
  searchForm: FormGroup;
  searchResults: MovieSearchResult[] = [];
  searching = false;
  importing = false;
  private searchTerms = new Subject<string>();

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
