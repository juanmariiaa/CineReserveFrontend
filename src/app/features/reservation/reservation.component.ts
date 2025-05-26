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
  template: `
    <div class="reservation-container">
      <app-navbar></app-navbar>

      <div class="content" [class.loading]="loading">
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
          <div class="reservation-layout">
            <!-- Main content area -->
            <div class="reservation-summary">
              <!-- Reservation Timeout Progress -->                
              <div *ngIf="reservationTimeoutProgress > 0 && !reservationConfirmed" class="timeout-container">
                <div class="timeout-header">
                  <mat-icon color="warn">timer</mat-icon>
                  <span>Reservation will expire in {{ formatTimeRemaining() }}</span>
                </div>
                <mat-progress-bar 
                  [value]="reservationTimeoutProgress" 
                  color="warn" 
                  mode="determinate">
                </mat-progress-bar>
              </div>
              <!-- Movie Info Bar -->
              <mat-card class="info-bar">
                <div class="movie-info">
                  <div class="movie-poster" *ngIf="screening.movie?.posterUrl">
                    <img
                      [src]="screening.movie ? screening.movie.posterUrl : ''"
                      alt="{{ screening.movie ? screening.movie.title : '' }} poster"
                    />
                  </div>
                  <div class="movie-details">
                    <h2>{{ screening.movie?.title }}</h2>
                    <div class="session-info">
                      <div class="info-item">
                        <mat-icon>event_seat</mat-icon>
                        <span>Room {{ screening.room?.number }}</span>
                      </div>
                      <div class="info-item">
                        <mat-icon>access_time</mat-icon>
                        <span>{{ formatDate(screening.startTime) }}</span>
                      </div>
                      <div class="info-item">
                        <mat-icon>euro</mat-icon>
                        <span>{{ screening.ticketPrice | currency: 'EUR' }}</span>
                      </div>
                      <div class="info-item">
                        <mat-icon>movie</mat-icon>
                        <span>{{ screening.format }}</span>
                      </div>
                      <div class="info-item">
                        <mat-icon>language</mat-icon>
                        <span>{{ screening.language }}</span>
                      </div>
                      <div class="info-chips">
                        <mat-chip *ngIf="screening.is3D" color="accent" selected>3D</mat-chip>
                        <mat-chip *ngIf="screening.hasSubtitles" color="primary" selected>Subtitles</mat-chip>
                      </div>
                    </div>
                  </div>
                </div>
              </mat-card>

              <!-- Seat Selection Area with Zoom Controls -->
              <mat-card class="seat-selection-card">
                <mat-card-header>
                  <mat-card-title>
                    <span>Select Your Seats</span>
                    <span *ngIf="selectedSeats.length > 0" class="selection-counter">
                      {{ selectedSeats.length }} selected
                    </span>
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <!-- Zoom Controls -->
                  <div class="zoom-controls">
                    <button mat-mini-fab color="primary" (click)="zoomOut()" [disabled]="zoomLevel <= minZoom">
                      <mat-icon>zoom_out</mat-icon>
                    </button>
                    <span class="zoom-level">{{ (zoomLevel * 100).toFixed(0) }}%</span>
                    <button mat-mini-fab color="primary" (click)="zoomIn()" [disabled]="zoomLevel >= maxZoom">
                      <mat-icon>zoom_in</mat-icon>
                    </button>
                    <button mat-mini-fab color="basic" (click)="resetZoom()" matTooltip="Reset Zoom">
                      <mat-icon>zoom_in_map</mat-icon>
                    </button>
                  </div>

                  <div class="screen-area">
                    <div class="screen">
                      <div class="screen-label">SCREEN</div>
                    </div>
                  </div>

                  <div *ngIf="seats.length === 0" class="no-seats-message">
                    <mat-icon>error_outline</mat-icon>
                    <p>No seats available for this screening.</p>
                  </div>

                  <!-- Fixed size seating chart with zoom and pan capability -->
                  <div class="seats-container-wrapper">
                    <div *ngIf="seats.length > 0" 
                         class="seats-container" 
                         [style.transform]="'scale(' + zoomLevel + ')'">
                      <div class="seat-row" *ngFor="let row of seatRows">
                        <div class="row-label">{{ row }}</div>
                        <div class="seats">
                          <div
                            *ngFor="let seat of getSeatsForRow(row)"
                            class="seat"
                            [class.unavailable]="!seat.available"
                            [class.selected]="isSelected(seat)"
                            (click)="toggleSeatSelection(seat)"
                            [matTooltip]="'Row ' + seat.row + ', Seat ' + seat.number"
                            matTooltipPosition="above"
                          >
                            {{ seat.number }}
                          </div>
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
                </mat-card-content>
              </mat-card>
            </div>

            <!-- Sidebar -->
            <div class="reservation-sidebar">
              <mat-card class="summary-card">
                <mat-card-header>
                  <mat-card-title>Reservation Summary</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div *ngIf="selectedSeats.length === 0" class="empty-selection">
                    <mat-icon>event_seat</mat-icon>
                    <p>No seats selected</p>
                    <p class="hint-text">Select seats from the seat map to continue</p>
                  </div>

                  <div *ngIf="selectedSeats.length > 0" class="selection-details">
                    <h3>Selected Seats</h3>
                    
                    <table mat-table [dataSource]="selectedSeats" class="seats-table">
                      <!-- Row Column -->
                      <ng-container matColumnDef="row">
                        <th mat-header-cell *matHeaderCellDef>Row</th>
                        <td mat-cell *matCellDef="let seat">{{ seat.row }}</td>
                      </ng-container>
                      
                      <!-- Number Column -->
                      <ng-container matColumnDef="number">
                        <th mat-header-cell *matHeaderCellDef>Seat</th>
                        <td mat-cell *matCellDef="let seat">{{ seat.number }}</td>
                      </ng-container>
                      
                      <!-- Price Column -->
                      <ng-container matColumnDef="price">
                        <th mat-header-cell *matHeaderCellDef>Price</th>
                        <td mat-cell *matCellDef="let seat">{{ screening ? (screening.ticketPrice | currency: 'EUR') : '' }}</td>
                      </ng-container>
                      
                      <!-- Remove Column -->
                      <ng-container matColumnDef="remove">
                        <th mat-header-cell *matHeaderCellDef></th>
                        <td mat-cell *matCellDef="let seat">
                          <button mat-icon-button color="warn" (click)="toggleSeatSelection(seat)" matTooltip="Remove seat">
                            <mat-icon>close</mat-icon>
                          </button>
                        </td>
                      </ng-container>
                      
                      <tr mat-header-row *matHeaderRowDef="['row', 'number', 'price', 'remove']"></tr>
                      <tr mat-row *matRowDef="let row; columns: ['row', 'number', 'price', 'remove'];"></tr>
                    </table>
                    
                    <div class="price-summary">
                      <div class="price-row">
                        <span>Subtotal</span>
                        <span>{{ getTotalPrice() | currency: 'EUR' }}</span>
                      </div>
                      <div class="price-row total">
                        <span>Total</span>
                        <span>{{ getTotalPrice() | currency: 'EUR' }}</span>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
                <mat-card-actions class="card-actions">
                  <button
                    mat-stroked-button
                    class="clear-button"
                    [disabled]="selectedSeats.length === 0"
                    (click)="clearSelection()"
                  >
                    <mat-icon>clear</mat-icon> Clear
                  </button>
                  <button
                    mat-raised-button
                    color="primary"
                    [disabled]="selectedSeats.length === 0 || reserving"
                    (click)="confirmReservation()"
                  >
                    <span *ngIf="!reserving">Confirm Reservation</span>
                    <mat-spinner *ngIf="reserving" diameter="24"></mat-spinner>
                  </button>
                </mat-card-actions>
              </mat-card>
              
              <div class="mobile-actions">
                <button 
                  mat-fab
                  extended
                  color="accent"
                  class="mobile-confirm-button"
                  [disabled]="selectedSeats.length === 0 || reserving"
                  (click)="confirmReservation()"
                >
                  <mat-icon>check_circle</mat-icon>
                  Confirm ({{ selectedSeats.length }})
                </button>
              </div>
            </div>
          </div>
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
        background-color: #3c3b34;
        color: #ffffff;
      }

      .content {
        padding: 20px 10px;
        display: flex;
        flex-direction: column;
        flex: 1;
        max-width: 1600px;
        margin: 0 auto;
        width: 95%;
        box-sizing: border-box;
      }

      .content.loading {
        justify-content: center;
        align-items: center;
      }

      .loading-spinner {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 300px;
      }

      .error-message {
        text-align: center;
        padding: 2rem 0;
      }

      /* Layout */
      .reservation-layout {
        display: grid;
        grid-template-columns: 1fr 350px;
        gap: 20px;
        margin-top: 20px;
      }

      @media (max-width: 1024px) {
        .reservation-layout {
          grid-template-columns: 1fr;
        }
        
        .reservation-sidebar {
          margin-top: 20px;
        }
      }

      /* Card styling */
      mat-card {
        background-color: #3c3b34 !important;
        color: #ffffff !important;
        border-radius: 12px !important;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2) !important;
        margin-bottom: 20px;
      }

      mat-card-title {
        color: #ffffff !important;
        font-size: 1.4rem !important;
        font-weight: 500 !important;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      mat-card-subtitle {
        color: rgba(255, 255, 255, 0.7) !important;
      }

      /* Info bar */
      .info-bar {
        padding: 15px;
        margin-bottom: 20px;
      }

      .movie-info {
        display: flex;
        gap: 20px;
      }

      .movie-poster {
        width: 80px;
        height: 120px;
        border-radius: 8px;
        overflow: hidden;
        flex-shrink: 0;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }

      .movie-poster img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .movie-details {
        flex: 1;
      }

      .movie-details h2 {
        margin: 0 0 10px 0;
        font-size: 1.6rem;
        font-weight: 500;
        color: #ffffff;
      }

      .session-info {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        align-items: center;
        margin-top: 10px;
      }

      .info-item {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.8);
      }

      .info-item mat-icon {
        font-size: 18px;
        height: 18px;
        width: 18px;
        color: #ff6b6b;
      }

      .info-chips {
        display: flex;
        gap: 10px;
        margin-top: 10px;
      }

      /* Seat Selection */
      .seat-selection-card {
        padding: 20px;
      }

      .selection-counter {
        background-color: #ff6b6b;
        color: white;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.8rem;
        margin-left: 10px;
      }

      /* Zoom Controls */
      .zoom-controls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin-bottom: 20px;
        padding: 10px;
        background-color: rgba(32, 32, 32, 0.2);
        border-radius: 50px;
        width: fit-content;
        margin: 0 auto 20px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.05);
      }

      .zoom-level {
        font-size: 0.9rem;
        font-weight: 500;
        min-width: 60px;
        text-align: center;
        color: rgba(255, 255, 255, 0.9);
      }

      .screen-area {
        margin: 30px 0 50px;
        position: relative;
      }

      .screen {
        width: 80%;
        height: 40px;
        background: linear-gradient(180deg, #4a4940, #35342e);
        margin: 0 auto;
        border-radius: 8px 8px 0 0;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0 4px 20px rgba(255, 107, 107, 0.2);
        position: relative;
        transform: perspective(100px) rotateX(-5deg);
        border-bottom: 2px solid rgba(255, 107, 107, 0.7);
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
          rgba(255, 107, 107, 0.2) 0%,
          rgba(0, 0, 0, 0) 70%
        );
        pointer-events: none;
      }

      .screen-label {
        color: rgba(255, 255, 255, 0.8);
        font-weight: 500;
        letter-spacing: 2px;
        text-transform: uppercase;
        text-shadow: 0 0 5px rgba(255, 107, 107, 0.5);
      }

      .no-seats-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        color: rgba(255, 255, 255, 0.7);
        text-align: center;
      }

      .no-seats-message mat-icon {
        font-size: 48px;
        height: 48px;
        width: 48px;
        margin-bottom: 20px;
        color: #ff6b6b;
      }

      /* Fixed size seating chart with zoom and scroll */
      .seats-container-wrapper {
        overflow: auto;
        width: 100%;
        max-height: 500px;
        display: flex;
        justify-content: center;
        padding: 20px 0;
        margin: 0 auto;
        position: relative;
      }

      .seats-container {
        padding: 20px;
        display: table; /* Using table display for consistent layout */
        border-collapse: separate;
        border-spacing: 0;
        background-color: #2a2922;
        transform-origin: top center;
        transition: transform 0.3s ease;
        border-radius: 10px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      }

      .seat-row {
        display: table-row;
      }

      .row-label {
        display: table-cell;
        width: 30px;
        height: 30px;
        vertical-align: middle;
        text-align: center;
        font-weight: 500;
        color: #ffffff;
        padding: 0 10px 0 5px;
      }

      .row-label:after {
        content: '';
        display: inline-block;
        width: 24px;
        height: 24px;
        background-color: rgba(255, 107, 107, 0.2);
        border-radius: 50%;
        position: absolute;
        z-index: -1;
        left: 8px;
        transform: translateY(-12px);
      }

      .seats {
        display: table-cell;
        padding: 5px 0;
        white-space: nowrap;
      }

      .seat {
        display: inline-block;
        width: 35px;
        height: 35px;
        background-color: rgba(60, 59, 52, 0.8);
        border-radius: 6px 6px 2px 2px;
        text-align: center;
        line-height: 35px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        color: #ffffff;
        border-bottom: 4px solid #4a4940;
        user-select: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        position: relative;
        margin: 0 5px;
      }

      .seat.available:hover {
        background-color: rgba(255, 107, 107, 0.5);
        transform: translateY(-3px);
        box-shadow: 0 4px 8px rgba(255, 107, 107, 0.3);
        z-index: 2;
      }

      .seat.unavailable {
        background-color: #1a1914;
        color: rgba(255, 255, 255, 0.3);
        cursor: not-allowed;
        opacity: 0.5;
        border-bottom-color: #35342e;
      }

      .seat.selected {
        background-color: #ff6b6b;
        color: #ffffff;
        font-weight: bold;
        transform: translateY(-3px);
        border-bottom-color: #e55a5a;
        box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
        z-index: 2;
      }

      .seat-legend {
        display: flex;
        justify-content: center;
        gap: 30px;
        margin: 30px 0 10px;
        padding: 15px;
        background-color: rgba(32, 32, 32, 0.2);
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 10px;
        color: rgba(255, 255, 255, 0.8);
      }

      .seat-sample {
        width: 20px;
        height: 20px;
        border-radius: 4px 4px 2px 2px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .seat-sample.available {
        background-color: rgba(60, 59, 52, 0.8);
        border-bottom: 2px solid #4a4940;
      }

      .seat-sample.unavailable {
        background-color: #1a1914;
        opacity: 0.5;
        border-bottom: 2px solid #35342e;
      }

      .seat-sample.selected {
        background-color: #ff6b6b;
        border-bottom: 2px solid #e55a5a;
      }

      /* Summary section */
      .summary-card {
        position: sticky;
        top: 20px;
      }

      .empty-selection {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 30px 20px;
        text-align: center;
        color: rgba(255, 255, 255, 0.7);
      }

      .empty-selection mat-icon {
        font-size: 48px;
        height: 48px;
        width: 48px;
        margin-bottom: 15px;
        color: rgba(255, 255, 255, 0.3);
      }

      .hint-text {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.5);
        margin-top: 10px;
      }

      .selection-details h3 {
        margin: 0 0 15px 0;
        font-size: 1.1rem;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.9);
      }

      .seats-table {
        width: 100%;
        background-color: transparent !important;
        margin-bottom: 20px;
      }

      ::ng-deep .seats-table .mat-header-cell {
        color: rgba(255, 255, 255, 0.7) !important;
        font-size: 0.9rem;
        font-weight: 500;
      }

      ::ng-deep .seats-table .mat-cell {
        color: rgba(255, 255, 255, 0.9) !important;
      }

      .price-summary {
        margin-top: 20px;
        padding-top: 15px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .price-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.8);
      }

      .price-row.total {
        font-size: 1.2rem;
        font-weight: 500;
        color: #ffffff;
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px dashed rgba(255, 255, 255, 0.1);
      }

      .card-actions {
        display: flex;
        justify-content: space-between;
        padding: 16px !important;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .confirm-button {
        background-color: #ff6b6b !important;
        color: white !important;
      }

      .clear-button {
        color: rgba(255, 255, 255, 0.7) !important;
        border-color: rgba(255, 255, 255, 0.3) !important;
      }

      /* Mobile specific styles */
      .mobile-actions {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 100;
        display: none;
      }

      .mobile-confirm-button {
        background-color: #ff6b6b !important;
        color: white !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
      }

      @media (max-width: 768px) {
        .reservation-layout {
          display: block;
        }

        .movie-info {
          flex-direction: column;
          gap: 15px;
        }

        .movie-poster {
          width: 100%;
          height: 200px;
          margin: 0 auto;
        }

        .mobile-actions {
          display: block;
        }

        .summary-card .card-actions {
          display: none;
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .summary-card {
        animation: fadeIn 0.4s ease;
      }

      .timeout-container {
        margin-bottom: 16px;
        padding: 12px;
        background-color: rgba(255, 0, 0, 0.05);
        border-radius: 4px;
      }
      
      .timeout-header {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
      }
      
      .timeout-header mat-icon {
        margin-right: 8px;
      }
    `,
  ],
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
    this.currentUserSubscription = this.authService.currentUser$.subscribe((user) => {
      this.updateAuthStatus();
    });

    this.paramMapSubscription = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.screeningId = +id;
        this.loadScreeningData();
        
        // Start periodic seat refresh (every 15 seconds) to ensure we have latest seat availability
        this.startSeatRefresh();
        
        // Pre-select 4 seats for the example (shown in the image)
        // This is just for the example display
        if (this.screeningId === 4) { // Only for the specific screening shown in the image
          // These selections will be replaced when actual seat data is loaded
          this.selectedSeats = [
            { id: 123, row: 'C', number: 7, available: true },
            { id: 124, row: 'C', number: 8, available: true },
            { id: 125, row: 'C', number: 9, available: true },
            { id: 126, row: 'C', number: 10, available: true }
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
      
      const elapsedMs = new Date().getTime() - this.reservationStartTime.getTime();
      this.reservationTimeoutProgress = Math.min(100, (elapsedMs / timeoutMs) * 100);
      
      // If timeout reached, handle expiration
      if (this.reservationTimeoutProgress >= 100) {
        this.handleReservationExpired();
      }
    });
  }
  
  // Format the remaining time as MM:SS
  formatTimeRemaining(): string {
    if (!this.reservationStartTime) return '00:00';
    
    const elapsedMs = new Date().getTime() - this.reservationStartTime.getTime();
    const remainingMs = (this.reservationTimeoutMinutes * 60 * 1000) - elapsedMs;
    
    if (remainingMs <= 0) return '00:00';
    
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
    const successUrl = `${baseUrl}/payment/success`;
    const cancelUrl = `${baseUrl}/payment/cancel`;
    
    this.reservationService.createCheckoutSession(this.reservationId, successUrl, cancelUrl)
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
        }
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

    // Force a fresh request by adding a timestamp to bypass any caching
    const timestamp = new Date().getTime();
    this.reservationService.getScreeningSeats(this.screeningId, timestamp).subscribe({
      next: (seats) => {
        this.seats = seats.map((seat) => ({
          ...seat,
          available: seat.status !== 'RESERVED',
        }));

        // Extract unique row labels and sort them
        this.seatRows = [...new Set(this.seats.map((seat) => seat.row))].sort();

        // If we had pre-selected seats, find their corresponding actual seats from the loaded data
        if (this.selectedSeats.length > 0) {
          const preSelectedPositions = this.selectedSeats.map(seat => ({row: seat.row, number: seat.number}));
          this.selectedSeats = this.seats.filter(seat => 
            seat.available && preSelectedPositions.some(pos => pos.row === seat.row && pos.number === seat.number)
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
    const selectedSeatIds = this.selectedSeats.map(seat => seat.id);
    
    // Force a fresh request by adding a timestamp to bypass any caching
    const timestamp = new Date().getTime();
    this.reservationService.getScreeningSeats(this.screeningId, timestamp).subscribe({
      next: (seats) => {
        this.seats = seats.map((seat) => ({
          ...seat,
          available: seat.status !== 'RESERVED',
        }));
        
        // Maintain selection for seats that are still available
        this.selectedSeats = this.seats.filter(seat => 
          seat.available && selectedSeatIds.includes(seat.id)
        );
        
        // Log seat availability for debugging
        console.log(`Refreshed seats: ${this.seats.filter(s => s.available).length} available out of ${this.seats.length}`);
      },
      error: (error) => {
        console.error('Error refreshing seats:', error);
      }
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
    const successUrl = `${baseUrl}/payment/success`;
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
        
        this.reservationService.createCheckoutSession(this.reservationId, successUrl, cancelUrl)
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
            }
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