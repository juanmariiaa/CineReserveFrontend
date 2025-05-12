import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RoomService } from '../../../../core/services/room.service';
import { Room } from '../../../../core/models/screening.model';
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
    <div class="room-management-container">
      <div class="page-header">
        <h1>Room Management</h1>
        <div class="header-actions">
          <button mat-raised-button color="primary" routerLink="/admin/rooms/create">
            <mat-icon>add</mat-icon> Add Room
          </button>
          <button mat-raised-button color="warn" (click)="confirmDeleteLastRoom()">
            <mat-icon>delete</mat-icon> Delete Last Room
          </button>
          <button mat-raised-button color="accent" routerLink="/admin/dashboard">
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
              <mat-label>Filter Rooms</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="Number, type, etc." #input>
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <div class="table-container">
              <table mat-table [dataSource]="dataSource" matSort class="room-table">
                <!-- ID Column -->
                <ng-container matColumnDef="id">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header> ID </th>
                  <td mat-cell *matCellDef="let room"> {{room.id}} </td>
                </ng-container>

                <!-- Number Column -->
                <ng-container matColumnDef="number">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header> Number </th>
                  <td mat-cell *matCellDef="let room"> {{room.number}} </td>
                </ng-container>

                <!-- Capacity Column -->
                <ng-container matColumnDef="capacity">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header> Capacity </th>
                  <td mat-cell *matCellDef="let room"> {{room.capacity}} seats </td>
                </ng-container>

                <!-- Type Column -->
                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header> Type </th>
                  <td mat-cell *matCellDef="let room"> {{room.roomType || 'Standard'}} </td>
                </ng-container>



                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

                <!-- Row shown when there is no matching data. -->
                <tr class="mat-row" *matNoDataRow>
                  <td class="mat-cell" colspan="6">No rooms found matching "{{input.value}}"</td>
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
    .room-management-container {
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

    .header-actions {
      display: flex;
      gap: 10px;
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

    .table-container {
      overflow-x: auto;
    }

    .room-table {
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

    ::ng-deep .mat-raised-button.mat-primary {
      background-color: #00B020;
    }

    ::ng-deep .mat-raised-button.mat-accent {
      background-color: #2c2c2c;
      color: #FFFFFF;
    }

    ::ng-deep .mat-raised-button.mat-warn {
      background-color: #f44336;
      color: #FFFFFF;
    }

    ::ng-deep .mat-icon-button {
      color: #FFFFFF;
    }
  `]
})
export class RoomManagementComponent implements OnInit {
  rooms: Room[] = [];
  loading = true;
  displayedColumns: string[] = ['id', 'number', 'capacity', 'type'];
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
    this.roomService.getAllRooms().subscribe({
      next: (data) => {
        this.rooms = data;
        this.dataSource = this.rooms;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading rooms: ' + error.message, 'Close', {
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
