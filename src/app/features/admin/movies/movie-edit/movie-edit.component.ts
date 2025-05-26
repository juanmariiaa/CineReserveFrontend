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
      <div class="dashboard-title-container">
        <div class="dashboard-title-marker"></div>
        <h1 class="dashboard-title">Edit Movie</h1>
      </div>

      <div class="action-bar">
        <button mat-raised-button routerLink="/admin/movies">
          <mat-icon>arrow_back</mat-icon> Back to Movie List
        </button>
      </div>

      <div *ngIf="loading" class="loading-spinner">
        <mat-spinner class="accent-spinner"></mat-spinner>
      </div>

      <div *ngIf="!loading && movie">
        <div class="movie-header">
          <div class="movie-poster-container" *ngIf="movie.posterUrl">
            <img [src]="movie.posterUrl" [alt]="movie.title" class="movie-poster">
          </div>
          <div class="movie-info">
            <h2>{{ movie.title }}</h2>
            <p *ngIf="movie.releaseDate">Release date: {{ movie.releaseDate | date }}</p>
            <p *ngIf="movie.tmdbId">TMDB ID: {{ movie.tmdbId }}</p>
          </div>
        </div>

        <mat-card class="form-card">
          <mat-card-content>
            <form [formGroup]="movieForm" (ngSubmit)="onSubmit()">
              <div class="form-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Title</mat-label>
                  <input matInput formControlName="title" required>
                  <mat-error *ngIf="movieForm.get('title')?.hasError('required')">
                    Title is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Duration (minutes)</mat-label>
                  <input matInput type="number" formControlName="durationMinutes">
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Release date</mat-label>
                  <input matInput formControlName="releaseDate" [matDatepicker]="picker">
                  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Language</mat-label>
                  <input matInput formControlName="language">
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="5"></textarea>
              </mat-form-field>

              <div class="form-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Poster URL</mat-label>
                  <input matInput formControlName="posterUrl">
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Backdrop URL</mat-label>
                  <input matInput formControlName="backdropUrl">
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Rating</mat-label>
                  <input matInput formControlName="rating">
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Director</mat-label>
                  <input matInput formControlName="director">
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Trailer URL</mat-label>
                <input matInput formControlName="trailerUrl">
              </mat-form-field>

              <div class="form-actions">
                <button mat-button type="button" (click)="resetForm()" [disabled]="saving">
                  Cancel Changes
                </button>
                <button mat-raised-button class="accent-bg" type="submit" [disabled]="movieForm.invalid || saving">
                  <mat-icon>save</mat-icon> Save
                  <mat-spinner *ngIf="saving" diameter="20" class="button-spinner"></mat-spinner>
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
      width: 100%;
      color: #ffffff;
      background-color: transparent;
    }

    .dashboard-title-container {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
    }

    .dashboard-title-marker {
      width: 5px;
      height: 30px;
      background-color: #ff6b6b;
      margin-right: 10px;
    }

    .dashboard-title {
      color: #ffffff;
      font-size: 24px;
      font-weight: 500;
      margin: 0;
    }
    
    .action-bar {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-bottom: 20px;
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 50px;
    }
    
    .accent-spinner ::ng-deep circle {
      stroke: #ff6b6b !important;
    }
    
    .button-spinner {
      display: inline-block;
      margin-left: 8px;
    }

    .movie-header {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      background-color: #333333;
      border-radius: 8px;
      padding: 20px;
    }

    .movie-poster-container {
      width: 120px;
      height: 180px;
      overflow: hidden;
      border-radius: 4px;
    }

    .movie-poster {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .movie-info {
      flex: 1;
    }
    
    .movie-info h2 {
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 10px;
    }
    
    .movie-info p {
      color: rgba(255, 255, 255, 0.7);
      margin: 5px 0;
    }
    
    .form-card {
      border-radius: 8px;
      overflow: hidden;
      background-color: #333333 !important;
      margin-bottom: 20px;
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
      text-align: center;
      padding: 50px 0;
      background-color: #333333;
      border-radius: 8px;
    }

    .not-found mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
      color: #ffffff;
    }
    
    .accent-bg {
      background-color: #ff6b6b !important;
      color: white !important;
    }

    ::ng-deep .mat-mdc-card {
      background-color: #333333 !important;
      color: #ffffff !important;
    }

    ::ng-deep .mat-mdc-form-field-label {
      color: rgba(255, 255, 255, 0.6) !important;
    }

    ::ng-deep .mat-mdc-input-element {
      color: #ffffff !important;
    }

    ::ng-deep .mat-mdc-form-field-infix input, 
    ::ng-deep .mat-mdc-form-field-infix textarea {
      color: #ffffff !important;
    }

    ::ng-deep .mat-mdc-icon {
      color: rgba(255, 255, 255, 0.7);
    }

    ::ng-deep .mat-mdc-raised-button:not(.accent-bg) {
      background-color: #444444 !important;
      color: #ffffff !important;
    }

    ::ng-deep .mat-mdc-button {
      color: rgba(255, 255, 255, 0.7) !important;
    }

    ::ng-deep .mat-mdc-datepicker-toggle {
      color: rgba(255, 255, 255, 0.7) !important;
    }
    
    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
        gap: 0;
      }
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
