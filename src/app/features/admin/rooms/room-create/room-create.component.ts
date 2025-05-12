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
  template: `
    <div class="room-create-container">
      <div class="page-header">
        <h1>Create New Room</h1>
        <button mat-raised-button color="accent" routerLink="/admin/rooms">
          <mat-icon>arrow_back</mat-icon> Back to List
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="roomForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Rows</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="rows"
                  min="1"
                  max="50"
                  (input)="updateCapacity()"
                />
                <mat-hint>Number of rows (1-50)</mat-hint>
                <mat-error *ngIf="roomForm.get('rows')?.hasError('required')">
                  Number of rows is required
                </mat-error>
                <mat-error *ngIf="roomForm.get('rows')?.hasError('min')">
                  Number of rows must be at least 1
                </mat-error>
                <mat-error *ngIf="roomForm.get('rows')?.hasError('max')">
                  Number of rows cannot exceed 50
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Columns</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="columns"
                  min="1"
                  max="50"
                  (input)="updateCapacity()"
                />
                <mat-hint>Number of columns (1-50)</mat-hint>
                <mat-error
                  *ngIf="roomForm.get('columns')?.hasError('required')"
                >
                  Number of columns is required
                </mat-error>
                <mat-error *ngIf="roomForm.get('columns')?.hasError('min')">
                  Number of columns must be at least 1
                </mat-error>
                <mat-error *ngIf="roomForm.get('columns')?.hasError('max')">
                  Number of columns cannot exceed 50
                </mat-error>
              </mat-form-field>
            </div>

            <div class="capacity-display">
              <h3>Total capacity: {{ capacity }} seats</h3>
            </div>

            <div class="room-preview">
              <h3>Room Preview</h3>
              <div class="screen">SCREEN</div>
              <div
                class="seats-grid"
                [style.grid-template-columns]="gridTemplateColumns"
              >
                <div
                  *ngFor="let seat of previewSeats"
                  class="seat"
                  [class.aisle-right]="seat.isAisleRight"
                  [class.aisle-left]="seat.isAisleLeft"
                >
                  {{ seat.label }}
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button
                type="button"
                mat-button
                color="warn"
                (click)="resetForm()"
              >
                Reset
              </button>
              <button
                type="submit"
                mat-raised-button
                class="create-room-btn"
                [disabled]="roomForm.invalid || saving"
              >
                <mat-icon>save</mat-icon> Create Room
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .room-create-container {
        padding: 20px;
        color: #ffffff;
        background-color: #181818;
        min-height: 100vh;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      h1,
      h2,
      h3,
      p {
        color: #ffffff;
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
        color: #00b020;
      }

      .room-preview {
        margin: 20px 0;
        padding: 20px;
        background-color: #222222;
        border-radius: 4px;
        border: 1px solid #3a3a3a;
      }

      .room-preview h3 {
        margin-top: 0;
        text-align: center;
        color: #ffffff;
      }

      .screen {
        background-color: #333333;
        padding: 10px;
        text-align: center;
        margin-bottom: 20px;
        border-radius: 4px;
        font-weight: bold;
        color: #ffffff;
      }

      .seats-grid {
        display: grid;
        gap: 5px;
        justify-content: center;
      }

      .seat {
        width: 30px;
        height: 30px;
        background-color: #2c2c2c;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        font-size: 12px;
        color: #ffffff;
        border: 1px solid #3a3a3a;
      }

      .seat.aisle-right {
        margin-right: 15px;
      }

      .seat.aisle-left {
        margin-left: 15px;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
      }

      /* Botón de crear sala */
      .create-room-btn {
        background-color: #00b020 !important;
        color: #ffffff !important;
        font-weight: 500;
        letter-spacing: 0.5px;
        padding: 8px 16px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
        transition: all 0.2s ease;
      }

      .create-room-btn:hover {
        background-color: #00c02a !important;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
        transform: translateY(-2px);
      }

      .create-room-btn:disabled {
        background-color: rgba(0, 176, 32, 0.5) !important;
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
        border-color: #00b020 !important;
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
    this.gridTemplateColumns = `repeat(${columns}, 30px)`;

    // Generate preview seats
    for (let i = 0; i < rows; i++) {
      const rowLabel = String.fromCharCode(65 + i); // A, B, C, ...

      for (let j = 0; j < columns; j++) {
        const seatNumber = j + 1;
        const isAisleRight = (j + 1) % 5 === 0 && j < columns - 1;
        const isAisleLeft = j % 5 === 0 && j > 0;

        this.previewSeats.push({
          label: `${rowLabel}${seatNumber}`,
          isAisleRight,
          isAisleLeft,
        });
      }
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
