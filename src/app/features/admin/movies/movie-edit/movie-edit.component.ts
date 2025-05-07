import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MovieService } from '../../../../core/services/movie.service';
import { Movie } from '../../../../core/models/movie.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-movie-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="movie-edit-container">
      <div class="page-header">
        <h1>Editar Película</h1>
        <button mat-raised-button color="accent" routerLink="/admin/movies">
          <mat-icon>arrow_back</mat-icon> Volver a la lista
        </button>
      </div>

      <div *ngIf="loading" class="loading-spinner">
        <mat-spinner></mat-spinner>
      </div>

      <div *ngIf="!loading && movie">
        <div class="movie-header">
          <div class="movie-poster-container" *ngIf="movie.posterUrl">
            <img [src]="movie.posterUrl" [alt]="movie.title" class="movie-poster">
          </div>
          <div class="movie-info">
            <h2>{{ movie.title }}</h2>
            <p *ngIf="movie.releaseDate">Fecha de estreno: {{ movie.releaseDate | date }}</p>
            <p *ngIf="movie.tmdbId">TMDB ID: {{ movie.tmdbId }}</p>
          </div>
        </div>

        <mat-card>
          <mat-card-content>
            <form [formGroup]="movieForm" (ngSubmit)="onSubmit()">
              <div class="form-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Título</mat-label>
                  <input matInput formControlName="title" required>
                  <mat-error *ngIf="movieForm.get('title')?.hasError('required')">
                    El título es obligatorio
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Duración (minutos)</mat-label>
                  <input matInput type="number" formControlName="durationMinutes">
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Fecha de estreno</mat-label>
                  <input matInput formControlName="releaseDate" [matDatepicker]="picker">
                  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Idioma</mat-label>
                  <input matInput formControlName="language">
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Descripción</mat-label>
                <textarea matInput formControlName="description" rows="5"></textarea>
              </mat-form-field>

              <div class="form-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Director</mat-label>
                  <input matInput formControlName="director">
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Calificación</mat-label>
                  <input matInput formControlName="rating">
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>URL del Poster</mat-label>
                  <input matInput formControlName="posterUrl">
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>URL del Backdrop</mat-label>
                  <input matInput formControlName="backdropUrl">
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>URL del Trailer</mat-label>
                <input matInput formControlName="trailerUrl">
              </mat-form-field>

              <div class="form-actions">
                <button type="button" mat-button color="warn" (click)="resetForm()">
                  Restablecer
                </button>
                <button type="submit" mat-raised-button color="primary" [disabled]="movieForm.invalid || saving">
                  <mat-icon>save</mat-icon> Guardar cambios
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>

      <div *ngIf="!loading && !movie" class="not-found">
        <mat-icon>movie_off</mat-icon>
        <h2>Película no encontrada</h2>
        <p>La película que estás buscando no existe o ha sido eliminada.</p>
        <button mat-raised-button color="primary" routerLink="/admin/movies">
          Volver a la lista de películas
        </button>
      </div>
    </div>
  `,
  styles: [`
    .movie-edit-container {
      padding: 20px;
    }

    .page-header {
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

    .movie-header {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      align-items: flex-start;
    }

    .movie-poster-container {
      flex-shrink: 0;
    }

    .movie-poster {
      width: 150px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .movie-info {
      flex-grow: 1;
    }

    .form-row {
      display: flex;
      gap: 20px;
      margin-bottom: 16px;
    }

    .form-field {
      flex: 1;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }

    .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 50px 0;
      text-align: center;
    }

    .not-found mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      color: #888;
    }
  `]
})
export class MovieEditComponent implements OnInit {
  movie: Movie | null = null;
  movieForm: FormGroup;
  loading = true;
  saving = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.movieForm = this.createForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMovie(+id);
    } else {
      this.loading = false;
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      description: [''],
      durationMinutes: [null],
      releaseDate: [null],
      posterUrl: [''],
      backdropUrl: [''],
      rating: [''],
      language: [''],
      director: [''],
      trailerUrl: ['']
    });
  }

  loadMovie(id: number): void {
    this.loading = true;
    this.movieService.getMovie(id).subscribe({
      next: (movie) => {
        this.movie = movie;
        this.populateForm(movie);
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Error al cargar la película: ' + error.message, 'Cerrar', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }

  populateForm(movie: Movie): void {
    this.movieForm.patchValue({
      title: movie.title,
      description: movie.description,
      durationMinutes: movie.durationMinutes,
      releaseDate: movie.releaseDate ? new Date(movie.releaseDate) : null,
      posterUrl: movie.posterUrl,
      backdropUrl: movie.backdropUrl,
      rating: movie.rating,
      language: movie.language,
      director: movie.director,
      trailerUrl: movie.trailerUrl
    });
  }

  resetForm(): void {
    if (this.movie) {
      this.populateForm(this.movie);
    }
  }

  onSubmit(): void {
    if (this.movieForm.invalid) {
      return;
    }

    this.saving = true;

    // Since there's no endpoint for updating movies, we'll just show a message
    setTimeout(() => {
      this.snackBar.open('Esta funcionalidad aún no está implementada en el backend', 'Cerrar', {
        duration: 5000
      });
      this.saving = false;
    }, 1000);

    // When the backend endpoint is implemented, we would do something like:
    /*
    const updatedMovie = {
      ...this.movie,
      ...this.movieForm.value
    };

    this.movieService.updateMovie(updatedMovie).subscribe({
      next: () => {
        this.snackBar.open('Película actualizada con éxito', 'Cerrar', {
          duration: 3000
        });
        this.router.navigate(['/admin/movies']);
      },
      error: (error) => {
        this.snackBar.open('Error al actualizar la película: ' + error.message, 'Cerrar', {
          duration: 5000
        });
        this.saving = false;
      }
    });
    */
  }
}
