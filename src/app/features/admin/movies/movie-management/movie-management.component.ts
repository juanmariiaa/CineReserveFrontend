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
  styles: [
    `
      .movie-management-container {
        width: 100%;
        color: #ffffff;
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

      .table-card {
        border-radius: 8px;
        overflow: hidden;
        background-color: #333333 !important;
      }

      .loading-spinner {
        display: flex;
        justify-content: center;
        padding: 30px;
      }

      .accent-spinner ::ng-deep circle {
        stroke: #ff6b6b !important;
      }

      .filter-field {
        width: 100%;
        margin-bottom: 16px;
      }

      .table-container {
        overflow-x: auto;
      }

      .movie-table {
        width: 100%;
      }

      .movie-poster {
        width: 50px;
        height: 75px;
        object-fit: cover;
        border-radius: 4px;
      }

      .no-poster {
        width: 50px;
        height: 75px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #444444;
        border-radius: 4px;
      }

      .star-icon {
        color: #ff6b6b !important;
        font-size: 18px;
        height: 18px;
        width: 18px;
      }

      .accent-bg {
        background-color: #ff6b6b !important;
        color: white !important;
      }

      /* Ensure Angular Material components have proper text color */
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

      ::ng-deep .mat-mdc-card-content {
        color: #ffffff !important;
      }

      ::ng-deep .mat-sort-header-content {
        color: #ffffff !important;
      }

      ::ng-deep .mat-mdc-paginator-range-label,
      ::ng-deep .mat-mdc-paginator-page-size-label {
        color: #ffffff !important;
      }

      ::ng-deep .mat-mdc-select-value,
      ::ng-deep .mat-mdc-select-arrow {
        color: #ffffff !important;
      }

      ::ng-deep .mat-mdc-table .mat-mdc-header-cell {
        color: rgba(255, 255, 255, 0.87) !important;
        background-color: #2c2c2c !important;
      }

      ::ng-deep .mat-mdc-table .mat-mdc-cell {
        color: #ffffff !important;
      }

      ::ng-deep .mat-mdc-raised-button:not(.accent-bg) {
        background-color: #444444 !important;
        color: #ffffff !important;
      }

      ::ng-deep .mat-mdc-paginator {
        background-color: #2c2c2c !important;
      }

      ::ng-deep .mat-mdc-icon-button {
        color: rgba(255, 255, 255, 0.7) !important;
      }

      ::ng-deep .mat-mdc-icon-button:disabled {
        color: rgba(255, 255, 255, 0.3) !important;
      }

      @media (max-width: 768px) {
        .action-bar {
          flex-direction: column;
          align-items: flex-end;
        }

        .action-bar button {
          width: auto;
        }
      }
    `,
  ],
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
