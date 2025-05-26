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
      background-color: #f5f5f5;
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
    }
    
    .loading-container mat-spinner, .error-container mat-icon {
      margin-bottom: 1rem;
    }
    
    .error-container mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
    }
    
    .error-details {
      margin: 1rem 0;
      color: #666;
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
      background-color: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      width: 100%;
    }
    
    .success-message mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 1rem;
      color: #4CAF50;
    }
    
    .success-message h1 {
      color: #333;
      margin-bottom: 1rem;
    }
    
    .success-message p {
      color: #666;
      margin-bottom: 0.5rem;
    }
    
    .email-note {
      font-style: italic;
      margin-top: 1rem;
      color: #888;
    }
    
    .ticket {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      width: 100%;
      overflow: hidden;
      padding: 1.5rem;
    }
    
    .ticket-instructions {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      width: 100%;
      padding: 1.5rem;
    }
    
    .ticket-instructions h3 {
      margin-top: 0;
      color: #333;
      margin-bottom: 1rem;
    }
    
    .ticket-instructions ul {
      padding-left: 1.5rem;
      margin-bottom: 0;
    }
    
    .ticket-instructions li {
      margin-bottom: 0.5rem;
      color: #555;
    }
    
    .ticket-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    
    .ticket-header h1 {
      font-size: 28px;
      margin-bottom: 0.5rem;
      color: #1a237e;
    }
    
    .ticket-header h2 {
      font-size: 20px;
      color: #424242;
      font-weight: normal;
    }
    
    .ticket-qr {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    
    .qr-code {
      width: 180px;
      height: 180px;
      margin-bottom: 0.5rem;
    }
    
    .reservation-id {
      color: #757575;
      font-size: 14px;
    }
    
    mat-divider {
      margin: 1rem 0;
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
      color: #616161;
    }
    
    .value {
      color: #212121;
      text-align: right;
    }
    
    .ticket-footer {
      text-align: center;
      margin-top: 1.5rem;
      color: #757575;
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
    // Obtener el ID de sesión de los parámetros de la URL
    this.route.queryParams.subscribe((params) => {
      const sessionId = params['session_id'];

      if (sessionId) {
        this.loadReservationDetails(sessionId);
      } else {
        this.error = true;
        this.loading = false;
        this.errorMessage =
          'No se pudo identificar la reserva. Parámetros de URL incompletos. Por favor, verifica en la sección "Mis Reservas" o en tu correo electrónico.';
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
              'No se encontró la reserva asociada a esta sesión de pago.'
            );
          }

          this.reservation = reservation;

          // Formatear la lista de asientos
          if (reservation && reservation.seatReservations) {
            const seats = reservation.seatReservations.map(
              (sr: any) => `${sr.seat.row}${sr.seat.number}`
            );
            this.seatsList = seats.join(', ');
          }

          // Generar QR con el ID de reserva
          this.generateQRCode(reservation.id.toString());

          return of(reservation);
        })
      )
      .subscribe({
        next: () => {
          this.loading = false;
        },
        error: (err) => {
          console.error('Error cargando los detalles de la reserva', err);
          this.loading = false;
          this.error = true;

          if (err.status === 404) {
            this.errorMessage =
              'No se encontró la reserva asociada a esta sesión de pago. Es posible que el pago se haya procesado correctamente pero los detalles no estén disponibles en este momento.';
          } else if (err.status === 401 || err.status === 403) {
            this.errorMessage =
              'No tienes permiso para acceder a esta reserva. Por favor, asegúrate de haber iniciado sesión con la cuenta correcta.';
          } else if (err.status === 0) {
            this.errorMessage =
              'No se pudo conectar al servidor. Por favor, verifica tu conexión a internet.';
          } else {
            this.errorMessage =
              'Error al cargar los detalles de la reserva. Por favor, verifica en "Mis Reservas" o revisa tu correo electrónico donde también hemos enviado tu entrada.';
          }

          this.snackBar.open('Error al cargar la entrada', 'Cerrar', {
            duration: 5000,
          });
        },
      });
  }

  generateQRCode(data: string): void {
    // Generar un QR local usando una API pública
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      data
    )}`;
    this.qrImageUrl = this.sanitizer.bypassSecurityTrustUrl(qrApiUrl);
  }

  printTicket(): void {
    window.print();
  }
}
