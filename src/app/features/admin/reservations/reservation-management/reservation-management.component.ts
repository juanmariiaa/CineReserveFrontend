import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservationService } from '../../../../core/services/reservation.service';
import { Reservation, ReservationStatus } from '../../../../core/models/reservation.model';
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
    MatBadgeModule
  ],
  template: `
    <div class="reservation-management-container">
      <div class="page-header">
        <h1>Reservation Management</h1>
        <button mat-raised-button color="accent" routerLink="/admin/dashboard">
          <mat-icon>arrow_back</mat-icon> Back to Dashboard
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div *ngIf="loading" class="loading-spinner">
            <mat-spinner></mat-spinner>
          </div>

          <div *ngIf="!loading">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Filter reservations</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="User, movie, status..." #input>
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <div class="status-filters">
              <mat-chip-listbox [multiple]="true" (change)="filterByStatus()">
                <mat-chip-option *ngFor="let status of statusOptions"
                  [value]="status.value"
                  [selected]="status.selected"
                  [color]="status.color">
                  {{ status.label }}
                </mat-chip-option>
              </mat-chip-listbox>
            </div>

            <div class="table-container">
              <table mat-table [dataSource]="dataSource" matSort class="reservation-table">
                <!-- ID Column -->
                <ng-container matColumnDef="id">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header> ID </th>
                  <td mat-cell *matCellDef="let reservation"> {{reservation.id}} </td>
                </ng-container>

                <!-- User Column -->
                <ng-container matColumnDef="user">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header> User </th>
                  <td mat-cell *matCellDef="let reservation">
                    {{ reservation.user?.username || 'Unknown' }}
                  </td>
                </ng-container>

                <!-- Movie Column -->
                <ng-container matColumnDef="movie">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header> Movie </th>
                  <td mat-cell *matCellDef="let reservation">
                    {{ reservation.screening?.movie?.title || 'Unknown' }}
                  </td>
                </ng-container>

                <!-- Date Column -->
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header> Date </th>
                  <td mat-cell *matCellDef="let reservation">
                    {{ reservation.reservationDate | date:'dd/MM/yyyy HH:mm' }}
                  </td>
                </ng-container>

                <!-- Screening Column -->
                <ng-container matColumnDef="screening">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header> Screening </th>
                  <td mat-cell *matCellDef="let reservation">
                    {{ reservation.screening?.date | date:'dd/MM/yyyy' }}
                    {{ reservation.screening?.startTime }}
                  </td>
                </ng-container>

                <!-- Seats Column -->
                <ng-container matColumnDef="seats">
                  <th mat-header-cell *matHeaderCellDef> Seats </th>
                  <td mat-cell *matCellDef="let reservation">
                    <span *ngIf="reservation.seatReservations?.length" class="seats-count">
                      {{ reservation.seatReservations.length }} seats
                    </span>
                    <span *ngIf="!reservation.seatReservations?.length">-</span>
                  </td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
                  <td mat-cell *matCellDef="let reservation">
                    <span class="status-chip" [ngClass]="getStatusClass(reservation.status)">
                      {{ getStatusLabel(reservation.status) }}
                    </span>
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef> Actions </th>
                  <td mat-cell *matCellDef="let reservation">
                    <button mat-icon-button color="primary" matTooltip="View details">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      color="accent"
                      matTooltip="Edit seats"
                      [disabled]="reservation.status === ReservationStatus.CANCELLED ||
                                 reservation.status === ReservationStatus.COMPLETED">
                      <mat-icon>event_seat</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      color="warn"
                      (click)="confirmCancel(reservation)"
                      matTooltip="Cancel reservation"
                      [disabled]="reservation.status === ReservationStatus.CANCELLED ||
                                 reservation.status === ReservationStatus.COMPLETED">
                      <mat-icon>cancel</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

                <!-- No data row -->
                <tr class="mat-row" *matNoDataRow>
                  <td class="mat-cell" colspan="8">No reservations found matching "{{input.value}}"</td>
                </tr>
              </table>

              <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select reservation page"></mat-paginator>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .reservation-management-container {
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

    .filter-field {
      width: 100%;
      margin-bottom: 20px;
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
      display: inline-flex;
      align-items: center;
    }

    .status-chip {
      padding: 4px 8px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-pending {
      background-color: #FFF9C4;
      color: #F57F17;
    }

    .status-confirmed {
      background-color: #C8E6C9;
      color: #2E7D32;
    }

    .status-cancelled {
      background-color: #FFCDD2;
      color: #C62828;
    }

    .status-completed {
      background-color: #BBDEFB;
      color: #1565C0;
    }
  `]
})
export class ReservationManagementComponent implements OnInit {
  reservations: Reservation[] = [];
  loading = true;
  displayedColumns: string[] = ['id', 'user', 'movie', 'date', 'screening', 'seats', 'status', 'actions'];
  dataSource: any;
  ReservationStatus = ReservationStatus;

  statusOptions = [
    { value: ReservationStatus.PENDING, label: 'Pending', selected: true, color: 'warn' },
    { value: ReservationStatus.CONFIRMED, label: 'Confirmed', selected: true, color: 'primary' },
    { value: ReservationStatus.CANCELLED, label: 'Cancelled', selected: false, color: 'warn' },
    { value: ReservationStatus.COMPLETED, label: 'Completed', selected: true, color: 'accent' }
  ];

  constructor(
    private reservationService: ReservationService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading = true;
    this.reservationService.getAllReservations().subscribe({
      next: (data) => {
        this.reservations = data;
        this.dataSource = this.reservations;
        this.filterByStatus();
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load reservations: ' + error.message, 'Close', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  filterByStatus(): void {
    const selectedStatuses = this.statusOptions
      .filter(option => option.selected)
      .map(option => option.value);

    if (selectedStatuses.length === 0) {
      this.dataSource = this.reservations;
    } else {
      this.dataSource = this.reservations.filter(reservation =>
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
    if (confirm(`Are you sure you want to cancel reservation #${reservation.id}?`)) {
      this.cancelReservation(reservation.id!);
    }
  }

  cancelReservation(id: number): void {
    this.reservationService.cancelReservation(id).subscribe({
      next: () => {
        this.snackBar.open('Reservation cancelled successfully', 'Close', {
          duration: 3000
        });
        this.loadReservations();
      },
      error: (error) => {
        this.snackBar.open('Error cancelling reservation: ' + error.message, 'Close', {
          duration: 5000
        });
      }
    });
  }
}
