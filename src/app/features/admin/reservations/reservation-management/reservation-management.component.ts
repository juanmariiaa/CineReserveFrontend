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
      color: #FFFFFF;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    h1 {
      color: #FFFFFF;
      margin: 0;
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

    ::ng-deep .mat-form-field-label {
      color: rgba(255, 255, 255, 0.7) !important;
    }

    ::ng-deep .mat-form-field-outline {
      color: rgba(255, 255, 255, 0.3) !important;
    }

    ::ng-deep .mat-form-field-infix input {
      color: #FFFFFF !important;
    }

    ::ng-deep .mat-icon {
      color: rgba(255, 255, 255, 0.7);
    }

    ::ng-deep .mat-card {
      background-color: #222222;
      color: #FFFFFF;
      border: 1px solid #3a3a3a;
    }

    .status-filters {
      margin-bottom: 20px;
    }

    ::ng-deep .mat-chip-listbox {
      background-color: transparent;
    }

    ::ng-deep .mat-chip-option {
      background-color: #333333 !important;
      color: #FFFFFF !important;
    }

    ::ng-deep .mat-chip-option.mat-chip-selected {
      background-color: rgba(0, 176, 32, 0.3) !important;
      color: #FFFFFF !important;
    }

    .table-container {
      overflow-x: auto;
    }

    .reservation-table {
      width: 100%;
      background-color: transparent;
    }

    ::ng-deep .mat-table {
      background-color: transparent !important;
    }

    ::ng-deep .mat-header-cell {
      color: rgba(255, 255, 255, 0.9) !important;
      font-weight: 500;
      background-color: #1a1a1a;
    }

    ::ng-deep .mat-cell {
      color: rgba(255, 255, 255, 0.7) !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
    }

    ::ng-deep .mat-row:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }

    ::ng-deep .mat-paginator {
      background-color: transparent;
      color: #FFFFFF;
    }

    ::ng-deep .mat-paginator-page-size-label, 
    ::ng-deep .mat-paginator-range-label {
      color: rgba(255, 255, 255, 0.7);
    }

    .status-chip {
      padding: 4px 8px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-confirmed {
      background-color: rgba(0, 176, 32, 0.2);
      color: #00B020;
      border: 1px solid rgba(0, 176, 32, 0.4);
    }

    .status-pending {
      background-color: rgba(255, 152, 0, 0.2);
      color: #FF9800;
      border: 1px solid rgba(255, 152, 0, 0.4);
    }

    .status-cancelled {
      background-color: rgba(244, 67, 54, 0.2);
      color: #F44336;
      border: 1px solid rgba(244, 67, 54, 0.4);
    }

    .status-completed {
      background-color: rgba(103, 58, 183, 0.2);
      color: #673AB7;
      border: 1px solid rgba(103, 58, 183, 0.4);
    }

    .seats-count {
      padding: 2px 8px;
      background-color: #333333;
      border-radius: 12px;
      font-size: 12px;
    }

    ::ng-deep .mat-raised-button.mat-primary {
      background-color: #00B020;
    }

    ::ng-deep .mat-raised-button.mat-accent {
      background-color: #2c2c2c;
      color: #FFFFFF;
    }

    ::ng-deep .mat-icon-button {
      color: #FFFFFF;
    }

    ::ng-deep .mat-icon-button.mat-primary {
      color: #00B020;
    }

    ::ng-deep .mat-icon-button.mat-accent {
      color: #00B020;
    }

    ::ng-deep .mat-icon-button.mat-warn {
      color: #f44336;
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
