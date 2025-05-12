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
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ScreeningService } from '../../core/services/screening.service';
import { ReservationService } from '../../core/services/reservation.service';
import { AuthService } from '../../core/services/auth.service';
import { Screening, Seat } from '../../core/models/screening.model';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

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
    MatFormFieldModule
  ],
  template: `
    <div class="reservation-container">
      <!-- Navigation Bar -->
      <mat-toolbar color="primary" class="header-toolbar">
        <span routerLink="/" style="cursor: pointer;">CineReserve</span>
        <span class="spacer"></span>
        
        <!-- Not logged in: show login dropdown -->
        <div *ngIf="!isLoggedIn">
          <button mat-button [matMenuTriggerFor]="loginMenu">
            Login <mat-icon>arrow_drop_down</mat-icon>
          </button>
          <mat-menu #loginMenu="matMenu" class="login-menu">
            <div class="login-form-container" (click)="$event.stopPropagation()">
              <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
                <mat-form-field appearance="outline">
                  <mat-label>Username</mat-label>
                  <input matInput formControlName="username">
                  <mat-error *ngIf="loginForm.get('username')?.hasError('required')">Required</mat-error>
                </mat-form-field>
                
                <mat-form-field appearance="outline">
                  <mat-label>Password</mat-label>
                  <input matInput type="password" formControlName="password">
                  <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Required</mat-error>
                </mat-form-field>
                
                <div class="login-actions">
                  <button mat-raised-button color="primary" type="submit" [disabled]="loginForm.invalid">
                    Login
                  </button>
                </div>
              </form>
              <div class="register-link">
                <a mat-button routerLink="/register">Don't have an account? Register</a>
              </div>
            </div>
          </mat-menu>
          <button mat-raised-button color="accent" routerLink="/register">Register</button>
        </div>
        
        <!-- Logged in: show username with dropdown -->
        <div *ngIf="isLoggedIn">
          <button mat-button *ngIf="isAdmin" routerLink="/admin/dashboard">Admin Dashboard</button>
          <button mat-button *ngIf="!isAdmin" routerLink="/movies">View Movies</button>
          <button mat-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon> 
            {{ username }} <mat-icon>arrow_drop_down</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item (click)="logout()">
              <mat-icon>exit_to_app</mat-icon> Sign Out
            </button>
          </mat-menu>
        </div>
      </mat-toolbar>

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
            <button mat-raised-button color="primary" routerLink="/">Go to Home</button>
          </mat-card-content>
        </mat-card>
      </div>

      <ng-container *ngIf="!loading && screening">
        <mat-card class="screening-info-card">
          <mat-card-header>
            <mat-card-title>{{ screening.movie?.title }}</mat-card-title>
            <mat-card-subtitle>
              Room {{ screening.room?.number }} | {{ formatDate(screening.startTime) }}
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="screening-content">
              <div class="movie-poster" *ngIf="screening.movie?.posterUrl">
                <img [src]="screening.movie?.posterUrl" alt="{{ screening.movie?.title }} poster">
              </div>
              <div class="movie-details">
                <p><strong>Price:</strong> {{ screening.ticketPrice | currency:'EUR' }}</p>
                <p *ngIf="screening.format"><strong>Format:</strong> {{ screening.format }}</p>
                <p *ngIf="screening.language"><strong>Language:</strong> {{ screening.language }}</p>
                <p *ngIf="screening.is3D"><mat-icon class="small-icon">3d</mat-icon> 3D</p>
                <p *ngIf="screening.hasSubtitles"><mat-icon class="small-icon">subtitles</mat-icon> With subtitles</p>
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
                  Total: {{ getTotalPrice() | currency:'EUR' }}
                </p>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="warn" (click)="clearSelection()">Clear Selection</button>
            <button 
              mat-raised-button 
              color="primary" 
              [disabled]="selectedSeats.length === 0 || reserving"
              (click)="confirmReservation()"
            >
              <mat-icon>check_circle</mat-icon> Confirm Reservation
            </button>
          </mat-card-actions>
        </mat-card>
      </ng-container>
    </div>
  `,
  styles: [`
    .reservation-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .header-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      margin-bottom: 20px;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .login-form-container {
      padding: 16px;
      min-width: 300px;
    }
    
    .login-form-container mat-form-field {
      width: 100%;
      margin-bottom: 10px;
    }
    
    .login-actions {
      display: flex;
      justify-content: center;
      margin-top: 10px;
    }
    
    .register-link {
      margin-top: 10px;
      text-align: center;
    }
    
    ::ng-deep .mat-mdc-menu-panel.login-menu {
      max-width: none !important;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 0 20px;
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 50px 0;
    }

    .error-message {
      text-align: center;
      padding: 20px;
    }

    .screening-info-card, .seat-selection-card {
      margin: 0 20px 20px 20px;
    }

    .screening-content {
      display: flex;
      gap: 20px;
    }

    .movie-poster {
      flex-shrink: 0;
      width: 120px;
      height: 180px;
      overflow: hidden;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
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
      background-color: #ddd;
      height: 30px;
      margin-bottom: 30px;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80%;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      transform: perspective(200px) rotateX(-5deg);
    }

    .screen-label {
      color: #555;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .seats-container {
      margin: 20px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .seat-row {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      justify-content: center;
    }

    .row-label {
      width: 30px;
      font-weight: bold;
      text-align: center;
    }

    .seats {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
    }

    .seat {
      width: 30px;
      height: 30px;
      background-color: #90caf9;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 12px;
    }

    .seat.unavailable {
      background-color: #f5f5f5;
      color: #aaa;
      cursor: not-allowed;
    }

    .seat.selected {
      background-color: #4caf50;
      color: white;
    }

    .seat-legend {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin: 20px 0;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .seat-sample {
      width: 20px;
      height: 20px;
      border-radius: 3px;
    }

    .seat-sample.available {
      background-color: #90caf9;
    }

    .seat-sample.unavailable {
      background-color: #f5f5f5;
    }

    .seat-sample.selected {
      background-color: #4caf50;
    }

    .reservation-summary {
      margin-top: 20px;
    }

    .selected-seats-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      list-style: none;
      padding: 0;
      margin: 10px 0;
    }

    .selected-seats-list li {
      background-color: #f0f0f0;
      padding: 5px 10px;
      border-radius: 15px;
      font-size: 14px;
    }

    .total-price {
      font-size: 18px;
      font-weight: bold;
      margin-top: 15px;
    }

    .no-seats-message {
      text-align: center;
      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 5px;
      margin: 20px 0;
    }

    mat-card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
  `]
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
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.updateAuthStatus();
    
    // Subscribe to auth changes
    this.authService.currentUser$.subscribe(user => {
      this.updateAuthStatus();
    });
    
    this.route.paramMap.subscribe(params => {
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
            errorMsg = 'Could not connect to server. Please check your connection or if the server is active.';
          } else if (error.status === 401) {
            errorMsg = 'Invalid username or password';
          }
          
          this.snackBar.open('Login error: ' + errorMsg, 'Close', {
            duration: 5000
          });
        }
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
    if (!this.screeningId) return;

    this.loading = true;
    this.screeningService.getScreeningById(this.screeningId).subscribe({
      next: (screening) => {
        this.screening = screening;
        this.loadSeats();
      },
      error: (error) => {
        console.error('Error loading screening:', error);
        this.snackBar.open('Could not load screening details.', 'Close', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }

  loadSeats(): void {
    if (!this.screeningId) return;

    this.reservationService.getScreeningSeats(this.screeningId).subscribe({
      next: (seats) => {
        this.seats = seats.map(seat => ({
          ...seat,
          available: seat.status !== 'RESERVED'
        }));
        
        // Extract unique row labels and sort them
        this.seatRows = [...new Set(this.seats.map(seat => seat.row))].sort();
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading seats:', error);
        this.snackBar.open('Could not load seat information.', 'Close', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }

  getSeatsForRow(row: string): any[] {
    return this.seats
      .filter(seat => seat.row === row)
      .sort((a, b) => a.number - b.number);
  }

  toggleSeatSelection(seat: any): void {
    if (!seat.available) return;

    const index = this.selectedSeats.findIndex(s => s.id === seat.id);
    if (index > -1) {
      this.selectedSeats.splice(index, 1);
    } else {
      this.selectedSeats.push(seat);
    }
  }

  isSelected(seat: any): boolean {
    return this.selectedSeats.some(s => s.id === seat.id);
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
      minute: '2-digit'
    }).format(date);
  }

  confirmReservation(): void {
    if (this.selectedSeats.length === 0 || !this.screeningId) return;

    // Get the current user data
    const userData = this.authService.getUserData();
    if (!userData || !userData.id) {
      this.snackBar.open('User information not available. Please log in again.', 'Close', {
        duration: 5000
      });
      return;
    }

    this.reserving = true;
    const reservationData = {
      userId: userData.id,
      screeningId: this.screeningId,
      seatIds: this.selectedSeats.map(seat => seat.id)
    };

    this.reservationService.createReservation(reservationData).subscribe({
      next: (result) => {
        this.snackBar.open('Reservation successful!', 'Close', {
          duration: 5000
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
          duration: 5000
        });
        this.reserving = false;
      }
    });
  }
} 