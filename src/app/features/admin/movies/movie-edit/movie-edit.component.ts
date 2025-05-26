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
  templateUrl: './movie-edit.component.html',
  styleUrls: ['./movie-edit.component.scss'],
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
