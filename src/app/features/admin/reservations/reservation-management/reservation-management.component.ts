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
  styleUrls: ['./reservation-management.component.scss'],
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
