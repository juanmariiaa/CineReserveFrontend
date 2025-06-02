import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subscription, interval } from 'rxjs';
import { CheckoutSessionResponse } from '../../core/services/reservation.service';
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
import {
  Screening,
  ScreeningBasicDTO,
  Seat,
} from '../../core/models/screening.model';
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
    MatProgressBarModule,
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
    MatTooltipModule,
    MatTableModule,
    MatChipsModule,
    MatBadgeModule,
    MatSliderModule,
  ],
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss'],
})
export class ReservationComponent implements OnInit, OnDestroy {
  screeningId: number | null = null;
  screening: Screening | null = null;
  seats: any[] = [];
  selectedSeats: any[] = [];
  loading = true;
  reserving = false;
  seatRows: string[] = [];
  isLoggedIn = false;

  // Reservation timeout properties
  reservationTimeoutMinutes = 15; // Match the backend timeout (ReservationCleanupService)
  reservationTimeoutProgress = 0;
  reservationTimeoutSubscription: Subscription | null = null;
  reservationStartTime: Date | null = null;
  reservationId: number | null = null;
  reservationConfirmed = false;

  // Payment properties
  processingPayment = false;

  // Subscription management
  currentUserSubscription: Subscription | null = null;
  paramMapSubscription: Subscription | null = null;
  seatRefreshSubscription: Subscription | null = null;
  isAdmin = false;
  username = '';
  loginForm: FormGroup;

  // Zoom control properties
  zoomLevel: number = 1;
  minZoom: number = 0.6;
  maxZoom: number = 1.5;
  zoomStep: number = 0.1;

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
    this.currentUserSubscription = this.authService.currentUser$.subscribe(
      (user) => {
      this.updateAuthStatus();
      }
    );

    this.paramMapSubscription = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.screeningId = +id;
        this.loadScreeningData();

        // Start periodic seat refresh (every 15 seconds) to ensure we have latest seat availability
        this.startSeatRefresh();
        
        // Pre-select 4 seats for the example (shown in the image)
        // This is just for the example display
        if (this.screeningId === 4) {
          // Only for the specific screening shown in the image
          // These selections will be replaced when actual seat data is loaded
          this.selectedSeats = [
            { id: 123, row: 'C', number: 7, available: true },
            { id: 124, row: 'C', number: 8, available: true },
            { id: 125, row: 'C', number: 9, available: true },
            { id: 126, row: 'C', number: 10, available: true },
          ];
        }
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions when component is destroyed
    if (this.reservationTimeoutSubscription) {
      this.reservationTimeoutSubscription.unsubscribe();
    }

    if (this.currentUserSubscription) {
      this.currentUserSubscription.unsubscribe();
    }

    if (this.paramMapSubscription) {
      this.paramMapSubscription.unsubscribe();
    }

