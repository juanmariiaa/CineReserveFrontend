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
  templateUrl: './room-management.component.html',
  styleUrls: ['./room-management.component.scss'],
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
