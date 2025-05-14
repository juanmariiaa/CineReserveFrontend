import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ScreeningService } from '../../core/services/screening.service';
import { ReservationService } from '../../core/services/reservation.service';
import { AuthService } from '../../core/services/auth.service';
import { Screening, ScreeningBasicDTO, Seat } from '../../core/models/screening.model';
import { Room } from '../../core/models/room.model';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NavbarComponent } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatGridListModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatMenuModule,
    MatInputModule,
    MatFormFieldModule,
    NavbarComponent,
  ],
  template: `
    <div class="reservation-container">
      <!-- Usar NavbarComponent en lugar de la barra personalizada -->
      <app-navbar></app-navbar>

      <div class="content">
        <div class="page-header">
          <h1>Seat Reservation</h1>
          <button mat-raised-button color="accent" routerLink="/">
            <mat-icon>arrow_back</mat-icon> Back to Home
          </button>
        </div>

        <div *ngIf="loading" class="loading-spinner">
          <mat-spinner></mat-spinner>
        </div>

        <div *ngIf="!loading && !screening" class="error-message">
          <mat-card>
            <mat-card-content>
              <p>Screening not found or has been removed.</p>
              <button mat-raised-button color="accent" routerLink="/">
                Go to Home
              </button>
            </mat-card-content>
          </mat-card>
        </div>

        <ng-container *ngIf="!loading && screening">
          <mat-card class="screening-info-card">
            <mat-card-header>
              <mat-card-title>{{ screening.movie?.title }}</mat-card-title>
              <mat-card-subtitle>
                Room {{ screening.room?.number }} |
                {{ formatDate(screening.startTime) }}
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="screening-content">
                <div class="movie-poster" *ngIf="screening.movie?.posterUrl">
                  <img
                    [src]="screening.movie?.posterUrl"
                    alt="{{ screening.movie?.title }} poster"
                  />
                </div>
                <div class="movie-details">
                  <p>
                    <strong>Price:</strong>
                    {{ screening.ticketPrice | currency : 'EUR' }}
                  </p>
                  <p *ngIf="screening.format">
                    <strong>Format:</strong> {{ screening.format }}
                  </p>
                  <p *ngIf="screening.language">
                    <strong>Language:</strong> {{ screening.language }}
                  </p>
                  <p *ngIf="screening.is3D">
                    <mat-icon class="small-icon">3d</mat-icon> 3D
                  </p>
                  <p *ngIf="screening.hasSubtitles">
                    <mat-icon class="small-icon">subtitles</mat-icon> With
                    subtitles
                  </p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="seat-selection-card">
            <mat-card-header>
              <mat-card-title>Select Your Seats</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="screen">
                <div class="screen-label">SCREEN</div>
              </div>

              <div *ngIf="seats.length === 0" class="no-seats-message">
                No seats available for this screening.
              </div>

              <div *ngIf="seats.length > 0" class="seats-container">
                <div class="seat-row" *ngFor="let row of seatRows">
                  <div class="row-label">{{ row }}</div>
                  <div class="seats">
                    <div
                      *ngFor="let seat of getSeatsForRow(row)"
                      class="seat"
                      [class.unavailable]="!seat.available"
                      [class.selected]="isSelected(seat)"
                      (click)="toggleSeatSelection(seat)"
                    >
                      {{ seat.number }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="seat-legend">
                <div class="legend-item">
                  <div class="seat-sample available"></div>
                  <span>Available</span>
                </div>
                <div class="legend-item">
                  <div class="seat-sample unavailable"></div>
                  <span>Taken</span>
                </div>
                <div class="legend-item">
                  <div class="seat-sample selected"></div>
                  <span>Selected</span>
                </div>
              </div>

              <mat-divider></mat-divider>

              <div class="reservation-summary">
                <h3>Reservation Summary</h3>
                <p *ngIf="selectedSeats.length === 0">No seats selected</p>
                <div *ngIf="selectedSeats.length > 0">
                  <p>Selected Seats:</p>
                  <ul class="selected-seats-list">
                    <li *ngFor="let seat of selectedSeats">
                      {{ seat.row }}{{ seat.number }}
                    </li>
                  </ul>
                  <p class="total-price">
                    Total: {{ getTotalPrice() | currency : 'EUR' }}
                  </p>
                </div>
              </div>
            </mat-card-content>
            <mat-card-actions class="card-actions">
              <button
                mat-stroked-button
                class="clear-button"
                (click)="clearSelection()"
              >
                <mat-icon>clear</mat-icon> Clear Selection
              </button>
              <button
                mat-raised-button
                class="confirm-button"
                [disabled]="selectedSeats.length === 0 || reserving"
                (click)="confirmReservation()"
              >
                <mat-icon>check_circle</mat-icon> Confirm Reservation
              </button>
            </mat-card-actions>
          </mat-card>
        </ng-container>
      </div>
    </div>
  `,
  styles: [
    `
      .reservation-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        background-color: #181818;
        color: #ffffff;
      }

      .content {
        padding: 20px;
        display: flex;
        flex-direction: column;
        flex: 1;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .page-header h1 {
        margin: 0;
        font-size: 2rem;
        color: #ffffff;
      }

      .loading-spinner {
        display: flex;
        justify-content: center;
        padding: 4rem 0;
      }

      .error-message {
        text-align: center;
        padding: 2rem 0;
      }

      .screening-info-card,
      .seat-selection-card {
        background-color: #202020 !important;
        color: #ffffff !important;
        margin-bottom: 2rem;
        border: 1px solid #303030;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }

      .screening-content {
        display: flex;
        gap: 2rem;
        margin-top: 1rem;
      }

      .movie-poster {
        width: 150px;
        min-width: 150px;
        height: 225px;
        overflow: hidden;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }

      .movie-poster img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .movie-details {
        flex: 1;
      }

      .small-icon {
        font-size: 18px;
        vertical-align: middle;
        margin-right: 4px;
      }

      .screen {
        width: 80%;
        height: 40px;
        background: linear-gradient(180deg, #303030, #252525);
        margin: 0 auto 50px;
        border-radius: 8px 8px 0 0;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0 4px 20px rgba(0, 176, 32, 0.3);
        position: relative;
        transform: perspective(100px) rotateX(-5deg);
        border-bottom: 2px solid rgba(0, 176, 32, 0.7);
      }

      .screen:after {
        content: '';
        position: absolute;
        bottom: -20px;
        left: 0;
        right: 0;
        height: 20px;
        background: radial-gradient(
          ellipse at center,
          rgba(0, 176, 32, 0.2) 0%,
          rgba(0, 0, 0, 0) 70%
        );
        pointer-events: none;
      }

      .screen-label {
        color: rgba(255, 255, 255, 0.8);
        font-weight: 500;
        letter-spacing: 2px;
        text-transform: uppercase;
        text-shadow: 0 0 5px rgba(0, 176, 32, 0.5);
      }

      .seats-container {
        margin: 3rem auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
        justify-content: center;
        max-width: 800px;
        padding: 20px;
        border-radius: 10px;
        background-color: rgba(32, 32, 32, 0.5);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.05);
      }

      .seat-row {
        display: flex;
        align-items: center;
        gap: 10px;
        justify-content: center;
      }

      .row-label {
        width: 30px;
        text-align: center;
        font-weight: 500;
        color: #ffffff;
      }

      .seats {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: center;
      }

      .seat {
        width: 35px;
        height: 35px;
        background-color: rgba(48, 48, 48, 0.8);
        border-radius: 6px 6px 2px 2px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        color: #ffffff;
        border-bottom: 4px solid #404040;
        user-select: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        position: relative;
      }

      .seat.available:hover {
        background-color: rgba(0, 176, 32, 0.5);
        transform: translateY(-3px) scale(1.05);
        box-shadow: 0 4px 8px rgba(0, 176, 32, 0.3);
        z-index: 2;
      }

      .seat.unavailable {
        background-color: #252525;
        color: rgba(255, 255, 255, 0.3);
        cursor: not-allowed;
        opacity: 0.5;
        border-bottom-color: #353535;
      }

      .seat.selected {
        background-color: #00b020;
        color: #ffffff;
        font-weight: bold;
        transform: translateY(-3px) scale(1.05);
        border-bottom-color: #008a1a;
        box-shadow: 0 4px 8px rgba(0, 176, 32, 0.4);
        z-index: 2;
      }

      .seat-legend {
        display: flex;
        justify-content: center;
        gap: 30px;
        margin: 2rem 0;
        padding: 15px;
        background-color: rgba(32, 32, 32, 0.7);
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.05);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .seat-sample {
        width: 20px;
        height: 20px;
        border-radius: 4px 4px 2px 2px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .seat-sample.available {
        background-color: rgba(48, 48, 48, 0.8);
        border-bottom: 2px solid #404040;
      }

      .seat-sample.unavailable {
        background-color: #252525;
        opacity: 0.5;
        border-bottom: 2px solid #353535;
      }

      .seat-sample.selected {
        background-color: #00b020;
        border-bottom: 2px solid #008a1a;
      }

      .reservation-summary {
        padding: 1.5rem;
        background-color: rgba(32, 32, 32, 0.7);
        border-radius: 8px;
        margin-top: 2rem;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.05);
        transition: all 0.3s ease;
      }

      .reservation-summary:hover {
        box-shadow: 0 6px 15px rgba(0, 176, 32, 0.2);
      }

      .reservation-summary h3 {
        color: #ffffff;
        margin-top: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 10px;
        font-size: 1.2rem;
        letter-spacing: 0.5px;
      }

      .selected-seats-list {
        list-style-type: none;
        padding: 0;
        margin: 0.5rem 0;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .selected-seats-list li {
        background-color: #00b020;
        color: #ffffff;
        padding: 6px 12px;
        border-radius: 20px;
        font-weight: 500;
        font-size: 14px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        animation: fadeIn 0.3s ease;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(5px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .total-price {
        font-size: 1.2rem;
        font-weight: 500;
        text-align: right;
        color: #00b020;
        margin-top: 15px;
        padding-top: 10px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .card-actions {
        display: flex;
        justify-content: space-between;
        padding: 16px 20px 20px;
        margin: 0;
      }

      .clear-button {
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: #ffffff;
        transition: all 0.2s ease;
        padding: 6px 16px;
        border-radius: 4px;
      }

      .clear-button:hover:not([disabled]) {
        background-color: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.5);
        transform: translateY(-2px);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      }

      .confirm-button {
        background-color: #00b020;
        color: #ffffff;
        box-shadow: 0 2px 8px rgba(0, 176, 32, 0.3);
        transition: all 0.2s ease;
        padding: 6px 24px;
        font-weight: 500;
        letter-spacing: 0.5px;
        border-radius: 4px;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }

      .confirm-button:hover:not([disabled]) {
        background-color: #00c02a;
        box-shadow: 0 4px 12px rgba(0, 176, 32, 0.5);
        transform: translateY(-2px);
      }

      .confirm-button:disabled {
        background-color: rgba(0, 176, 32, 0.4);
        color: rgba(255, 255, 255, 0.5);
      }

      .confirm-button .mat-icon {
        color: #ffffff !important;
        margin-right: 8px;
      }

      .clear-button .mat-icon {
        margin-right: 8px;
      }

      /* Asegurar que el botón active tenga color de fondo verde */
      .confirm-button:active,
      .confirm-button:focus {
        background-color: #00a01a !important;
        color: #ffffff !important;
      }

      /* Estilos para evitar que mat-raised-button cambie a fondo blanco */
      ::ng-deep .confirm-button.mat-mdc-raised-button.mat-accent {
        background-color: #00b020 !important;
        color: #ffffff !important;
      }

      ::ng-deep .confirm-button.mat-mdc-raised-button.mat-accent:hover {
        background-color: #00c02a !important;
      }

      .payment-info {
        padding: 1rem 0;
      }

      .reservation-price {
        font-size: 1.5rem;
        font-weight: 500;
        color: #ffffff;
      }

      .reservation-actions {
        display: flex;
        justify-content: flex-end;
        gap: 15px;
        margin-top: 2rem;
      }

      .no-seats-message {
        text-align: center;
        padding: 2rem 0;
        font-style: italic;
        color: rgba(255, 255, 255, 0.7);
      }

      @media (max-width: 768px) {
        .screening-content {
          flex-direction: column;
        }

        .movie-poster {
          width: 100px;
          height: 150px;
          margin: 0 auto;
        }

        .seat {
          width: 30px;
          height: 30px;
          font-size: 11px;
        }

        .screen {
          width: 90%;
        }

        .seats-container {
          padding: 10px;
        }

        .seat-row {
          gap: 6px;
        }

        .seats {
          gap: 6px;
        }

        .card-actions {
          flex-direction: column;
          gap: 10px;
        }

        .clear-button,
        .confirm-button {
          width: 100%;
        }
      }
    `,
  ],
})
export class ReservationComponent implements OnInit {
  screeningId: number | null = null;
  screening: Screening | null = null;
  seats: any[] = [];
  selectedSeats: any[] = [];
  loading = true;
  reserving = false;
  seatRows: string[] = [];
  isLoggedIn = false;
  isAdmin = false;
  username = '';
  loginForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private screeningService: ScreeningService,
    private reservationService: ReservationService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.updateAuthStatus();

