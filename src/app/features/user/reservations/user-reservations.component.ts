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
import { trigger, transition, style, animate, stagger, query, state, keyframes } from '@angular/animations';
import { ReservationService } from '../../../core/services/reservation.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

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
    NavbarComponent,
    DatePipe
  ],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
    trigger('slideInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('slideInRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
    trigger('pulseAnimation', [
      state('inactive', style({ transform: 'scale(1)' })),
      state('active', style({ transform: 'scale(1)' })),
      transition('inactive => active', [
        animate('400ms ease-in', keyframes([
          style({ transform: 'scale(1)', offset: 0 }),
          style({ transform: 'scale(1.1)', offset: 0.5 }),
          style({ transform: 'scale(1)', offset: 1 })
        ]))
      ])
    ]),
    trigger('staggerList', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger('100ms', [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  templateUrl: './user-reservations.component.html',
  styleUrls: ['./user-reservations.component.scss'],
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
  
  formatDateShort(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  }
  
  extractTime(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
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
  
  // Get reservations by category
  getTodayReservations(): any[] {
    return this.reservations.filter(r => this.isTodayReservation(r.screening.startTime));
  }
  
  getUpcomingReservations(): any[] {
    return this.reservations.filter(r => this.isUpcoming(r.screening.startTime));
  }
  
  getPastReservations(): any[] {
    return this.reservations.filter(r => this.isPastReservation(r.screening.startTime));
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