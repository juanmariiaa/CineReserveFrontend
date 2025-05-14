import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScreeningService } from '../../../../core/services/screening.service';
import { Screening, ScreeningBasicDTO } from '../../../../core/models/screening.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-screening-management',
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
    MatDialogModule,
    FormsModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  template: `
    <div class="screening-management-container">
      <div class="page-header">
        <h1>Screening Management</h1>
        <div class="header-actions">
          <button
            mat-raised-button
            color="primary"
            routerLink="/admin/screenings/create"
          >
            <mat-icon>add</mat-icon> Schedule Screening
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
              <mat-label>Filter Screenings</mat-label>
              <input
                matInput
                (keyup)="applyFilter($event)"
                placeholder="Movie, room, date, etc."
                #input
              />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <div class="table-container">
              <table
                mat-table
                [dataSource]="dataSource"
                matSort
                class="screening-table"
              >
                <!-- ID Column -->
                <ng-container matColumnDef="id">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
                  <td mat-cell *matCellDef="let screening">
                    {{ screening.id }}
                  </td>
                </ng-container>

                <!-- Movie Column -->
                <ng-container matColumnDef="movie">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>
                    Movie
                  </th>
                  <td mat-cell *matCellDef="let screening">
                    <div class="movie-info">
                      <span>{{ screening.movieTitle }}</span>
                    </div>
                  </td>
                </ng-container>

                <!-- Room Column -->
                <ng-container matColumnDef="room">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>
                    Room
                  </th>
                  <td mat-cell *matCellDef="let screening">
                    Room {{ screening.roomNumber }}
                    <span class="seats-info">({{ screening.availableSeats }}/{{ screening.capacity }} seats)</span>
                  </td>
                </ng-container>

                <!-- Date Column -->
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>
                    Date
                  </th>
                  <td mat-cell *matCellDef="let screening">
                    {{ screening.startTime | date : 'MMM d, y' }}
                  </td>
                </ng-container>

                <!-- Time Column -->
                <ng-container matColumnDef="time">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>
                    Time
                  </th>
                  <td mat-cell *matCellDef="let screening">
                    {{ screening.startTime | date : 'h:mm a' }}
                    <div class="screening-badges">
                      <span *ngIf="screening.is3D" class="badge badge-3d">3D</span>
                      <span *ngIf="screening.hasSubtitles" class="badge badge-sub">SUB</span>
                    </div>
                  </td>
                </ng-container>

                <!-- Price Column -->
                <ng-container matColumnDef="price">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>
                    Price
                  </th>
                  <td mat-cell *matCellDef="let screening">
                    €{{ screening.ticketPrice }}
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let screening">
                    <button
                      mat-icon-button
                      color="accent"
                      [routerLink]="['/admin/screenings/edit', screening.id]"
                      matTooltip="Edit"
                    >
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      color="warn"
                      (click)="confirmDelete(screening)"
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
                    No screenings found matching "{{ input.value }}"
                  </td>
                </tr>
              </table>

              <mat-paginator
                [pageSizeOptions]="[5, 10, 25, 100]"
                aria-label="Select page of screenings"
                #paginator
              ></mat-paginator>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .screening-management-container {
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

      .screening-table {
        width: 100%;
      }

      .movie-info {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .movie-info span {
        color: #ffffff;
      }

      .movie-poster {
        width: 40px;
        height: 60px;
        object-fit: cover;
        border-radius: 4px;
      }

      .no-poster {
        width: 40px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #333333;
        border-radius: 4px;
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
export class ScreeningManagementComponent implements OnInit, AfterViewInit {
  screenings: ScreeningBasicDTO[] = [];
  loading = true;
  displayedColumns: string[] = ['id', 'movie', 'room', 'date', 'time', 'price', 'actions'];
  dataSource = new MatTableDataSource<ScreeningBasicDTO>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private screeningService: ScreeningService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadScreenings();
  }

  ngAfterViewInit(): void {
    // This ensures paginator and sort are set after the view is initialized
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadScreenings(): void {
    this.loading = true;
    this.screeningService.getAllScreeningsBasic().subscribe({
      next: (screenings) => {
        this.screenings = screenings;
        this.dataSource.data = this.screenings;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading screenings:', error);
        this.snackBar.open('Error loading screenings. Please try again.', 'Close', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  confirmDelete(screening: ScreeningBasicDTO): void {
    const movieTitle = screening.movieTitle || 'Unknown';
    const roomNumber = screening.roomNumber;
    const screeningDate = new Date(screening.startTime).toLocaleDateString();
    const screeningTime = new Date(screening.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const message = `Are you sure you want to delete screening for "${movieTitle}" in Room ${roomNumber} on ${screeningDate} at ${screeningTime}?`;
    
    if (confirm(message)) {
      this.deleteScreening(screening.id);
    }
  }

  deleteScreening(id: number): void {
    this.screeningService.deleteScreening(id).subscribe({
      next: () => {
        this.snackBar.open('Screening deleted successfully', 'Close', {
          duration: 3000
        });
        this.loadScreenings();
      },
      error: (error) => {
        console.error('Error deleting screening:', error);
        this.snackBar.open('Error deleting screening. Please try again.', 'Close', {
          duration: 5000
        });
      }
    });
  }
}
