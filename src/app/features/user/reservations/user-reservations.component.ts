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
  template: `
    <div class="user-reservations-container">
      <app-navbar></app-navbar>
      
      <div class="page-content">
        <div class="page-header">
          <h1 class="page-title" @slideInRight>
            <mat-icon class="section-icon">bookmarks</mat-icon>
            My Reservations
          </h1>
          <button mat-raised-button color="accent" routerLink="/" @slideInUp>
            <mat-icon>arrow_back</mat-icon> Back to Home
          </button>
        </div>

        <div *ngIf="loading" class="loading-container" @fadeInOut>
          <mat-spinner [diameter]="50"></mat-spinner>
          <div class="loading-text">Loading your reservations...</div>
        </div>

        <div *ngIf="!loading && reservations.length === 0" class="no-reservations" @fadeIn>
          <mat-card>
            <mat-card-content>
              <mat-icon class="empty-icon">event_busy</mat-icon>
              <p>You don't have any reservations yet.</p>
              <button mat-raised-button color="accent" routerLink="/movies">
                Browse Movies
              </button>
            </mat-card-content>
          </mat-card>
        </div>

        <div *ngIf="!loading && reservations.length > 0" class="reservations-sections">
          <!-- Today's reservations -->
          <div *ngIf="getTodayReservations().length > 0" class="reservation-section" @slideInUp>
            <h2 class="section-title" @slideInRight>
              <mat-icon>today</mat-icon>
              Today's Reservations
            </h2>
            <div class="reservations-list" [@staggerList]="getTodayReservations().length">
              <mat-card *ngFor="let reservation of getTodayReservations()" class="reservation-card" @slideInUp>
                <div class="card-image-container">
                  <img *ngIf="reservation.screening.movie.posterUrl" [src]="reservation.screening.movie.posterUrl" [alt]="reservation.screening.movie.title" class="card-image">
                  <div *ngIf="!reservation.screening.movie.posterUrl" class="no-image">
                    <mat-icon>movie</mat-icon>
                  </div>
                  <div class="card-time-badge">
                    <mat-icon>schedule</mat-icon>
                    {{ extractTime(reservation.screening.startTime) }}
                  </div>
                </div>
                
                <mat-card-header>
                  <mat-card-title>{{ reservation.screening.movie.title }}</mat-card-title>
                  <mat-card-subtitle>
                    {{ formatDate(reservation.screening.startTime) }} | Room {{ reservation.screening.room.number }}
                  </mat-card-subtitle>
                </mat-card-header>
                
                <mat-card-content>
                  <div class="reservation-details">
                    <div class="detail-row">
                      <span class="detail-label">Status:</span>
                      <span [ngClass]="getStatusClass(reservation.status)">{{ reservation.status }}</span>
                    </div>
                    
                    <div class="detail-row">
                      <span class="detail-label">Price:</span>
                      <span class="detail-value price">{{ getReservationTotal(reservation) | currency:'EUR' }}</span>
                    </div>
                    
                    <div class="seats-container">
                      <span class="detail-label">Seats:</span>
                      <div class="seats-list">
                        <span class="seat-badge" *ngFor="let seatReservation of reservation.seatReservations">
                          {{ seatReservation.seat.rowLabel }}{{ seatReservation.seat.columnNumber }}
                        </span>
                      </div>
                    </div>

                    <div class="screening-badges">
                      <span class="format-badge" *ngIf="reservation.screening.format">{{ reservation.screening.format }}</span>
                      <span class="format-badge" *ngIf="reservation.screening.is3D">3D</span>
                      <span class="format-badge" *ngIf="reservation.screening.hasSubtitles">SUB</span>
                    </div>
                  </div>
                </mat-card-content>
                
                <mat-card-actions>
                  <button mat-stroked-button color="primary" 
                    [routerLink]="['/movies', reservation.screening.movie.id]">
                    <mat-icon>movie</mat-icon> Movie Info
                  </button>
                  <button mat-stroked-button color="warn" 
                    *ngIf="!isPastReservation(reservation.screening.startTime) && reservation.status !== 'CANCELLED'"
                    (click)="cancelReservation(reservation.id)">
                    <mat-icon>cancel</mat-icon> Cancel
                  </button>
                  <button mat-raised-button color="accent" 
                    *ngIf="isTicketAvailable(reservation)"
                    (click)="downloadTicket(reservation)">
                    <mat-icon>confirmation_number</mat-icon> Ticket
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
          
          <!-- Upcoming reservations -->
          <div *ngIf="getUpcomingReservations().length > 0" class="reservation-section" @slideInUp>
            <h2 class="section-title" @slideInRight>
              <mat-icon>event</mat-icon>
              Upcoming Reservations
            </h2>
            <div class="reservations-list" [@staggerList]="getUpcomingReservations().length">
              <mat-card *ngFor="let reservation of getUpcomingReservations()" class="reservation-card" @slideInUp>
                <div class="card-image-container">
                  <img *ngIf="reservation.screening.movie.posterUrl" [src]="reservation.screening.movie.posterUrl" [alt]="reservation.screening.movie.title" class="card-image">
                  <div *ngIf="!reservation.screening.movie.posterUrl" class="no-image">
                    <mat-icon>movie</mat-icon>
                  </div>
                  <div class="card-date-badge">
                    {{ formatDateShort(reservation.screening.startTime) }}
                  </div>
                </div>
                
                <mat-card-header>
                  <mat-card-title>{{ reservation.screening.movie.title }}</mat-card-title>
                  <mat-card-subtitle>
                    {{ formatDate(reservation.screening.startTime) }} | Room {{ reservation.screening.room.number }}
                  </mat-card-subtitle>
                </mat-card-header>
                
                <mat-card-content>
                  <div class="reservation-details">
                    <div class="detail-row">
                      <span class="detail-label">Status:</span>
                      <span [ngClass]="getStatusClass(reservation.status)">{{ reservation.status }}</span>
                    </div>
                    
                    <div class="detail-row">
                      <span class="detail-label">Price:</span>
                      <span class="detail-value price">{{ getReservationTotal(reservation) | currency:'EUR' }}</span>
                    </div>
                    
                    <div class="seats-container">
                      <span class="detail-label">Seats:</span>
                      <div class="seats-list">
                        <span class="seat-badge" *ngFor="let seatReservation of reservation.seatReservations">
                          {{ seatReservation.seat.rowLabel }}{{ seatReservation.seat.columnNumber }}
                        </span>
                      </div>
                    </div>
                    
                    <div class="screening-badges">
                      <span class="format-badge" *ngIf="reservation.screening.format">{{ reservation.screening.format }}</span>
                      <span class="format-badge" *ngIf="reservation.screening.is3D">3D</span>
                      <span class="format-badge" *ngIf="reservation.screening.hasSubtitles">SUB</span>
                    </div>
                  </div>
                </mat-card-content>
                
                <mat-card-actions>
                  <button mat-stroked-button color="primary" 
                    [routerLink]="['/movies', reservation.screening.movie.id]">
                    <mat-icon>movie</mat-icon> Movie Info
                  </button>
                  <button mat-stroked-button color="warn" 
                    *ngIf="!isPastReservation(reservation.screening.startTime) && reservation.status !== 'CANCELLED'"
                    (click)="cancelReservation(reservation.id)">
                    <mat-icon>cancel</mat-icon> Cancel
                  </button>
                  <button mat-raised-button color="accent" 
                    *ngIf="isTicketAvailable(reservation)"
                    (click)="downloadTicket(reservation)">
                    <mat-icon>confirmation_number</mat-icon> Ticket
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
          
          <!-- Past reservations -->
          <div *ngIf="getPastReservations().length > 0" class="reservation-section past-section" @slideInUp>
            <h2 class="section-title" @slideInRight>
              <mat-icon>history</mat-icon>
              Past Reservations
            </h2>
            <div class="reservations-list past-list" [@staggerList]="getPastReservations().length">
              <mat-card *ngFor="let reservation of getPastReservations()" class="reservation-card past-card" @slideInUp>
                <div class="card-image-container">
                  <img *ngIf="reservation.screening.movie.posterUrl" [src]="reservation.screening.movie.posterUrl" [alt]="reservation.screening.movie.title" class="card-image">
                  <div *ngIf="!reservation.screening.movie.posterUrl" class="no-image">
                    <mat-icon>movie</mat-icon>
                  </div>
                  <div class="card-past-badge">
                    <mat-icon>check_circle</mat-icon>
                  </div>
                </div>
                
                <mat-card-header>
                  <mat-card-title>{{ reservation.screening.movie.title }}</mat-card-title>
                  <mat-card-subtitle>
                    {{ formatDate(reservation.screening.startTime) }}
                  </mat-card-subtitle>
                </mat-card-header>
                
                <mat-card-content>
                  <div class="reservation-details">
                    <div class="detail-row">
                      <span class="detail-label">Status:</span>
                      <span [ngClass]="getStatusClass(reservation.status)">{{ reservation.status }}</span>
                    </div>
                    
                    <div class="seats-container">
                      <span class="detail-label">Seats:</span>
                      <div class="seats-list">
                        <span class="seat-badge past-seat" *ngFor="let seatReservation of reservation.seatReservations">
                          {{ seatReservation.seat.rowLabel }}{{ seatReservation.seat.columnNumber }}
                        </span>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
                
                <mat-card-actions>
                  <button mat-stroked-button color="primary" 
                    [routerLink]="['/movies', reservation.screening.movie.id]">
                    <mat-icon>movie</mat-icon> Movie Info
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Main container */
    .user-reservations-container {
      min-height: 100vh;
      background-color: #3c3b34;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      width: 100%;
      overflow-x: hidden; /* Prevent horizontal scroll */
    }
    
    /* Content area */
    .page-content {
      padding: 20px 10px;
      max-width: 1600px;
      margin: 0 auto;
      flex: 1;
      width: 95%;
      box-sizing: border-box; /* Include padding in width calculation */
    }
    
    /* Page header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 0 auto 40px;
      padding-bottom: 15px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .page-title {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: #FFFFFF;
      border-left: 3px solid #ff6b6b;
      padding-left: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .section-icon {
      color: #ff6b6b;
      font-size: 30px;
      height: 30px;
      width: 30px;
      animation: pulse 2.5s infinite ease-in-out;
    }
    
    /* Loading state */
    .loading-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 40px 0;
      min-height: 150px;
    }
    
    .loading-container ::ng-deep .mat-progress-spinner circle {
      stroke: #ff6b6b !important;
    }
    
    .loading-text {
      margin-top: 10px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      font-weight: 500;
    }
    
    /* Empty state styling */
    .no-reservations {
      max-width: 500px;
      margin: 60px auto;
    }
    
    .no-reservations mat-card {
      background-color: #35342e !important;
      color: #FFFFFF !important;
      border-radius: 12px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
      text-align: center;
      padding: 40px 20px;
    }
    
    .empty-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      color: rgba(255, 255, 255, 0.4);
      margin-bottom: 20px;
    }
    
    /* Section styling */
    .reservation-section {
      margin: 0 auto 50px;
    }
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #FFFFFF;
      position: relative;
      padding-left: 12px;
      border-left: 3px solid #ff6b6b;
    }
    
    .section-title mat-icon {
      color: #ff6b6b;
    }
    
    .past-section .section-title {
      color: rgba(255, 255, 255, 0.7);
    }
    
    /* Card grid layout */
    .reservations-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 25px;
    }
    
    .past-list {
      opacity: 0.8;
    }
    
    /* Card styling */
    .reservation-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: #35342e !important;
      color: #FFFFFF !important;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
      transition: transform 0.3s, box-shadow 0.3s;
    }
    
    .reservation-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 14px 28px rgba(0, 0, 0, 0.5);
    }
    
    .past-card {
      opacity: 0.85;
    }
    
    .past-card:hover {
      transform: translateY(-5px);
    }
    
    /* Card image container */
    .card-image-container {
      position: relative;
      height: 180px;
      overflow: hidden;
    }
    
    .card-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s;
    }
    
    .reservation-card:hover .card-image {
      transform: scale(1.05);
    }
    
    .no-image {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #2a2a25;
    }
    
    .no-image mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: rgba(255, 255, 255, 0.3);
    }
    
    /* Badge styling */
    .card-time-badge, .card-date-badge, .card-past-badge {
      position: absolute;
      top: 15px;
      right: 15px;
      padding: 5px 10px;
      border-radius: 20px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 14px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
    
    .card-time-badge {
      background-color: #ff6b6b;
      color: white;
    }
    
    .card-date-badge {
      background-color: rgba(255, 255, 255, 0.2);
      color: white;
    }
    
    .card-past-badge {
      background-color: rgba(255, 255, 255, 0.2);
      color: white;
      padding: 8px;
      border-radius: 50%;
    }
    
    .card-past-badge mat-icon {
      font-size: 20px;
      height: 20px;
      width: 20px;
    }
    
    /* Card header styling */
    mat-card-header {
      padding: 16px 16px 0;
    }
    
    mat-card-title {
      font-size: 18px !important;
      font-weight: 600 !important;
      margin-bottom: 5px !important;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    mat-card-subtitle {
      color: rgba(255, 255, 255, 0.7) !important;
      font-size: 14px !important;
    }
    
    /* Card content styling */
    mat-card-content {
      padding: 0 16px;
      flex: 1;
    }
    
    .reservation-details {
      margin-top: 10px;
    }
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    
    .detail-label {
      color: rgba(255, 255, 255, 0.6);
      font-weight: 500;
    }
    
    .detail-value {
      color: white;
    }
    
    .price {
      color: #ff6b6b;
      font-weight: 600;
    }
    
    /* Seats styling */
    .seats-container {
      margin: 15px 0;
    }
    
    .seats-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
    }
    
    .seat-badge {
      background-color: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: rgba(255, 255, 255, 0.9);
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 500;
    }
    
    .past-seat {
      background-color: transparent;
    }
    
    /* Format badges */
    .screening-badges {
      display: flex;
      gap: 8px;
      margin-bottom: 15px;
    }
    
    .format-badge {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
    
    /* Status classes */
    .status-pending {
      color: #ffc107;
      font-weight: 500;
    }
    
    .status-confirmed {
      color: #4caf50;
      font-weight: 500;
    }
    
    .status-cancelled {
      color: #f44336;
      font-weight: 500;
    }
    
    .status-completed {
      color: rgba(255, 255, 255, 0.5);
      font-weight: 500;
    }
    
    /* Card actions */
    mat-card-actions {
      display: flex;
      gap: 8px;
      padding: 8px 16px 16px;
      justify-content: flex-end;
    }
    
    /* Override material accent color */
    ::ng-deep .mat-mdc-raised-button.mat-accent {
      background-color: #ff6b6b !important;
    }

    /* Animation keyframes */
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUpFadeIn {
      from { 
        opacity: 0;
        transform: translateY(20px); 
      }
      to { 
        opacity: 1;
        transform: translateY(0); 
      }
    }
    
    /* Responsive styles */
    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
      }
      
      .reservations-list {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 1200px) {
      .reservations-list {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      }
    }

    @media (max-width: 480px) {
      .page-content {
        padding: 15px 5px;
        width: 98%;
      }
      
      .page-title {
        font-size: 24px;
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