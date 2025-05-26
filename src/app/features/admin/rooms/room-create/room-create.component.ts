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
  styles: [
    `
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
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .form-row {
        display: flex;
        gap: 20px;
        margin-bottom: 16px;
      }

      .form-field {
        flex: 1;
      }

      .capacity-display {
        margin: 20px 0;
        padding: 15px;
        background-color: #222222;
        border-radius: 4px;
        text-align: center;
        border: 1px solid #3a3a3a;
      }

      .capacity-display h3 {
        margin: 0;
        color: #ff6b6b;
      }

      .room-preview {
        margin: 20px 0;
        padding: 20px;
        border-radius: 8px;
        background-color: #1a1a1a;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }

      .screen-container {
        margin: 0 0 40px;
        position: relative;
        perspective: 500px;
      }

      .screen {
        width: 90%;
        height: 50px;
        background: linear-gradient(180deg, #333333, #222222);
        margin: 0 auto;
        border-radius: 4px 4px 0 0;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        transform: rotateX(-20deg);
        border-bottom: 2px solid #ff6b6b;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
      }

      .screen:after {
        content: '';
        position: absolute;
        bottom: -15px;
        left: 0;
        right: 0;
        height: 15px;
        background: linear-gradient(
          to bottom,
          rgba(255, 107, 107, 0.2),
          transparent
        );
      }

      .screen-text {
        color: rgba(255, 255, 255, 0.8);
        font-weight: 500;
        letter-spacing: 3px;
        text-transform: uppercase;
        font-size: 14px;
      }

      .seats-container {
        width: 100%;
        max-height: 400px;
        overflow-y: auto;
        padding: 20px 0;
        background-color: #222222;
        border-radius: 8px;
        box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: center;
      }

      .row {
        display: flex;
        align-items: center;
        width: 100%;
        justify-content: center;
        gap: 10px;
      }

      .row-label {
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(255, 107, 107, 0.2);
        color: #ffffff;
        border-radius: 50%;
        font-weight: bold;
        font-size: 14px;
      }

      .seats-row {
        display: flex;
        gap: 8px;
      }

      .seat {
        width: 30px;
        height: 30px;
        background-color: #444444;
        border-radius: 4px 4px 10px 10px;
        text-align: center;
        line-height: 30px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        color: #ffffff;
        border-bottom: 4px solid #333333;
        user-select: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .seat:hover {
        background-color: #ff6b6b;
        border-bottom-color: #e55a5a;
        transform: translateY(-2px);
      }

      .aisle-right {
        margin-right: 12px;
        background-color: #555555;
        border-bottom-color: #444444;
      }

      .aisle-left {
        margin-left: 12px;
        background-color: #555555;
        border-bottom-color: #444444;
      }

      .seat-legend {
        display: flex;
        justify-content: center;
        gap: 30px;
        margin: 20px 0 10px;
        padding: 12px;
        background-color: #2a2a2a;
        border-radius: 4px;
        border: 1px solid #333333;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #ffffff;
      }

      .seat-sample {
        width: 20px;
        height: 20px;
        border-radius: 4px 4px 8px 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .seat-sample.regular {
        background-color: #444444;
        border-bottom: 3px solid #333333;
      }

      .seat-sample.aisle {
        background-color: #555555;
        border-bottom: 3px solid #444444;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
      }

      /* Botón de crear sala */
      .create-room-btn {
        background-color: #ff6b6b !important;
        color: #ffffff !important;
        font-weight: 500;
        letter-spacing: 0.5px;
        padding: 8px 16px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
        transition: all 0.2s ease;
      }

      .create-room-btn:hover {
        background-color: #ff7c7c !important;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
        transform: translateY(-2px);
      }

      .create-room-btn:disabled {
        background-color: rgba(255, 107, 107, 0.5) !important;
        color: rgba(255, 255, 255, 0.7) !important;
        box-shadow: none;
        transform: none;
      }

      .create-room-btn .mat-icon {
        color: #ffffff !important;
        margin-right: 8px;
      }

      /* Angular Material overrides for consistent styling */
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

      ::ng-deep .mat-mdc-select-value,
      ::ng-deep .mat-mdc-select-arrow {
        color: #ffffff !important;
      }

      ::ng-deep .mat-mdc-card-content {
        color: #ffffff !important;
      }

      ::ng-deep .mat-mdc-form-field-hint {
        color: rgba(255, 255, 255, 0.6) !important;
      }

      ::ng-deep .mat-mdc-form-field-error {
        color: #f44336 !important;
      }

      /* Asegurarse de que los botones tengan texto blanco */
      ::ng-deep .mat-mdc-button,
      ::ng-deep .mat-mdc-raised-button,
      ::ng-deep .mat-mdc-outlined-button {
        color: #ffffff !important;
      }

      ::ng-deep .mat-mdc-button .mat-icon,
      ::ng-deep .mat-mdc-raised-button .mat-icon,
      ::ng-deep .mat-mdc-outlined-button .mat-icon {
        color: #ffffff !important;
      }

      /* Corregir colores de fondo y bordes de los campos de formulario */
      ::ng-deep .mat-mdc-text-field-wrapper {
        background-color: #222222 !important;
      }

      ::ng-deep .mat-mdc-form-field-focus-overlay {
        background-color: #303030 !important;
      }

      ::ng-deep .mdc-text-field--filled:not(.mdc-text-field--disabled) {
        background-color: #222222 !important;
      }

      ::ng-deep
        .mdc-text-field--outlined:not(.mdc-text-field--disabled)
        .mdc-notched-outline__leading,
      ::ng-deep
        .mdc-text-field--outlined:not(.mdc-text-field--disabled)
        .mdc-notched-outline__notch,
      ::ng-deep
        .mdc-text-field--outlined:not(.mdc-text-field--disabled)
        .mdc-notched-outline__trailing {
        border-color: rgba(255, 255, 255, 0.3) !important;
      }

      ::ng-deep
        .mdc-text-field--outlined:not(
          .mdc-text-field--disabled
        ).mdc-text-field--focused
        .mdc-notched-outline__leading,
      ::ng-deep
        .mdc-text-field--outlined:not(
          .mdc-text-field--disabled
        ).mdc-text-field--focused
        .mdc-notched-outline__notch,
      ::ng-deep
        .mdc-text-field--outlined:not(
          .mdc-text-field--disabled
        ).mdc-text-field--focused
        .mdc-notched-outline__trailing {
        border-color: #ff6b6b !important;
      }
    `,
  ],
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
