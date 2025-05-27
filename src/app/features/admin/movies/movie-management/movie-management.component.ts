import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MovieService } from '../../../../core/services/movie.service';
import { Movie } from '../../../../core/models/movie.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-movie-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
  ],
  templateUrl: './movie-management.component.html',
  styleUrls: ['./movie-management.component.scss'],
})
export class MovieManagementComponent implements OnInit {
  movies: Movie[] = [];
  loading = true;
  displayedColumns: string[] = [
    'id',
    'poster',
    'title',
    'releaseDate',
    'duration',
    'rating',
    'actions',
  ];
  dataSource: any;

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
        this.dataSource = this.movies;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading movies: ' + error.message, 'Close', {
          duration: 5000,
        });
        this.loading = false;
      },
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  confirmDelete(movie: Movie): void {
    if (
      confirm(`Are you sure you want to delete the movie "${movie.title}"?`)
    ) {
      this.deleteMovie(movie.id!);
    }
  }

  deleteMovie(id: number): void {
    this.movieService.deleteMovie(id).subscribe({
      next: () => {
        this.snackBar.open('Movie deleted successfully', 'Close', {
          duration: 3000,
        });
        this.loadMovies();
      },
      error: (error) => {
        this.snackBar.open('Error deleting movie: ' + error.message, 'Close', {
          duration: 5000,
        });
      },
    });
  }
}
