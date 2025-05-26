import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservationService } from '../../../../core/services/reservation.service';
import {
  Reservation,
  ReservationStatus,
} from '../../../../core/models/reservation.model';
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
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-reservation-management',
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
    MatBadgeModule,
  ],
  templateUrl: './reservation-management.component.html',
  styles: [
    `
      .reservation-management-container {
        padding: 20px;
        color: #ffffff;
        background-color: transparent;
        min-height: 100vh;
      }

      .dashboard-title-container {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
      }

      .dashboard-title-marker {
        width: 5px;
        height: 30px;
        background-color: #ff6b6b;
        margin-right: 10px;
        border-radius: 3px;
      }

      .dashboard-title {
        margin: 0;
        font-size: 24px;
        font-weight: 500;
        color: #ffffff;
      }

      .action-bar {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
        gap: 10px;
      }

      .back-button {
        background-color: #444444 !important;
        color: white !important;
        transition: background-color 0.3s ease;
      }

      .back-button:hover {
        background-color: #555555 !important;
      }

      .table-card {
        border-radius: 8px;
        background-color: #222222;
        margin-bottom: 20px;
        overflow: hidden;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }

      .cancel-button {
        background-color: #ff6b6b !important;
        color: white !important;
        transition: background-color 0.3s ease;
        padding: 0 12px;
      }

      .cancel-button:hover {
        background-color: #ff5252 !important;
      }

      .cancel-button:disabled {
        background-color: rgba(255, 107, 107, 0.5) !important;
        color: rgba(255, 255, 255, 0.5) !important;
      }

      .status-filter-container {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        flex-wrap: wrap;
        gap: 10px;
      }

      .filter-label {
        font-weight: 500;
        margin-right: 8px;
        color: #ffffff;
      }

      .status-pending {
        color: #000000;
        font-weight: 500;
        padding: 4px 8px;
        border-radius: 4px;
        background-color: #ffc107;
      }

      .status-confirmed {
        color: #ffffff;
        font-weight: 500;
        padding: 4px 8px;
        border-radius: 4px;
        background-color: #ff6b6b;
      }

      .status-cancelled {
        color: #ffffff;
        font-weight: 500;
        padding: 4px 8px;
        border-radius: 4px;
        background-color: #f44336;
      }

      .status-completed {
        color: #ffffff;
        font-weight: 500;
        padding: 4px 8px;
        border-radius: 4px;
        background-color: #3f51b5;
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

      .status-filters {
        margin-bottom: 20px;
      }

      .table-container {
        overflow-x: auto;
      }

      .reservation-table {
        width: 100%;
      }

      .seats-count {
        background-color: rgba(255, 107, 107, 0.2);
        color: #ffffff;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 12px;
      }

      .status-chip {
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 12px;
        display: inline-block;
        color: #ffffff;
      }

      .status-pending {
        background-color: #ff9800;
      }

      .status-confirmed {
        background-color: #ff6b6b;
      }

      .status-completed {
        background-color: #2196f3;
      }

      .status-cancelled {
        background-color: #f44336;
      }

      /* Ensure Angular Material components have proper text color */
      ::ng-deep .mat-mdc-form-field-label {
        color: rgba(255, 255, 255, 0.6) !important;
      }

      ::ng-deep .mat-mdc-input-element {
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

      ::ng-deep .mat-mdc-card-content {
        color: #ffffff !important;
      }

      ::ng-deep .mat-mdc-chip-option {
        color: #ffffff !important;
      }
    `,
  ],
})
export class ReservationManagementComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  reservations: Reservation[] = [];
  loading = true;
  displayedColumns: string[] = [
    'id',
    'user',
    'movie',
    'date',
    'screening',
    'seats',
    'status',
    'actions',
  ];
  dataSource = new MatTableDataSource<Reservation>([]);
  ReservationStatus = ReservationStatus;

  statusOptions = [
    {
      value: ReservationStatus.PENDING,
      label: 'Pending',
      selected: true,
      color: 'warn',
    },
    {
      value: ReservationStatus.CONFIRMED,
      label: 'Confirmed',
      selected: true,
      color: 'primary',
    },
    {
      value: ReservationStatus.CANCELLED,
      label: 'Cancelled',
      selected: true,
      color: 'warn',
    },
    {
      value: ReservationStatus.COMPLETED,
      label: 'Completed',
      selected: true,
      color: 'accent',
    },
  ];

  constructor(
    private reservationService: ReservationService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  ngAfterViewInit(): void {
    // Set up sorting and pagination after the view is initialized
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadReservations(): void {
    this.loading = true;
    this.reservationService.getAllReservations().subscribe({
      next: (data) => {
        this.reservations = data;
        this.dataSource = new MatTableDataSource(this.reservations);
        this.filterByStatus();
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open(
          'Failed to load reservations: ' + error.message,
          'Close',
          {
            duration: 5000,
          }
        );
        this.loading = false;
      },
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  toggleStatusFilter(option: any): void {
    option.selected = !option.selected;
    this.filterByStatus();
  }

  filterByStatus(): void {
    const selectedStatuses = this.statusOptions
      .filter((option) => option.selected)
      .map((option) => option.value);

    if (selectedStatuses.length === 0) {
      this.dataSource.data = this.reservations;
    } else {
      this.dataSource.data = this.reservations.filter((reservation) =>
        selectedStatuses.includes(reservation.status)
      );
    }
  }

  getStatusLabel(status: ReservationStatus): string {
    switch (status) {
      case ReservationStatus.PENDING:
        return 'Pending';
      case ReservationStatus.CONFIRMED:
        return 'Confirmed';
      case ReservationStatus.CANCELLED:
        return 'Cancelled';
      case ReservationStatus.COMPLETED:
        return 'Completed';
      default:
        return 'Unknown';
    }
  }

  getStatusClass(status: ReservationStatus): string {
    switch (status) {
      case ReservationStatus.PENDING:
        return 'status-pending';
      case ReservationStatus.CONFIRMED:
        return 'status-confirmed';
      case ReservationStatus.CANCELLED:
        return 'status-cancelled';
      case ReservationStatus.COMPLETED:
        return 'status-completed';
      default:
        return '';
    }
  }

  confirmCancel(reservation: Reservation): void {
    if (
      confirm(`Are you sure you want to cancel reservation #${reservation.id}?`)
    ) {
      this.cancelReservation(reservation.id!);
    }
  }

  cancelReservation(id: number): void {
    this.reservationService.cancelReservation(id).subscribe({
      next: () => {
        this.snackBar.open('Reservation cancelled successfully', 'Close', {
          duration: 3000,
        });
        this.loadReservations();
      },
      error: (error) => {
        this.snackBar.open(
          'Error cancelling reservation: ' + error.message,
          'Close',
          {
            duration: 5000,
          }
        );
      },
    });
  }
}
