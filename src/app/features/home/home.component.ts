import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import {
  ScreeningService,
  ScreeningTimeDTO,
  ScreeningTimeSlot,
} from '../../core/services/screening.service';
import { MovieService } from '../../core/services/movie.service';
import { Screening } from '../../core/models/screening.model';
import { Movie } from '../../core/models/movie.model';
import {
  MovieWithScreenings,
  ScreeningTime,
} from '../../core/models/movie-screening.model';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterLink,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatBadgeModule,
    MatTabsModule,
    NavbarComponent,
  ],
  template: `
    <div class="home-container">
      <app-navbar></app-navbar>

      <div class="content">
        <div class="welcome-section">
          <!-- Featured Movies Carousel -->
          <div class="carousel-section">
            <!-- Loading spinner -->
            <div *ngIf="loadingFeaturedMovies" class="loading-spinner">
              <mat-spinner></mat-spinner>
            </div>

            <!-- Carousel -->
            <div
              *ngIf="!loadingFeaturedMovies && featuredMovies.length > 0"
              class="carousel-container"
              #carousel
            >
              <div class="carousel-slides">
                <div
                  *ngFor="let movie of featuredMovies; let i = index"
                  class="carousel-slide"
                  [class.active]="i === currentSlide"
                  (click)="navigateToMovieDetail(movie.id!)"
                >
                  <div
                    class="carousel-backdrop"
                    [style.background-image]="'url(' + movie.backdropUrl + ')'"
                  >
                    <div class="movie-info-overlay">
                      <h2 class="movie-title">{{ movie.title }}</h2>
                      <div class="movie-details">
                        <span *ngIf="movie.durationMinutes" class="duration">
                          <mat-icon>schedule</mat-icon>
                          {{ movie.durationMinutes }} min
                        </span>
                        <span *ngIf="movie.rating" class="rating">
                          <mat-icon>star</mat-icon> {{ movie.rating }}
                        </span>
                      </div>
                      <div
                        *ngIf="movie.genres && movie.genres.length > 0"
                        class="genres"
                      >
                        {{ getGenresList(movie) }}
                      </div>
                      <p *ngIf="movie.description" class="description">
                        {{ movie.description | slice : 0 : 150
                        }}{{ movie.description.length > 150 ? '...' : '' }}
                      </p>
                      <button
                        mat-raised-button
                        color="accent"
                        (click)="
                          navigateToMovieDetail(movie.id!);
                          $event.stopPropagation()
                        "
                      >
                        View Screenings
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Carousel controls -->
              <div class="carousel-controls">
                <div class="carousel-indicators">
                  <span
                    *ngFor="let movie of featuredMovies; let i = index"
                    class="indicator"
                    [class.active]="i === currentSlide"
                    (click)="goToSlide(i); $event.stopPropagation()"
                  ></span>
                </div>
              </div>

              <!-- Side navigation arrows -->
              <button
                mat-fab
                class="nav-arrow left-arrow"
                (click)="prevSlide(); $event.stopPropagation()"
              >
                <mat-icon>chevron_left</mat-icon>
              </button>
              <button
                mat-fab
                class="nav-arrow right-arrow"
                (click)="nextSlide(); $event.stopPropagation()"
              >
                <mat-icon>chevron_right</mat-icon>
              </button>
            </div>

            <!-- No movies message -->
            <div
              *ngIf="!loadingFeaturedMovies && featuredMovies.length === 0"
              class="no-data"
            >
              <p>No featured movies available. Please check again later.</p>
            </div>
          </div>

          <!-- Calendar section -->
          <div class="calendar-section">
            <h1 class="section-title">Screenings Calendar</h1>

            <!-- Loading spinner -->
            <div *ngIf="loading" class="loading-spinner">
              <mat-spinner></mat-spinner>
            </div>

            <!-- No dates message -->
            <div *ngIf="!loading && allDates.length === 0" class="no-data">
              <p>Calendar could not be loaded. Please check again later.</p>
            </div>

            <!-- Date selection -->
            <div *ngIf="!loading && allDates.length > 0" class="date-selection">
              <h3 class="date-selection-title">
                Select a date to view screenings
              </h3>
              <div class="horizontal-calendar">
                <button
                  mat-icon-button
                  class="scroll-button left"
                  (click)="scrollDates('left')"
                  [disabled]="!canScrollLeft"
                >
                  <mat-icon>chevron_left</mat-icon>
                </button>

                <div class="dates-container" #datesContainer>
                  <div
                    *ngFor="let date of allDates"
                    class="calendar-date"
                    [class.active]="isSelectedDate(date)"
                    [class.has-screenings]="hasScreeningsForDate(date)"
                    (click)="onDateSelected(date)"
                  >
                    <div class="weekday">{{ getWeekday(date) }}</div>
                    <div class="date-number">{{ getDateNumber(date) }}</div>
                    <div class="month">{{ getMonth(date) }}</div>
                  </div>
                </div>

                <button
                  mat-icon-button
                  class="scroll-button right"
                  (click)="scrollDates('right')"
                  [disabled]="!canScrollRight"
                >
                  <mat-icon>chevron_right</mat-icon>
                </button>
              </div>
            </div>

            <!-- Selected date screenings -->
            <div
              *ngIf="selectedDate && !loadingScreenings"
              class="screenings-for-date"
            >
              <h2 class="date-heading">
                Screenings for {{ selectedDate | date : 'EEEE, MMMM d, y' }}
              </h2>

              <!-- No screenings message -->
              <div *ngIf="moviesWithScreenings.length === 0" class="no-data">
                <p>No screenings available for this date.</p>
              </div>

              <!-- Movies with screenings -->
              <div
                *ngIf="moviesWithScreenings.length > 0"
                class="movies-container"
              >
                <mat-card
                  *ngFor="let item of moviesWithScreenings"
                  class="movie-screening-card"
                >
                  <div class="movie-screening-info">
                    <div class="movie-poster" *ngIf="item.movie.posterUrl">
                      <img
                        [src]="item.movie.posterUrl"
                        [alt]="item.movie.title + ' poster'"
                        class="movie-poster-img"
                      />
                    </div>
                    <div class="movie-details">
                      <h3 class="movie-title">{{ item.movie.title }}</h3>
                      <div class="movie-meta">
                        <span
                          *ngIf="item.movie.durationMinutes"
                          class="movie-duration"
                        >
                          <mat-icon>schedule</mat-icon>
                          {{ item.movie.durationMinutes }} min
                        </span>
                        <span *ngIf="item.movie.rating" class="movie-rating">
                          <mat-icon>star</mat-icon> {{ item.movie.rating }}
                        </span>
                      </div>
                      <div
                        *ngIf="
                          item.movie.genres && item.movie.genres.length > 0
                        "
                        class="movie-genres"
                      >
                        {{ getGenresList(item.movie) }}
                      </div>
                      <a
                        mat-button
                        color="accent"
                        [routerLink]="['/movies', item.movie.id]"
                      >
                        <mat-icon>info</mat-icon> Movie Details
                      </a>
                    </div>
                  </div>

                  <div class="screening-times">
                    <h4>Available Times</h4>
                    <div class="time-buttons">
                      <button
                        *ngFor="let screening of item.screeningTimes"
                        mat-stroked-button
                        [routerLink]="
                          isLoggedIn
                            ? ['/reserve', screening.screeningId]
                            : ['/login']
                        "
                        [queryParams]="
                          !isLoggedIn
                            ? { returnUrl: '/reserve/' + screening.screeningId }
                            : null
                        "
                        class="time-button"
                      >
                        <div class="time-display">
                          <span class="time">{{ screening.time }}</span>
                          <span class="format-tags">
                            {{ screening.format }}
                            <span *ngIf="screening.is3D" class="tag">3D</span>
                            <span *ngIf="screening.hasSubtitles" class="tag"
                              >SUB</span
                            >
                          </span>
                        </div>
                        <div class="room-number">
                          Room {{ screening.roomNumber }}
                        </div>
                      </button>
                    </div>
                  </div>
                </mat-card>
              </div>
            </div>

            <!-- Loading screenings spinner -->
            <div *ngIf="loadingScreenings" class="loading-spinner">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .home-container {
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
        gap: 30px;
      }

      /* Carousel styles */
      .carousel-section {
        margin-bottom: 20px;
      }

      .carousel-container {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        margin-bottom: 20px;
        height: 500px;
        cursor: pointer;
      }

      /* Side navigation arrows */
      .nav-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 10;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
      }

      .left-arrow {
        left: 20px;
      }

      .right-arrow {
        right: 20px;
      }

      .nav-arrow:hover {
        background-color: rgba(0, 176, 32, 0.8);
      }

      .carousel-slides {
        height: 100%;
        position: relative;
      }

      .carousel-slide {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        transition: opacity 0.6s ease-in-out;
        z-index: 0;
        visibility: hidden;
      }

      .carousel-slide.active {
        opacity: 1;
        z-index: 1;
        visibility: visible;
      }

      .carousel-backdrop {
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
        position: relative;
      }

      .movie-info-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 40px 30px 30px;
        color: white;
        background: linear-gradient(
          to top,
          rgba(0, 0, 0, 0.9) 0%,
          rgba(0, 0, 0, 0.6) 60%,
          transparent 100%
        );
      }

      .movie-info-overlay .movie-title {
        font-size: 32px;
        margin-bottom: 15px;
        text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
        color: #ffffff;
      }

      .movie-info-overlay .movie-details {
        display: flex;
        gap: 20px;
        margin-bottom: 10px;
      }

      .movie-info-overlay .duration,
      .movie-info-overlay .rating {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 15px;
        color: rgba(255, 255, 255, 0.9);
      }

      .movie-info-overlay .duration mat-icon,
      .movie-info-overlay .rating mat-icon {
        color: rgba(255, 255, 255, 0.9);
      }

      .movie-info-overlay .genres {
        font-size: 15px;
        margin-bottom: 10px;
        color: rgba(255, 255, 255, 0.85);
      }

      .movie-info-overlay .description {
        margin-bottom: 20px;
        font-size: 16px;
        max-width: 70%;
        line-height: 1.4;
        text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
        color: rgba(255, 255, 255, 0.9);
      }

      .carousel-controls {
        position: absolute;
        bottom: 15px;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .carousel-indicators {
        display: flex;
        gap: 10px;
      }

      .indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.5);
        cursor: pointer;
        transition: background-color 0.3s;
      }

      .indicator.active {
        background-color: #00b020;
      }

      .section-title {
        margin-top: 30px;
        margin-bottom: 20px;
        font-size: 28px;
        color: #ffffff;
      }

      .calendar-section {
        background-color: #282828;
        border-radius: 8px;
        padding: 20px;
        border: 1px solid #3a3a3a;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      }

      .loading-spinner {
        display: flex;
        justify-content: center;
        padding: 50px 0;
      }

      .no-data {
        text-align: center;
        padding: 30px;
        background-color: #252525;
        border-radius: 8px;
        color: #ffffff;
      }

      .date-selection {
        margin-bottom: 20px;
      }

      .date-selection-title {
        margin-bottom: 12px;
        font-size: 18px;
        font-weight: 500;
        color: #ffffff;
      }

      .horizontal-calendar {
        display: flex;
        align-items: center;
        position: relative;
        background-color: #303030;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        padding: 5px 0;
        border: 1px solid #3a3a3a;
      }

      .dates-container {
        display: flex;
        overflow-x: auto;
        scroll-behavior: smooth;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE and Edge */
        flex: 1;
        padding: 5px 0;
      }

      .dates-container::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
      }

      .calendar-date {
        min-width: 80px;
        height: 80px;
        border-radius: 8px;
        margin: 0 4px;
        padding: 10px 5px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        text-align: center;
        position: relative;
        color: #ffffff;
        background-color: #363636;
      }

      .calendar-date:hover {
        background-color: #424242;
      }

      .calendar-date.active {
        background-color: rgba(0, 176, 32, 0.7);
        color: white;
      }

      .calendar-date.has-screenings:after {
        content: '';
        position: absolute;
        bottom: 5px;
        left: 50%;
        transform: translateX(-50%);
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: rgba(0, 176, 32, 0.7);
      }

      .calendar-date.active.has-screenings:after {
        background-color: white;
      }

      .weekday {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 4px;
        color: #ffffff;
      }

      .date-number {
        font-size: 24px;
        font-weight: 700;
        line-height: 1;
        margin-bottom: 4px;
        color: #ffffff;
      }

      .month {
        font-size: 14px;
        color: #ffffff;
      }

      .scroll-button {
        background-color: #303030;
        z-index: 10;
        color: #ffffff;
      }

      .scroll-button.left {
        margin-left: 5px;
      }

      .scroll-button.right {
        margin-right: 5px;
      }

      .movies-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 15px;
      }

      .movie-screening-card {
        padding: 12px;
        margin-bottom: 0;
        height: 100%;
        display: flex;
        flex-direction: column;
        transition: transform 0.2s, box-shadow 0.2s;
        background-color: #2c2c2c;
        color: #ffffff;
        border: 1px solid #3a3a3a;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      .movie-screening-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        border-color: rgba(0, 176, 32, 0.6);
      }

      .movie-screening-info {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
      }

      .movie-poster {
        width: 100px;
        height: 150px;
        overflow: hidden;
        border-radius: 4px;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }

      .movie-poster-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .movie-details {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
        min-width: 0;
      }

      .movie-title {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #ffffff;
      }

      .movie-meta {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      .movie-duration,
      .movie-rating {
        display: flex;
        align-items: center;
        gap: 4px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 13px;
      }

      .movie-duration mat-icon,
      .movie-rating mat-icon {
        font-size: 14px;
        height: 14px;
        width: 14px;
        color: #00b020;
      }

      .movie-genres {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.9);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .screening-times {
        border-top: 1px solid #303030;
        padding-top: 12px;
        margin-top: auto;
      }

      .screening-times h4 {
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 15px;
        font-weight: 500;
        color: #ffffff;
      }

      .time-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .time-button {
        min-width: auto;
        padding: 4px 8px;
        height: auto;
        border-radius: 4px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background-color: rgba(48, 48, 48, 0.8);
        color: #ffffff;
      }

      .time-button:hover {
        background-color: rgba(0, 176, 32, 0.15);
        border-color: rgba(0, 176, 32, 0.3);
      }

      .time-display {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .time {
        font-size: 14px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.9);
      }

      .format-tags {
        font-size: 11px;
        display: flex;
        gap: 4px;
        align-items: center;
        color: rgba(255, 255, 255, 0.7);
      }

      .tag {
        display: inline-block;
        padding: 1px 3px;
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        font-size: 10px;
        font-weight: 500;
      }

      .room-number {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.6);
        margin-top: 2px;
      }

      .date-heading {
        margin-bottom: 15px;
        font-size: 20px;
        font-weight: 500;
        color: #ffffff;
      }

      /* Calendar specific styles */
      ::ng-deep .mat-calendar-body-cell.date-with-screenings {
        position: relative;
      }

      ::ng-deep .mat-calendar-body-cell.date-with-screenings::after {
        content: '';
        position: absolute;
        bottom: 2px;
        left: 50%;
        transform: translateX(-50%);
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #00b020;
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .carousel-container {
          height: 400px;
        }

        .movie-info-overlay .description {
          max-width: 100%;
        }

        .nav-arrow {
          transform: translateY(-50%) scale(0.8);
        }

        .left-arrow {
          left: 10px;
        }

        .right-arrow {
          right: 10px;
        }

        .date-selection {
          flex-direction: column;
        }

        .movies-container {
          grid-template-columns: 1fr;
        }

        .movie-screening-info {
          flex-direction: row;
        }

        .poster-container {
          width: 80px;
          height: 120px;
        }
      }

      @media (max-width: 480px) {
        .carousel-container {
          height: 350px;
        }

        .nav-arrow {
          transform: translateY(-50%) scale(0.7);
        }

        .left-arrow {
          left: 5px;
        }

        .right-arrow {
          right: 5px;
        }

        .movie-info-overlay .movie-title {
          font-size: 24px;
        }

        .movie-info-overlay .description {
          font-size: 14px;
        }
      }
    `,
  ],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  isLoggedIn = false;
  loading = true;
  loadingScreenings = false;

  // Featured movies carousel
  featuredMovies: Movie[] = [];
  loadingFeaturedMovies = true;
  currentSlide = 0;
  autoSlideInterval: any;

  // Calendar related properties
  selectedDate: Date | null = new Date();
  availableDates: Date[] = []; // Dates with screenings
  allDates: Date[] = []; // All dates for the calendar (30 days)

  // Movies and screenings
  moviesWithScreenings: MovieWithScreenings[] = [];

  // For horizontal calendar scrolling
  canScrollLeft = false;
  canScrollRight = true;
  @ViewChild('datesContainer') datesContainer!: ElementRef;
  @ViewChild('carousel') carousel!: ElementRef;

  private subscriptions = new Subscription();

  constructor(
    private screeningService: ScreeningService,
    private movieService: MovieService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is logged in
    this.isLoggedIn = this.authService.isLoggedIn();

    // Subscribe to auth changes
    this.subscriptions.add(
      this.authService.currentUser$.subscribe((user) => {
        this.isLoggedIn = this.authService.isLoggedIn();
      })
    );

    // Load featured movies
    this.loadFeaturedMovies();

    // Load available dates
    this.loadAvailableDates();

    // Set auto slide for carousel
    this.startAutoSlide();
  }

  ngAfterViewInit(): void {
    // Initialize scroll buttons state after view is ready
    setTimeout(() => {
      // Add scroll event listener to update button states when scrolling
      if (this.datesContainer) {
        this.datesContainer.nativeElement.addEventListener('scroll', () => {
          this.updateScrollButtonsState();
        });

        // Initial update of scroll buttons
        this.updateScrollButtonsState();

        // Scroll to selected date if it exists
        this.scrollToSelectedDate();
      }
    }, 300); // Longer timeout to ensure dates are fully rendered
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.unsubscribe();

    // Remove scroll event listener
    if (this.datesContainer) {
      this.datesContainer.nativeElement.removeEventListener(
        'scroll',
        this.updateScrollButtonsState
      );
    }

    // Clear auto slide interval
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  loadAvailableDates(): void {
    this.loading = true;

    // Generate an array of all dates for the next 30 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate all dates for the next 30 days
    this.allDates = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });

    // Format dates for API calls to check which ones have screenings
    const datesToCheck = this.allDates.map((date) =>
      this.formatDateForApi(date)
    );

    // Use forkJoin to make multiple API calls in parallel
    const requests = datesToCheck.map((dateStr) =>
      this.screeningService.getScreeningsByDate(dateStr).pipe(
        catchError((error) => {
          console.error(`Error loading screenings for ${dateStr}:`, error);
          return of([]);
        })
      )
    );

    forkJoin(requests).subscribe((results) => {
      // Process results to identify dates with screenings
      this.availableDates = [];

      results.forEach((screenings, index) => {
        if (screenings && screenings.length > 0) {
          // Verify screenings are actually on this date in local time
          const dateToCheck = this.allDates[index];
          const hasScreeningsOnDate = screenings.some((screening) => {
            if (!screening.startTime) return false;
            const screeningDate = new Date(screening.startTime);
            return this.isSameDay(screeningDate, dateToCheck);
          });

          if (hasScreeningsOnDate) {
            this.availableDates.push(dateToCheck);
          }
        }
      });

      // Set the selected date to today or first date
      this.selectedDate = new Date(today);

      // Load screenings for the selected date
      this.loadScreeningsForDate(this.selectedDate);

      this.loading = false;
    });
  }

  loadScreeningsForDate(date: Date): void {
    this.selectedDate = date;
    this.loadingScreenings = true;
    this.moviesWithScreenings = [];

    const formattedDate = this.formatDateForApi(date);

    const subscription = this.screeningService
      .getScreeningsByDate(formattedDate)
      .subscribe({
        next: (screenings) => {
          if (screenings.length === 0) {
            this.moviesWithScreenings = [];
            this.loadingScreenings = false;
            return;
          }

          // Filter screenings to ensure they match the selected date in local time
          const filteredScreenings = screenings.filter((screening) => {
            if (!screening.startTime) return false;

            const screeningDate = new Date(screening.startTime);
            return this.isSameDay(screeningDate, date);
          });

          if (filteredScreenings.length === 0) {
            this.moviesWithScreenings = [];
            this.loadingScreenings = false;
            return;
          }

          // Group screenings by movieId
          const movieIds = [
            ...new Set(
              filteredScreenings
                .map((s) => s.movie?.id)
                .filter((id) => id !== undefined)
            ),
          ] as number[];

          // Create an array of observables for each movie
          const movieObservables = movieIds.map((movieId) =>
            this.movieService.getMovie(movieId).pipe(
              catchError((error) => {
                console.error(`Error loading movie ${movieId}:`, error);
                return of(null);
              })
            )
          );

          // Use forkJoin to wait for all movie requests to complete
          const movieSubscription = forkJoin(movieObservables).subscribe({
            next: (movies) => {
              // Filter out null movies
              const validMovies = movies.filter((m) => m !== null) as Movie[];

              // Create MovieWithScreenings objects
              this.moviesWithScreenings = validMovies.map((movie) => {
                const movieScreenings = filteredScreenings.filter(
                  (s) => s.movie?.id === movie.id
                );

                const screeningTimes: ScreeningTime[] = movieScreenings.map(
                  (s) => {
                    // Handle case where room is a number instead of an object
                    let roomNumber = 0;
                    
                    if (s.room !== null && typeof s.room === 'number') {
                      // If room is a number, use it directly
                      roomNumber = s.room;
                    } else if (s.room && s.room.number) {
                      // If room is an object with a number property
                      roomNumber = s.room.number;
                    } else if (s.roomId) {
                      // Fallback to roomId if available
                      roomNumber = s.roomId;
                    }
                    
                    return {
                      screeningId: s.id!,
                      time: this.formatTime(s.startTime),
                      format: s.format || 'Standard',
                      is3D: s.is3D || false,
                      hasSubtitles: s.hasSubtitles || false,
                      roomNumber: roomNumber,
                      ticketPrice: s.ticketPrice,
                    };
                  }
                );

                // Sort by time
                screeningTimes.sort((a, b) => a.time.localeCompare(b.time));

                return {
                  movie,
                  screeningTimes,
                };
              });

              this.loadingScreenings = false;
            },
            error: (error) => {
              console.error('Error loading movies:', error);
              this.loadingScreenings = false;
            },
          });

          this.subscriptions.add(movieSubscription);
        },
        error: (error) => {
          console.error('Error loading screenings for date:', error);
          this.snackBar.open(
            'Could not load screenings. Please try again later.',
            'Close',
            {
              duration: 5000,
            }
          );
          this.loadingScreenings = false;
        },
      });

    this.subscriptions.add(subscription);
  }

  onDateSelected(date: Date | null): void {
    if (date) {
      this.selectedDate = new Date(date);
      this.loadScreeningsForDate(this.selectedDate);

      // After loading new screenings, scroll to the selected date
      setTimeout(() => this.scrollToSelectedDate(), 100);
    }
  }

  isSelectedDate(date: Date): boolean {
    return this.selectedDate ? this.isSameDay(this.selectedDate, date) : false;
  }

  hasScreeningsForDate(date: Date): boolean {
    return this.availableDates.some((d) => this.isSameDay(d, date));
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  formatDate(date: Date): string {
    // Format date as "Weekday, Month Day" (e.g., "Mon, Jun 15")
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  }

  formatDateForApi(date: Date): string {
    // Format date as YYYY-MM-DD for API calls
    // Use the local date rather than UTC date to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatTime(timeString: string): string {
    // Format time from ISO string to 12-hour format (e.g., "7:30 PM")
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  getUniqueDatesFromScreenings(screenings: Screening[]): Date[] {
    const uniqueDates = new Set<string>();

    screenings.forEach((screening) => {
      if (screening.startTime) {
        // Create date from screening time and get local date
        const screeningDate = new Date(screening.startTime);
        const year = screeningDate.getFullYear();
        const month = String(screeningDate.getMonth() + 1).padStart(2, '0');
        const day = String(screeningDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        uniqueDates.add(dateStr);
      }
    });

    // Convert string dates to Date objects and sort
    return Array.from(uniqueDates)
      .map((dateStr) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
      })
      .sort((a, b) => a.getTime() - b.getTime());
  }

  getGenresList(movie: Movie): string {
    if (!movie.genres || movie.genres.length === 0) return '';
    return movie.genres.map((genre) => genre.name).join(', ');
  }

  scrollDates(direction: 'left' | 'right'): void {
    if (!this.datesContainer) return;

    const container = this.datesContainer.nativeElement;
    const scrollAmount = container.clientWidth * 0.75; // Scroll 75% of the visible width

    if (direction === 'left') {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }

    // Update scroll buttons state after scrolling
    setTimeout(() => this.updateScrollButtonsState(), 100);
  }

  updateScrollButtonsState(): void {
    if (!this.datesContainer) return;

    const container = this.datesContainer.nativeElement;

    // Can scroll left if not at the beginning
    this.canScrollLeft = container.scrollLeft > 0;

    // Can scroll right if not at the end
    this.canScrollRight =
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10;
  }

  getWeekday(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  getDateNumber(date: Date): string {
    return date.getDate().toString();
  }

  getMonth(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short' });
  }

  scrollToSelectedDate(): void {
    if (!this.datesContainer || !this.selectedDate) return;

    const container = this.datesContainer.nativeElement;
    const dateElements = container.querySelectorAll('.calendar-date');

    // Find the index of the selected date
    const selectedIndex = this.allDates.findIndex((date) =>
      this.isSameDay(date, this.selectedDate!)
    );

    if (selectedIndex >= 0 && dateElements[selectedIndex]) {
      // Calculate scroll position to center the selected date
      const dateElement = dateElements[selectedIndex];
      const scrollLeft =
        dateElement.offsetLeft -
        container.clientWidth / 2 +
        dateElement.clientWidth / 2;

      container.scrollLeft = Math.max(0, scrollLeft);
      this.updateScrollButtonsState();
    }
  }

  loadFeaturedMovies(): void {
    this.loadingFeaturedMovies = true;

    // Get all active screenings (these are screenings in the future)
    this.screeningService.getAllScreenings().subscribe({
      next: (screenings) => {
        // Filter future screenings (after current time)
        const now = new Date();
        const futureScreenings = screenings.filter((screening) => {
          const screeningTime = new Date(screening.startTime);
          return screeningTime > now;
        });

        // Get unique movie IDs from future screenings
        const movieIdsWithFutureScreenings = new Set<number>();
        futureScreenings.forEach((screening) => {
          if (screening.movie?.id) {
            movieIdsWithFutureScreenings.add(screening.movie.id);
          }
        });

        console.log(
          'Movies with future screenings:',
          movieIdsWithFutureScreenings.size
        );

        // Only proceed if we have movies with future screenings
        if (movieIdsWithFutureScreenings.size === 0) {
          this.loadingFeaturedMovies = false;
          return;
        }

        // Get all movies
        this.movieService.getAllMovies().subscribe({
          next: (movies) => {
            // Filter movies that have future screenings and backdrop images
            const moviesWithFutureScreenings = movies.filter(
              (movie) =>
                movie.backdropUrl && // Has backdrop image
                movie.id &&
                movieIdsWithFutureScreenings.has(movie.id) // Has future screenings
            );

            console.log(
              'Movies with backdrop and future screenings:',
              moviesWithFutureScreenings.length
            );

            if (moviesWithFutureScreenings.length > 0) {
              // Sort by rating if available
              const sortedMovies = moviesWithFutureScreenings.sort(
                (a, b) => (b.voteAverage || 0) - (a.voteAverage || 0)
              );

              // Limit to 5 movies for the carousel
              this.featuredMovies = sortedMovies.slice(0, 5);
              console.log('Featured movies:', this.featuredMovies.length);

              // Initialize the carousel with the first slide
              if (
                this.featuredMovies.length > 0 &&
                this.currentSlide >= this.featuredMovies.length
              ) {
                this.currentSlide = 0;
              }
            }

            this.loadingFeaturedMovies = false;
          },
          error: (error) => {
            console.error('Error loading movies:', error);
            this.loadingFeaturedMovies = false;
          },
        });
      },
      error: (error) => {
        console.error('Error loading screenings:', error);
        this.loadingFeaturedMovies = false;
      },
    });
  }

  startAutoSlide(): void {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Change slide every 5 seconds
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.featuredMovies.length;
  }

  prevSlide(): void {
    this.currentSlide =
      (this.currentSlide - 1 + this.featuredMovies.length) %
      this.featuredMovies.length;
  }

  navigateToMovieDetail(movieId: number): void {
    this.router.navigate(['/movies', movieId]);
  }
}
