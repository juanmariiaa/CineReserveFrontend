import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { ReservationService } from '../../../core/services/reservation.service';
import { HttpClientModule } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    NavbarComponent,
    HttpClientModule,
    MatSnackBarModule,
  ],
  templateUrl: './payment-success.component.html',
  styles: `
    .payment-success-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: #3c3b34;
      color: #ffffff;
      font-family: 'Roboto', sans-serif;
    }
    
    .content {
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
      padding: 2rem;
    }
    
    .loading-container, .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      max-width: 500px;
      margin: 0 auto;
      color: #ffffff;
    }
    
    .loading-container mat-spinner, .error-container mat-icon {
      margin-bottom: 1rem;
    }
    
    .error-container mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #f44336;
    }
    
    .error-details {
      margin: 1rem 0;
      color: rgba(255, 255, 255, 0.7);
    }
    
    .error-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .ticket-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
      width: 100%;
      max-width: 800px;
    }
    
    .success-message {
      text-align: center;
      background-color: #35342e;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      width: 100%;
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .success-message mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 1rem;
      color: #ff6b6b;
    }
    
    .success-message h1 {
      color: #ffffff;
      margin-bottom: 1rem;
    }
    
    .success-message p {
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 0.5rem;
    }
    
    .email-note {
      font-style: italic;
      margin-top: 1rem;
      color: rgba(255, 255, 255, 0.6);
    }
    
    .ticket {
      background-color: #35342e;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      width: 100%;
      overflow: hidden;
      padding: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .ticket-instructions {
      background-color: #35342e;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      width: 100%;
      padding: 1.5rem;
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .ticket-instructions h3 {
      margin-top: 0;
      color: #ffffff;
      margin-bottom: 1rem;
    }
    
    .ticket-instructions ul {
      padding-left: 1.5rem;
      margin-bottom: 0;
    }
    
    .ticket-instructions li {
      margin-bottom: 0.5rem;
      color: rgba(255, 255, 255, 0.8);
    }
    
    .ticket-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    
    .ticket-header h1 {
      font-size: 28px;
      margin-bottom: 0.5rem;
      color: #ff6b6b;
    }
    
    .ticket-header h2 {
      font-size: 20px;
      color: rgba(255, 255, 255, 0.9);
      font-weight: normal;
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
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
      width: 100%;
    }
    
    .actions button {
      min-width: 160px;
    }

    .actions mat-icon {
      margin-right: 8px;
      font-size: 20px;
      height: 20px;
      width: 20px;
      vertical-align: middle;
    }

    @media print {
      .actions, app-navbar, .success-message, .ticket-instructions {
        display: none !important;
      }
      
      .ticket-container {
        max-width: 100%;
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
      
      .ticket-header h2, .label, .value, .ticket-footer, .ticket-footer p {
        color: black;
      }
    }
    
    @media (max-width: 600px) {
      .detail-row {
        flex-direction: column;
        margin-bottom: 1.2rem;
      }
      
      .value {
        text-align: left;
        margin-top: 0.3rem;
      }
      
      .actions {
        flex-direction: column;
        width: 100%;
      }
      
      .actions button {
        width: 100%;
      }
      
      .error-actions {
        flex-direction: column;
        width: 100%;
      }
    }
  `,
})
export class PaymentSuccessComponent implements OnInit {
  loading = true;
  error = false;
  errorMessage = '';
  reservation: any = null;
  qrImageUrl: SafeUrl | null = null;
  seatsList = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Get the session ID from URL parameters
    this.route.queryParams.subscribe((params) => {
      const sessionId = params['session_id'];

      if (sessionId) {
        this.loadReservationDetails(sessionId);
      } else {
        this.error = true;
        this.loading = false;
        this.errorMessage =
          'Could not identify the reservation. Incomplete URL parameters. Please check your "My Reservations" section or your email.';
      }
    });
  }

  loadReservationDetails(sessionId: string): void {
    this.reservationService
      .getReservationBySessionId(sessionId)
      .pipe(
        switchMap((reservation) => {
          if (!reservation) {
            throw new Error(
              'No reservation was found associated with this payment session.'
            );
          }

          this.reservation = reservation;

          // Format the seat list
          if (
            reservation &&
            reservation.seatReservations &&
            reservation.seatReservations.length > 0
          ) {
            const seats = reservation.seatReservations
              .map((sr: any) => {
                // Check if seat has valid rowLabel and columnNumber
                if (sr.seat && sr.seat.rowLabel && sr.seat.columnNumber) {
                  return `${sr.seat.rowLabel}${sr.seat.columnNumber}`;
                }
                return null;
              })
              .filter((seat: string | null) => seat !== null); // Fix: add type annotation

            this.seatsList = seats.join(', ');
          } else {
            this.seatsList = 'No seats information available';
          }

          // Generate QR with reservation ID
          this.generateQRCode(reservation.id.toString());

          return of(reservation);
        })
      )
      .subscribe({
        next: () => {
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading reservation details', err);
          this.loading = false;
          this.error = true;

          if (err.status === 404) {
            this.errorMessage =
              'No reservation was found associated with this payment session. The payment may have been processed correctly but the details are not available at this time.';
          } else if (err.status === 401 || err.status === 403) {
            this.errorMessage =
              'You do not have permission to access this reservation. Please make sure you are logged in with the correct account.';
          } else if (err.status === 0) {
            this.errorMessage =
              'Could not connect to the server. Please check your internet connection.';
          } else {
            this.errorMessage =
              'Error loading reservation details. Please check "My Reservations" or check your email where we have also sent your ticket.';
          }

          this.snackBar.open('Error loading ticket', 'Close', {
            duration: 5000,
          });
        },
      });
  }

  generateQRCode(data: string): void {
    // Generate a local QR using a public API
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      data
    )}`;
    this.qrImageUrl = this.sanitizer.bypassSecurityTrustUrl(qrApiUrl);
  }

  printTicket(): void {
    window.print();
  }
}
