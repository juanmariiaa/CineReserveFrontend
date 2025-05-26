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
  templateUrl: './screening-management.component.html',
  styles: [
    `
      .screening-management-container {
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

      .screening-table {
        width: 100%;
      }

      .movie-info {
        display: flex;
        align-items: center;
        gap: 10px;
      }
    
      .poster-container {
        width: 60px;
        height: 90px;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        border-radius: 4px;
        background-color: #333;
        margin: 8px auto;
      }
    
      .movie-poster {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .no-poster {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        color: #666;
      }

      .format-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }

      .format-badge {
        font-size: 11px;
        padding: 3px 6px;
        border-radius: 12px;
        background-color: rgba(255, 107, 107, 0.2);
        color: #ff6b6b;
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
export class ScreeningManagementComponent implements OnInit, AfterViewInit {
  screenings: ScreeningBasicDTO[] = [];
  loading = true;
  displayedColumns: string[] = ['id', 'poster', 'movie', 'room', 'date', 'time', 'format', 'actions'];
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
