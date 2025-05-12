import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ReservationService } from '../../../core/services/reservation.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-reservations',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    DatePipe
  ],
  template: `
    <div class="user-reservations-container">
      <div class="header">
        <h1>My Reservations</h1>
        <button mat-raised-button color="primary" routerLink="/">
          <mat-icon>arrow_back</mat-icon> Back to Home
        </button>
      </div>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
      </div>

      <div *ngIf="!loading && reservations.length === 0" class="no-reservations">
        <mat-card>
          <mat-card-content>
            <p>You don't have any reservations yet.</p>
            <button mat-raised-button color="primary" routerLink="/">
              Browse Movies
            </button>
          </mat-card-content>
        </mat-card>
      </div>

      <div *ngIf="!loading && reservations.length > 0" class="reservations-list">
        <mat-card *ngFor="let reservation of reservations" class="reservation-card" 
          [ngClass]="{'past-reservation': isPastReservation(reservation.screening.startTime)}">
          <mat-card-header>
            <mat-card-title>
              {{ reservation.screening.movie.title }}
              <span *ngIf="isPastReservation(reservation.screening.startTime)" class="past-badge">PAST</span>
              <span *ngIf="isUpcoming(reservation.screening.startTime)" class="upcoming-badge">UPCOMING</span>
              <span *ngIf="isTodayReservation(reservation.screening.startTime)" class="today-badge">TODAY</span>
            </mat-card-title>
            <mat-card-subtitle>
              {{ formatDate(reservation.screening.startTime) }} | Room {{ reservation.screening.room.number }}
            </mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <div class="reservation-info">
              <div class="movie-poster" *ngIf="reservation.screening.movie.posterUrl">
                <img [src]="reservation.screening.movie.posterUrl" [alt]="reservation.screening.movie.title">
              </div>
              
              <div class="reservation-details">
                <p><strong>Reservation Date:</strong> {{ formatDate(reservation.reservationDate) }}</p>
                <p><strong>Status:</strong> 
                  <span [ngClass]="getStatusClass(reservation.status)">{{ reservation.status }}</span>
                </p>
                <p><strong>Price:</strong> {{ getReservationTotal(reservation) | currency:'EUR' }}</p>
                
                <div class="seats-info">
                  <p><strong>Seats:</strong></p>
                  <div class="seats-list">
                    <span class="seat-badge" *ngFor="let seatReservation of reservation.seatReservations">
                      {{ seatReservation.seat.rowLabel }}{{ seatReservation.seat.columnNumber }}
                    </span>
                  </div>
                </div>

                <div class="screening-info" *ngIf="reservation.screening.format || reservation.screening.language">
                  <p *ngIf="reservation.screening.format"><strong>Format:</strong> {{ reservation.screening.format }}</p>
                  <p *ngIf="reservation.screening.language"><strong>Language:</strong> {{ reservation.screening.language }}</p>
                  <p *ngIf="reservation.screening.is3D"><mat-icon class="small-icon">3d</mat-icon> 3D</p>
                  <p *ngIf="reservation.screening.hasSubtitles"><mat-icon class="small-icon">subtitles</mat-icon> With subtitles</p>
                </div>
              </div>
            </div>
          </mat-card-content>
          
          <mat-card-actions>
            <button mat-button color="primary" 
              [routerLink]="['/movies', reservation.screening.movie.id]">
              <mat-icon>movie</mat-icon> Movie Details
            </button>
            <button mat-button color="warn" 
              *ngIf="!isPastReservation(reservation.screening.startTime) && reservation.status !== 'CANCELLED'"
              (click)="cancelReservation(reservation.id)">
              <mat-icon>cancel</mat-icon> Cancel Reservation
            </button>
            <button mat-button 
              *ngIf="isTicketAvailable(reservation)"
              (click)="downloadTicket(reservation)">
              <mat-icon>confirmation_number</mat-icon> Download Ticket
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .user-reservations-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    
    .header h1 {
      margin: 0;
      font-size: 2rem;
      color: #FFFFFF;
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 3rem 0;
    }
    
    .no-reservations {
      text-align: center;
      padding: 2rem 0;
    }
    
    .reservations-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 600px), 1fr));
      gap: 1.5rem;
    }
    
    .reservation-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: transform 0.3s, box-shadow 0.3s;
      background-color: #202020;
      color: #FFFFFF;
      border: 1px solid #303030;
    }
    
    .reservation-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      border-color: #404040;
    }
    
    .past-reservation {
      opacity: 0.7;
    }
    
    .reservation-info {
      display: flex;
      gap: 1.5rem;
      margin-top: 1rem;
    }
    
    .movie-poster {
      width: 100px;
      min-width: 100px;
      height: 150px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
    
    .movie-poster img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .reservation-details {
      flex: 1;
      color: #FFFFFF;
    }
    
    .seats-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    
    .seat-badge {
      background-color: #303030;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: 500;
      color: #FFFFFF;
    }
    
    .past-badge, .upcoming-badge, .today-badge {
      font-size: 0.7rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      margin-left: 0.5rem;
      vertical-align: middle;
    }
    
    .past-badge {
      background-color: #303030;
      color: #AAAAAA;
    }
    
    .upcoming-badge {
      background-color: rgba(0, 176, 32, 0.2);
      color: #00B020;
    }
    
    .today-badge {
      background-color: rgba(0, 176, 32, 0.4);
      color: #FFFFFF;
    }
    
    .status-pending {
      color: #FFC107;
    }
    
    .status-confirmed {
      color: #00B020;
    }
    
    .status-cancelled {
      color: #F44336;
    }
    
    .status-completed {
      color: #9e9e9e;
    }
    
    .small-icon {
      font-size: 18px;
      vertical-align: middle;
      margin-right: 4px;
      color: #00B020;
    }
    
    mat-card-actions {
      margin-top: auto;
      display: flex;
      justify-content: flex-end;
      padding: 0.5rem 1rem 1rem;
    }
    
    mat-card-header {
      background-color: #252525;
      padding: 12px;
      margin: -16px -16px 0 -16px;
      border-bottom: 1px solid #303030;
    }
    
    mat-card-title {
      color: #FFFFFF !important;
    }
    
    mat-card-subtitle {
      color: rgba(255, 255, 255, 0.7) !important;
    }
    
    @media (max-width: 600px) {
      .reservation-info {
        flex-direction: column;
      }
      
      .movie-poster {
        width: 100%;
        height: 200px;
        max-width: unset;
      }
    }
  `]
})
export class UserReservationsComponent implements OnInit {
  reservations: any[] = [];
  loading = true;
  today = new Date();

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUserReservations();
  }

  loadUserReservations(): void {
    this.loading = true;
    this.reservationService.getUserReservations().subscribe({
      next: (data) => {
        this.reservations = data.sort((a, b) => {
          // Sort: future first, then by date
          const dateA = new Date(a.screening.startTime);
          const dateB = new Date(b.screening.startTime);
          const nowPlusThreeHours = new Date();
          nowPlusThreeHours.setHours(nowPlusThreeHours.getHours() + 3);
          
          // Check if screening A is in the past
          const aInPast = dateA < nowPlusThreeHours;
          // Check if screening B is in the past
          const bInPast = dateB < nowPlusThreeHours;
          
          // If one is in the past and the other is not, prioritize the future one
          if (aInPast && !bInPast) return 1;
          if (!aInPast && bInPast) return -1;
          
          // Otherwise sort by date (ascending for future, descending for past)
          return aInPast ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching reservations:', error);
        this.snackBar.open('Failed to load your reservations', 'Close', {
          duration: 5000
        });
        this.loading = false;
      }
    });
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

  isPastReservation(dateString: string): boolean {
    const screeningDate = new Date(dateString);
    // Add 3 hours to screening time to consider it "past" (movie ended)
    const screeningEndTime = new Date(screeningDate);
    screeningEndTime.setHours(screeningEndTime.getHours() + 3);
    return screeningEndTime < this.today;
  }

  isUpcoming(dateString: string): boolean {
    const screeningDate = new Date(dateString);
    // Check if date is in the future but not today
    const tomorrow = new Date(this.today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    return screeningDate >= tomorrow;
  }

  isTodayReservation(dateString: string): boolean {
    const screeningDate = new Date(dateString);
    const today = new Date(this.today);
    
    return screeningDate.getDate() === today.getDate() && 
           screeningDate.getMonth() === today.getMonth() && 
           screeningDate.getFullYear() === today.getFullYear() &&
           !this.isPastReservation(dateString);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'CONFIRMED': return 'status-confirmed';
      case 'CANCELLED': return 'status-cancelled';
      case 'COMPLETED': return 'status-completed';
      default: return '';
    }
  }

  getReservationTotal(reservation: any): number {
    return reservation.seatReservations.length * reservation.screening.ticketPrice;
  }

  isTicketAvailable(reservation: any): boolean {
    return reservation.status === 'CONFIRMED' && !this.isPastReservation(reservation.screening.startTime);
  }

  cancelReservation(reservationId: number): void {
    // Confirm cancellation
    if (confirm('Are you sure you want to cancel this reservation?')) {
      this.reservationService.cancelReservation(reservationId).subscribe({
        next: () => {
          this.snackBar.open('Reservation cancelled successfully', 'Close', {
            duration: 3000
          });
          // Update the reservation status in the UI
          const reservation = this.reservations.find(r => r.id === reservationId);
          if (reservation) {
            reservation.status = 'CANCELLED';
          }
        },
        error: (error) => {
          console.error('Error cancelling reservation:', error);
          let errorMessage = 'Failed to cancel reservation';
          
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000
          });
        }
      });
    }
  }

  downloadTicket(reservation: any): void {
    // This is a placeholder for ticket download functionality
    // In a real app, you would implement a PDF generation service
    this.snackBar.open('Ticket download functionality will be implemented soon!', 'Close', {
      duration: 3000
    });
  }
} 