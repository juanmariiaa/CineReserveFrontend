import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { SafeUrl } from '@angular/platform-browser';

export interface TicketDialogData {
  reservation: any;
  qrImageUrl: SafeUrl;
  seatsList: string;
}

@Component({
  selector: 'app-ticket-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ],
  template: `
    <div class="ticket-dialog">
      <div class="ticket">
        <div class="ticket-header">
          <h1>CineReserve</h1>
          <h2>Movie Ticket</h2>
          <button
            class="close-button"
            mat-icon-button
            (click)="close()"
            aria-label="Close dialog"
          >
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <div class="ticket-qr">
          <img [src]="data.qrImageUrl" alt="QR Code" class="qr-code" />
          <p class="reservation-id">
            Reservation ID: {{ data.reservation?.id }}
          </p>
        </div>

        <mat-divider></mat-divider>

        <div class="ticket-details">
          <div class="detail-row">
            <span class="label">Movie:</span>
            <span class="value">{{
              data.reservation?.screening?.movie?.title
            }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Room:</span>
            <span class="value"
              >Room {{ data.reservation?.screening?.room?.number }}</span
            >
          </div>
          <div class="detail-row">
            <span class="label">Date:</span>
            <span class="value">{{
              data.reservation?.screening?.startTime | date : 'MM/dd/yyyy'
            }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Time:</span>
            <span class="value">{{
              data.reservation?.screening?.startTime | date : 'HH:mm'
            }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Seats:</span>
            <span class="value">{{ data.seatsList }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Customer:</span>
            <span class="value"
              >{{ data.reservation?.user?.firstName }}
              {{ data.reservation?.user?.lastName }}</span
            >
          </div>
        </div>

        <mat-divider></mat-divider>

        <div class="ticket-footer">
          <p>This ticket is valid only for the specified screening.</p>
          <p>
            Present it at the cinema entrance 15 minutes before the movie
            starts.
          </p>
        </div>
      </div>

      <div class="actions">
        <button mat-raised-button color="accent" (click)="printTicket()">
          <mat-icon>print</mat-icon> Print Ticket
        </button>
        <button mat-raised-button color="primary" (click)="close()">
          <mat-icon>close</mat-icon> Close
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .ticket-dialog {
        padding: 20px;
        background-color: #3c3b34;
        color: #ffffff;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .ticket {
        background-color: #35342e;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        overflow: hidden;
        padding: 1.5rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        position: relative;
      }

      .close-button {
        position: absolute;
        top: 10px;
        right: 10px;
        color: rgba(255, 255, 255, 0.7);
      }

      .ticket-header {
        text-align: center;
        margin-bottom: 1.5rem;
      }

      .ticket-header h1 {
        font-size: 28px;
        margin-bottom: 0.5rem;
        color: #ff6b6b;
        margin-top: 0;
      }

      .ticket-header h2 {
        font-size: 20px;
        color: rgba(255, 255, 255, 0.9);
        font-weight: normal;
        margin-top: 0;
      }

      .ticket-qr {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 1.5rem;
        background-color: #ffffff;
        padding: 1rem;
        border-radius: 8px;
      }

      .qr-code {
        width: 180px;
        height: 180px;
        margin-bottom: 0.5rem;
      }

      .reservation-id {
        color: #333333;
        font-size: 14px;
        margin: 5px 0 0 0;
      }

      mat-divider {
        margin: 1rem 0;
        background-color: rgba(255, 255, 255, 0.1);
      }

      .ticket-details {
        margin: 1.5rem 0;
      }

      .detail-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.8rem;
        font-size: 16px;
      }

      .label {
        font-weight: 500;
        color: rgba(255, 255, 255, 0.7);
      }

      .value {
        color: #ffffff;
        text-align: right;
      }

      .ticket-footer {
        text-align: center;
        margin-top: 1.5rem;
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
      }

      .ticket-footer p {
        margin-bottom: 0.5rem;
      }

      .actions {
        display: flex;
        justify-content: center;
        gap: 16px;
      }

      @media print {
        .actions,
        .close-button {
          display: none !important;
        }

        .ticket {
          box-shadow: none;
          border: 1px solid #ddd;
          background-color: white;
          color: black;
        }

        .ticket-header h1 {
          color: #ff6b6b;
        }

        .ticket-header h2,
        .label,
        .value,
        .ticket-footer,
        .ticket-footer p {
          color: black;
        }
      }
    `,
  ],
})
export class TicketDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TicketDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TicketDialogData
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  printTicket(): void {
    window.print();
  }
}
