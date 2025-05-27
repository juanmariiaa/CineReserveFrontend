import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RoomService } from '../../../../core/services/room.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-room-create',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSliderModule,
    MatDividerModule,
  ],
  templateUrl: './room-create.component.html',
  styleUrls: ['./room-create.component.scss'],
})
export class RoomCreateComponent {
  roomForm: FormGroup;
  saving = false;
  capacity = 0;
  previewSeats: any[] = [];
  gridTemplateColumns = '';

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.roomForm = this.createForm();
    this.updateCapacity();
  }

  createForm(): FormGroup {
    return this.fb.group({
      rows: [10, [Validators.required, Validators.min(1), Validators.max(50)]],
      columns: [
        10,
        [Validators.required, Validators.min(1), Validators.max(50)],
      ],
    });
  }

  updateCapacity(): void {
    const rows = this.roomForm.get('rows')?.value || 0;
    const columns = this.roomForm.get('columns')?.value || 0;
    this.capacity = rows * columns;
    this.updatePreview();
  }

  updatePreview(): void {
    const rows = this.roomForm.get('rows')?.value || 0;
    const columns = this.roomForm.get('columns')?.value || 0;

    this.previewSeats = [];

    // Generate rows of seats
    for (let i = 0; i < rows; i++) {
      const rowLabel = String.fromCharCode(65 + i); // A, B, C, ...
      const rowSeats = [];

      for (let j = 0; j < columns; j++) {
        const seatNumber = j + 1;
        // Create aisles every 4 seats for better layout
        const isAisleRight = (j + 1) % 4 === 0 && j < columns - 1;
        const isAisleLeft = j % 4 === 0 && j > 0;

        rowSeats.push({
          row: rowLabel,
          number: seatNumber,
          label: `${rowLabel}${seatNumber}`,
          isAisleRight,
          isAisleLeft,
        });
      }

      this.previewSeats.push(rowSeats);
    }
  }

  resetForm(): void {
    this.roomForm.reset({
      rows: 10,
      columns: 10,
    });
    this.updateCapacity();
  }

  onSubmit(): void {
    if (this.roomForm.invalid) {
      return;
    }

    this.saving = true;
    const roomData = this.roomForm.value;

    this.roomService.createRoom(roomData).subscribe({
      next: () => {
        this.snackBar.open('Room created successfully', 'Close', {
          duration: 3000,
        });
        this.router.navigate(['/admin/rooms']);
      },
      error: (error) => {
        this.snackBar.open('Error creating room: ' + error.message, 'Close', {
          duration: 5000,
        });
        this.saving = false;
      },
    });
  }
}
