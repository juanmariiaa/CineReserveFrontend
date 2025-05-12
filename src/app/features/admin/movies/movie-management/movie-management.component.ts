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
  template: `
    <div class="movie-management-container">
      <div class="page-header">
        <h1>Movie Management</h1>
        <div class="header-actions">
          <button
            mat-raised-button
            color="primary"
            routerLink="/admin/movies/add"
          >
            <mat-icon>add</mat-icon> Add Movie
          </button>
          <button
            mat-raised-button
            color="accent"
            routerLink="/admin/dashboard"
          >
            <mat-icon>arrow_back</mat-icon> Back to Dashboard
          </button>
        </div>
      </div>

      <mat-card>
        <mat-card-content>
          <div *ngIf="loading" class="loading-spinner">
            <mat-spinner></mat-spinner>
          </div>

          <div *ngIf="!loading">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Filter Movies</mat-label>
              <input
                matInput
                (keyup)="applyFilter($event)"
                placeholder="Title, genre, etc."
                #input
              />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <div class="table-container">
              <table
                mat-table
                [dataSource]="dataSource"
                matSort
                class="movie-table"
              >
                <!-- ID Column -->
                <ng-container matColumnDef="id">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
                  <td mat-cell *matCellDef="let movie">{{ movie.id }}</td>
                </ng-container>

                <!-- Poster Column -->
                <ng-container matColumnDef="poster">
                  <th mat-header-cell *matHeaderCellDef>Poster</th>
                  <td mat-cell *matCellDef="let movie">
                    <img
                      *ngIf="movie.posterUrl"
                      [src]="movie.posterUrl"
                      alt="Poster"
                      class="movie-poster"
                    />
                    <div *ngIf="!movie.posterUrl" class="no-poster">
                      <mat-icon>image_not_supported</mat-icon>
                    </div>
                  </td>
                </ng-container>

                <!-- Title Column -->
                <ng-container matColumnDef="title">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>
                    Title
                  </th>
                  <td mat-cell *matCellDef="let movie">{{ movie.title }}</td>
                </ng-container>

                <!-- Release Date Column -->
                <ng-container matColumnDef="releaseDate">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>
                    Release Date
                  </th>
                  <td mat-cell *matCellDef="let movie">
                    {{ movie.releaseDate | date }}
                  </td>
                </ng-container>

                <!-- Duration Column -->
                <ng-container matColumnDef="duration">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>
                    Duration
                  </th>
                  <td mat-cell *matCellDef="let movie">
                    {{ movie.durationMinutes }} min
                  </td>
                </ng-container>

                <!-- Rating Column -->
                <ng-container matColumnDef="rating">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>
                    Rating
                  </th>
                  <td mat-cell *matCellDef="let movie">
                    <span *ngIf="movie.voteAverage" class="rating">
                      <mat-icon class="star-icon">star</mat-icon>
                      {{ movie.voteAverage }}
                    </span>
                    <span *ngIf="!movie.voteAverage">-</span>
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let movie">
                    <button
                      mat-icon-button
                      color="primary"
                      [routerLink]="['/movies', movie.id]"
                      matTooltip="View Details"
                    >
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      color="accent"
                      [routerLink]="['/admin/movies/edit', movie.id]"
                      matTooltip="Edit"
                    >
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      color="warn"
                      (click)="confirmDelete(movie)"
                      matTooltip="Delete"
                    >
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr
                  mat-row
                  *matRowDef="let row; columns: displayedColumns"
                ></tr>

                <!-- Row shown when there is no matching data. -->
                <tr class="mat-row" *matNoDataRow>
                  <td class="mat-cell" colspan="7">
                    No movies found matching "{{ input.value }}"
                  </td>
                </tr>
              </table>

              <mat-paginator
                [pageSizeOptions]="[5, 10, 25, 100]"
                aria-label="Select page of movies"
              ></mat-paginator>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .movie-management-container {
        padding: 20px;
        color: #ffffff;
        background-color: #181818;
        min-height: 100vh;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      h1 {
        color: #ffffff;
        margin: 0;
      }

      .header-actions {
        display: flex;
        gap: 10px;
      }

      .loading-spinner {
        display: flex;
        justify-content: center;
        padding: 30px;
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
        background-color: #333333;
        border-radius: 4px;
      }

      .star-icon {
        color: #00b020 !important;
        font-size: 18px;
        height: 18px;
        width: 18px;
      }

      /* Ensure Angular Material components have proper text color */
      ::ng-deep .mat-mdc-card {
        background-color: #222222 !important;
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
        background-color: #202020 !important;
      }

      ::ng-deep .mat-mdc-table .mat-mdc-cell {
        color: #ffffff !important;
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