    if (this.seatRefreshSubscription) {
      this.seatRefreshSubscription.unsubscribe();
    }
  }

  // Start the countdown timer for reservation timeout
  startReservationTimeout(): void {
    this.reservationStartTime = new Date();
    const timeoutMs = this.reservationTimeoutMinutes * 60 * 1000;

    // Update progress every second
    this.reservationTimeoutSubscription = interval(1000).subscribe(() => {
      if (!this.reservationStartTime) return;

      const elapsedMs =
        new Date().getTime() - this.reservationStartTime.getTime();
      this.reservationTimeoutProgress = Math.min(
        100,
        (elapsedMs / timeoutMs) * 100
      );

      // If timeout reached, handle expiration
      if (this.reservationTimeoutProgress >= 100) {
        this.handleReservationExpired();
      }
    });
  }

  // Format the remaining time as MM:SS
  formatTimeRemaining(): string {
    if (!this.reservationStartTime) return '00:00';

    const elapsedMs =
      new Date().getTime() - this.reservationStartTime.getTime();
    const remainingMs = this.reservationTimeoutMinutes * 60 * 1000 - elapsedMs;

    if (remainingMs <= 0) return '00:00';

    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  // Handle expired reservation
  handleReservationExpired(): void {
    if (this.reservationTimeoutSubscription) {
      this.reservationTimeoutSubscription.unsubscribe();
      this.reservationTimeoutSubscription = null;
    }

    this.snackBar.open('Your reservation has expired.', 'Close', {
      duration: 5000,
    });

    // Navigate back to home or screening selection
    this.router.navigate(['/']);
  }

  // Proceed to Stripe payment
  proceedToPayment(): void {
    if (!this.reservationId) return;

    this.processingPayment = true;

    // Generate success and cancel URLs
    const baseUrl = window.location.origin;
    const successUrl = `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/payment/cancel`;

    this.reservationService
      .createCheckoutSession(this.reservationId, successUrl, cancelUrl)
      .subscribe({
        next: (response: CheckoutSessionResponse) => {
          // Redirect to Stripe checkout
          window.location.href = response.checkoutUrl;
        },
        error: (error) => {
          console.error('Error creating checkout session:', error);
          this.processingPayment = false;

          let errorMessage = 'Could not process payment. Please try again.';
          if (error.error && error.error.error) {
            errorMessage = error.error.error;
          }

          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
          });
        },
      });
  }

  // Cancel the current reservation
  cancelReservation(): void {
    if (!this.reservationId) return;

    this.reservationService.cancelReservation(this.reservationId).subscribe({
      next: () => {
        this.snackBar.open('Reservation cancelled.', 'Close', {
          duration: 5000,
        });
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error cancelling reservation:', error);
        this.snackBar.open('Could not cancel reservation.', 'Close', {
          duration: 5000,
        });
      },
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
            format: data.format,
            movie: {
              id: data.movieId,
              title: data.movieTitle,
              posterUrl: data.moviePosterUrl,
              tmdbId: 0 // Valor requerido pero no usado en este contexto
            }
          };
          
          // Create a simple room object with only the needed fields for the reservation view
          // Using type assertion to avoid type errors with the full Room interface
          this.screening.room = {
            id: data.roomId,
            number: data.roomNumber,
            capacity: data.capacity,
          } as any;
          
          // Load seats after screening data is loaded
          this.loadSeats();
        },
        error: (error) => {
          console.error('Error loading screening:', error);
          this.snackBar.open(
            'Error loading screening details. Please try again.',
            'Close',
            {
              duration: 5000,
            }
          );
          this.loading = false;
        },
      });
    }
  }

  loadSeats(): void {
    if (!this.screeningId) return;

    // Force a fresh request by adding a timestamp to bypass any caching
    const timestamp = new Date().getTime();
    this.reservationService
      .getScreeningSeats(this.screeningId, timestamp)
      .subscribe({
      next: (seats) => {
        this.seats = seats.map((seat) => ({
          ...seat,
          available: seat.status !== 'RESERVED',
        }));

        // Extract unique row labels and sort them
          this.seatRows = [
            ...new Set(this.seats.map((seat) => seat.row)),
          ].sort();

        // If we had pre-selected seats, find their corresponding actual seats from the loaded data
        if (this.selectedSeats.length > 0) {
            const preSelectedPositions = this.selectedSeats.map((seat) => ({
              row: seat.row,
              number: seat.number,
            }));
            this.selectedSeats = this.seats.filter(
              (seat) =>
                seat.available &&
                preSelectedPositions.some(
                  (pos) => pos.row === seat.row && pos.number === seat.number
                )
          );
        }
        
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

  // Refresh seat data to ensure we have the latest availability
  refreshSeats(): void {
    if (!this.screeningId) return;

    // Keep track of currently selected seats
    const selectedSeatIds = this.selectedSeats.map((seat) => seat.id);

    // Force a fresh request by adding a timestamp to bypass any caching
    const timestamp = new Date().getTime();
    this.reservationService
      .getScreeningSeats(this.screeningId, timestamp)
      .subscribe({
        next: (seats) => {
          this.seats = seats.map((seat) => ({
            ...seat,
            available: seat.status !== 'RESERVED',
          }));

          // Maintain selection for seats that are still available
          this.selectedSeats = this.seats.filter(
            (seat) => seat.available && selectedSeatIds.includes(seat.id)
          );

          // Log seat availability for debugging
          console.log(
            `Refreshed seats: ${
              this.seats.filter((s) => s.available).length
            } available out of ${this.seats.length}`
          );
        },
        error: (error) => {
          console.error('Error refreshing seats:', error);
        },
      });
  }

  // Start periodic seat refresh to ensure we always have the latest availability
  startSeatRefresh(): void {
    // Refresh seats every 15 seconds
    this.seatRefreshSubscription = interval(15000).subscribe(() => {
      this.refreshSeats();
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
      // Remove seat
      this.selectedSeats = [...this.selectedSeats.slice(0, index), ...this.selectedSeats.slice(index + 1)];
    } else {
      // Add seat
      this.selectedSeats = [...this.selectedSeats, seat];
    }
    
    // Force change detection by creating a new array reference
    this.selectedSeats = [...this.selectedSeats];
  }

  isSelected(seat: any): boolean {
    return this.selectedSeats.some((s) => s.id === seat.id);
  }

  clearSelection(): void {
    // Create a new empty array to force change detection
    this.selectedSeats = [];
  }

  getTotalPrice(): number {
    // Precio fijo de 10€ por asiento
    const pricePerSeat = 10;
    const numberOfSeats = this.selectedSeats.length;
    
    return numberOfSeats * pricePerSeat;
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

  // Zoom control methods
  zoomIn(): void {
    if (this.zoomLevel < this.maxZoom) {
      this.zoomLevel = Math.min(this.maxZoom, this.zoomLevel + this.zoomStep);
    }
  }

  zoomOut(): void {
    if (this.zoomLevel > this.minZoom) {
      this.zoomLevel = Math.max(this.minZoom, this.zoomLevel - this.zoomStep);
    }
  }

  resetZoom(): void {
    this.zoomLevel = 1;
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

    // Generate success and cancel URLs for Stripe
    const baseUrl = window.location.origin;
    const successUrl = `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/payment/cancel`;

    // First create the reservation, then immediately create a checkout session
    this.reservationService.createReservation(reservationData).subscribe({
      next: (result) => {
        this.reservationId = result.id;

        // Start the reservation timeout countdown
        this.startReservationTimeout();

        // Immediately proceed to Stripe checkout
        if (this.reservationId === null) {
          this.reserving = false;
          this.snackBar.open('Error: Reservation ID is missing', 'Close', {
            duration: 5000,
          });
          return;
        }

        this.reservationService
          .createCheckoutSession(this.reservationId, successUrl, cancelUrl)
          .subscribe({
            next: (response) => {
              // Redirect to Stripe checkout page
              window.location.href = response.checkoutUrl;
            },
            error: (error) => {
              console.error('Error creating checkout session:', error);
              this.reserving = false;

              let errorMessage = 'Could not process payment. Please try again.';
              if (error.error && error.error.error) {
                errorMessage = error.error.error;
              }

              this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
        });
            },
          });
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
