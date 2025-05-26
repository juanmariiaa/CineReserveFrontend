import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RoomService } from '../../../../core/services/room.service';
import { Room, RoomBasicDTO } from '../../../../core/models/room.model';
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

@Component({
  selector: 'app-room-management',
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
    MatTooltipModule
  ],
  template: `
    <div class="screening-management-container">
      <div class="dashboard-title-container">
        <div class="dashboard-title-marker"></div>
        <h1 class="dashboard-title">Room Management</h1>
      </div>

      <div class="action-bar">
        <div class="action-buttons">
          <button
            mat-raised-button
            class="accent-bg"
            routerLink="/admin/rooms/create"
          >
            <mat-icon>add</mat-icon> Add Room
          </button>
          <button
            mat-raised-button
            class="delete-button"
            (click)="confirmDeleteLastRoom()"
          >
            <mat-icon>delete</mat-icon> Delete Last Room
          </button>
        </div>
        <button
          mat-raised-button
          routerLink="/admin/dashboard"
        >
          <mat-icon>arrow_back</mat-icon> Back to Dashboard
        </button>
      </div>

      <mat-card class="table-card">
        <mat-card-content>
          <div *ngIf="loading" class="loading-spinner">
            <mat-spinner class="accent-spinner"></mat-spinner>
          </div>

          <div *ngIf="!loading">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Filter Rooms</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="Number, type, etc." #input>
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <div class="table-container">
              <table
                mat-table
                [dataSource]="dataSource"
                matSort
                class="room-table"
              >
                <!-- ID Column -->
                <ng-container matColumnDef="id">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
                  <td mat-cell *matCellDef="let room">
                    {{ room.id }}
                  </td>
                </ng-container>

                <!-- Number Column -->
                <ng-container matColumnDef="number">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Number</th>
                  <td mat-cell *matCellDef="let room">
                    {{ room.number }}
                  </td>
                </ng-container>

                <!-- Capacity Column -->
                <ng-container matColumnDef="capacity">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Capacity</th>
                  <td mat-cell *matCellDef="let room">
                    {{ room.capacity }} seats
                  </td>
                </ng-container>

                <!-- Type Column -->
                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
                  <td mat-cell *matCellDef="let room">
                    {{ room.roomType || 'Standard' }}
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let room">
                    <button 
                      mat-icon-button 
                      class="action-button"
                      matTooltip="Delete Room" 
                      (click)="confirmDelete(room)"
                    >
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

                <!-- Row shown when there is no matching data. -->
                <tr class="mat-row" *matNoDataRow>
                  <td class="mat-cell" colspan="5">No rooms found matching "{{input.value}}"</td>
                </tr>
              </table>

              <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of rooms"></mat-paginator>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .screening-management-container {
      padding: 20px;
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
      font-size: 24px;
      font-weight: 500;
      margin: 0;
    }

    .action-bar {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      gap: 10px;
    }

    .action-buttons {
      display: flex;
      gap: 10px;
    }

    .table-card {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
      margin-bottom: 20px;
    }

    .table-container {
      overflow-x: auto;
    }

    .room-table {
      width: 100%;
    }

    .action-button {
      color: #ff6b6b;
    }

    .delete-button {
      background-color: #f44336 !important;
      color: white !important;
    }

    .accent-bg {
      background-color: #ff6b6b !important;
      color: white !important;
    }

    ::ng-deep .mat-mdc-form-field-focus-overlay {
      background-color: rgba(255, 255, 255, 0.04);
    }

    ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: rgba(255, 255, 255, 0.04) !important;
    }

    ::ng-deep .mat-mdc-form-field-label {
      color: rgba(255, 255, 255, 0.7) !important;
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

    ::ng-deep .mat-mdc-raised-button:not(.accent-bg):not(.delete-button) {
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
  `]
})
export class RoomManagementComponent implements OnInit {
  rooms: Room[] = [];
  loading = true;
  displayedColumns: string[] = ['id', 'number', 'capacity', 'type', 'actions'];
  dataSource: any;

  constructor(
    private roomService: RoomService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.loading = true;
    this.roomService.getAllRoomsBasic().subscribe({
      next: (data) => {
        this.rooms = data;
        this.dataSource = this.rooms;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching rooms:', error);
        this.snackBar.open('Failed to load rooms. Please try again.', 'Close', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  confirmDelete(room: Room): void {
    if (confirm(`Are you sure you want to delete room ${room.number}?`)) {
      this.deleteRoom(room.id!);
    }
  }

  deleteRoom(id: number): void {
    this.roomService.deleteRoom(id).subscribe({
      next: () => {
        this.snackBar.open('Room deleted successfully', 'Close', {
          duration: 3000
        });
        this.loadRooms();
      },
      error: (error) => {
        this.snackBar.open('Error deleting room: ' + error.message, 'Close', {
          duration: 5000
        });
      }
    });
  }

  confirmDeleteLastRoom(): void {
    if (confirm('Are you sure you want to delete the last created room?')) {
      this.deleteLastRoom();
    }
  }

  deleteLastRoom(): void {
    this.roomService.deleteLastRoom().subscribe({
      next: (deletedRoom) => {
        this.snackBar.open(`Room ${deletedRoom.number} deleted successfully`, 'Close', {
          duration: 3000
        });
        this.loadRooms();
      },
      error: (error) => {
        this.snackBar.open('Error deleting last room: ' + error.message, 'Close', {
          duration: 5000
        });
      }
    });
  }
}
