import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './movie-create.component.html',
  styleUrls: ['./movie-create.component.scss'],
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
    37: 'Western',
  };

  constructor(
    private fb: FormBuilder,
    private movieService: MovieService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.searchForm = this.fb.group({
      searchTerm: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  ngOnInit(): void {
    this.searchForm
      .get('searchTerm')
      ?.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((term) => {
          if (term && term.length >= 2) {
            this.searching = true;
            return this.movieService.searchMovies(term);
          }
          this.searchResults = [];
          return of([]);
        })
      )
      .subscribe({
        next: (results) => {
          this.searchResults = results;
          this.searching = false;
        },
        error: (error) => {
          this.searching = false;
          this.snackBar.open(
            'Error al buscar películas: ' + error.message,
            'Cerrar',
            {
              duration: 5000,
            }
          );
        },
      });
  }

  getGenreName(genreId: number): string {
    return this.genres[genreId] || 'Otro';
  }

  getPosterPath(movie: MovieSearchResult): string | null {
    // Base URL para imágenes de TMDB
    const tmdbImageBaseUrl = 'https://image.tmdb.org/t/p/w500';

    // Verificar varias posibles propiedades
    const posterPath = movie.posterPath || movie.poster_path || movie.posterUrl;

    if (!posterPath) return null;

    // Si ya es una URL completa, devolverla tal cual
    if (posterPath.startsWith('http')) {
      return posterPath;
    }

    // Si es una ruta relativa (comienza con /), agregar la base URL de TMDB
    if (posterPath.startsWith('/')) {
      return `${tmdbImageBaseUrl}${posterPath}`;
    }

    // En cualquier otro caso, devolver la ruta tal cual
    return posterPath;
  }

  importMovie(tmdbId: number): void {
    this.importing = true;
    this.movieService.createMovieFromTMDB(tmdbId).subscribe({
      next: (movie) => {
        this.importing = false;
        this.snackBar.open(
          `Película "${movie.title}" importada con éxito`,
          'Cerrar',
          {
            duration: 3000,
          }
        );
        this.router.navigate(['/admin/movies']);
      },
      error: (error) => {
        this.importing = false;
        this.snackBar.open(
          'Error al importar película: ' + error.message,
          'Cerrar',
          {
            duration: 5000,
          }
        );
      },
    });
  }
}