    // Subscribe to auth changes
    this.authService.currentUser$.subscribe((user) => {
      this.updateAuthStatus();
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.screeningId = +id;
        this.loadScreeningData();
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  private updateAuthStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();

    // Get username from stored user data
    const userData = this.authService.getUserData();
    this.username = userData?.username || '';
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login({ username, password }).subscribe({
        next: () => {
          this.updateAuthStatus();
          // Redirect based on user role
          if (this.isAdmin) {
            this.router.navigate(['/admin/dashboard']);
          }
          // Stay on the reservation page with updated UI
        },
        error: (error) => {
          let errorMsg = 'Invalid credentials';

          if (error.error && error.error.message) {
            errorMsg = error.error.message;
          } else if (error.status === 0) {
            errorMsg =
              'Could not connect to server. Please check your connection or if the server is active.';
          } else if (error.status === 401) {
            errorMsg = 'Invalid username or password';
          }

          this.snackBar.open('Login error: ' + errorMsg, 'Close', {
            duration: 5000,
          });
        },
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.isAdmin = false;
    this.username = '';
    this.router.navigate(['/']);
  }

  loadScreeningData(): void {
    this.loading = true;
    if (this.screeningId) {
      this.screeningService.getScreeningBasicById(this.screeningId).subscribe({
        next: (data) => {
          this.screening = {
            id: data.id,
            movieId: data.movieId,
            roomId: data.roomId,
            startTime: data.startTime,
            endTime: data.endTime,
            ticketPrice: data.ticketPrice,
            is3D: data.is3D,
            hasSubtitles: data.hasSubtitles,
            language: data.language,
            format: data.format
          };
          
          // Create a simple room object with only the needed fields for the reservation view
          // Using type assertion to avoid type errors with the full Room interface
          this.screening.room = {
            id: data.roomId,
            number: data.roomNumber,
            capacity: data.capacity
          } as any;
          
          // Load seats after screening data is loaded
          this.loadSeats();
        },
        error: (error) => {
          console.error('Error loading screening:', error);
          this.snackBar.open('Error loading screening details. Please try again.', 'Close', {
            duration: 5000
          });
          this.loading = false;
        }
      });
    }
  }

  loadSeats(): void {
    if (!this.screeningId) return;

    this.reservationService.getScreeningSeats(this.screeningId).subscribe({
      next: (seats) => {
        this.seats = seats.map((seat) => ({
          ...seat,
          available: seat.status !== 'RESERVED',
        }));

        // Extract unique row labels and sort them
        this.seatRows = [...new Set(this.seats.map((seat) => seat.row))].sort();

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading seats:', error);
        this.snackBar.open('Could not load seat information.', 'Close', {
          duration: 5000,
        });
        this.loading = false;
      },
    });
  }

  getSeatsForRow(row: string): any[] {
    return this.seats
      .filter((seat) => seat.row === row)
      .sort((a, b) => a.number - b.number);
  }

  toggleSeatSelection(seat: any): void {
    if (!seat.available) return;

    const index = this.selectedSeats.findIndex((s) => s.id === seat.id);
    if (index > -1) {
      this.selectedSeats.splice(index, 1);
    } else {
      this.selectedSeats.push(seat);
    }
  }

  isSelected(seat: any): boolean {
    return this.selectedSeats.some((s) => s.id === seat.id);
  }

  clearSelection(): void {
    this.selectedSeats = [];
  }

  getTotalPrice(): number {
    if (!this.screening) return 0;
    return this.selectedSeats.length * this.screening.ticketPrice;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  confirmReservation(): void {
    if (this.selectedSeats.length === 0 || !this.screeningId) return;

    // Get the current user data
    const userData = this.authService.getUserData();
    if (!userData || !userData.id) {
      this.snackBar.open(
        'User information not available. Please log in again.',
        'Close',
        {
          duration: 5000,
        }
      );
      return;
    }

    this.reserving = true;
    const reservationData = {
      userId: userData.id,
      screeningId: this.screeningId,
      seatIds: this.selectedSeats.map((seat) => seat.id),
    };

    this.reservationService.createReservation(reservationData).subscribe({
      next: (result) => {
        this.snackBar.open('Reservation successful!', 'Close', {
          duration: 5000,
        });
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error making reservation:', error);
        let errorMessage = 'Could not complete reservation.';

        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }

        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
        });
        this.reserving = false;
      },
    });
  }
}
