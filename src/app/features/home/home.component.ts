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
  trigger,
  state,
  style,
  animate,
  transition,
  query,
  stagger,
  keyframes
} from '@angular/animations';
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
          <div class="carousel-section" @slideInUp>
            <!-- Loading spinner -->
            <div *ngIf="loadingFeaturedMovies" class="loading-spinner" @fadeInOut>
              <mat-spinner [diameter]="50" color="accent"></mat-spinner>
              <div class="loading-text">Loading featured movies...</div>
            </div>

            <!-- Carousel -->
            <div
              *ngIf="!loadingFeaturedMovies && featuredMovies.length > 0"
              class="carousel-container"
              #carousel
              @fadeInOut
            >
              <div class="carousel-slides" [@carouselAnimation]="currentSlide">
                <div
                  *ngFor="let movie of featuredMovies; let i = index"
                  class="carousel-slide"
                  [class.active]="i === currentSlide"
                  (click)="navigateToMovieDetail(movie.id!)"
                >
                  <div
                    class="carousel-backdrop"
                    [style.background-image]="'url(' + movie.backdropUrl + ')'"
                    @backdropAnimation
                  >
                    <div class="movie-info-overlay">
                      <h2 class="movie-title" @slideInRight>{{ movie.title }}</h2>
                      <button
                        mat-raised-button
                        class="buy-tickets-btn"
                        @slideInUp
                        (click)="navigateToMovieDetail(movie.id!); $event.stopPropagation()"
                      >
                        Buy Your Tickets
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
                    [@pulseAnimation]="i === currentSlide ? 'active' : 'inactive'"
                  ></span>
                </div>
              </div>

              <!-- Side navigation arrows -->
              <button
                mat-fab
                class="nav-arrow left-arrow"
                (click)="prevSlide(); $event.stopPropagation()"
                @fadeInOut
              >
                <mat-icon>chevron_left</mat-icon>
              </button>
              <button
                mat-fab
                class="nav-arrow right-arrow"
                (click)="nextSlide(); $event.stopPropagation()"
                @fadeInOut
              >
                <mat-icon>chevron_right</mat-icon>
              </button>
            </div>

            <!-- No movies message -->
            <div
              *ngIf="!loadingFeaturedMovies && featuredMovies.length === 0"
              class="no-data"
              @fadeInOut
            >
              <p>No featured movies available. Please check again later.</p>
            </div>
          </div>

          <!-- Calendar section -->
          <div class="calendar-section" @slideInUp>
            <h1 class="section-title" @slideInRight>
              <mat-icon class="section-icon">calendar_month</mat-icon>
              Screenings Calendar
            </h1>

            <!-- Loading spinner -->
            <div *ngIf="loading" class="loading-spinner" @fadeInOut>
              <mat-spinner [diameter]="50" color="accent"></mat-spinner>
              <div class="loading-text">Loading calendar...</div>
            </div>

            <!-- No dates message -->
            <div *ngIf="!loading && allDates.length === 0" class="no-data" @fadeInOut>
              <p>Calendar could not be loaded. Please check again later.</p>
            </div>

            <!-- Date selection -->
            <div *ngIf="!loading && allDates.length > 0" class="date-selection" @fadeInOut>
              <h3 class="date-selection-title" @slideInRight>
                <mat-icon>date_range</mat-icon> Select a date to view screenings
              </h3>
              <div class="horizontal-calendar">
                <button
                  mat-icon-button
                  class="scroll-button left"
                  (click)="scrollDates('left')"
                  [disabled]="!canScrollLeft"
                  @fadeInOut
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
                    @calendarDateAnimation
                    [@pulseAnimation]="isSelectedDate(date) ? 'active' : 'inactive'"
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
                  @fadeInOut
                >
                  <mat-icon>chevron_right</mat-icon>
                </button>
              </div>
            </div>

            <!-- Selected date screenings -->
            <div
              *ngIf="selectedDate && !loadingScreenings"
              class="screenings-for-date"
              @slideInUp
            >
              <h2 class="date-heading" @slideInRight>
                <mat-icon>movie</mat-icon> Screenings for {{ selectedDate | date : 'EEEE, MMMM d, yyyy' }}
              </h2>

              <!-- No screenings message -->
              <div *ngIf="moviesWithScreenings.length === 0" class="no-data" @fadeInOut>
                <p>No screenings available for this date.</p>
              </div>

              <!-- Movies with screenings -->
              <div
                *ngIf="moviesWithScreenings.length > 0"
                class="movies-container"
                [@staggerList]="moviesWithScreenings.length"
              >
                <mat-card
                  *ngFor="let item of moviesWithScreenings"
                  class="movie-screening-card"
                  @slideInUp
                >
                  <div class="card-accent-top"></div>
                  <div class="movie-screening-info">
                    <div class="movie-poster" *ngIf="item.movie.posterUrl">
                      <img
                        [src]="item.movie.posterUrl"
                        [alt]="item.movie.title + ' poster'"
                        class="movie-poster-img"
                        @fadeInOut
                      />
                    </div>
                    <div class="movie-details">
                      <h3 class="movie-title" @slideInRight>{{ item.movie.title }}</h3>
                      
                      <div class="movie-meta" @fadeInOut>
                        <span *ngIf="item.movie.durationMinutes" class="movie-duration">
                          <mat-icon>schedule</mat-icon>
                          {{ item.movie.durationMinutes }} min
                        </span>
                        <span *ngIf="item.movie.rating" class="movie-rating">
                          <mat-icon>star</mat-icon> {{ item.movie.rating }}
                        </span>
                      </div>
                      
                      <div *ngIf="item.movie.genres && item.movie.genres.length > 0" class="movie-genres" @fadeInOut>
                        {{ getGenresList(item.movie) }}
                      </div>
                    </div>
                  </div>

                  <div *ngFor="let screening of item.screeningTimes" class="screening-time-slot" @screeningTimeAnimation>
                    <a 
                      [routerLink]="isLoggedIn ? ['/reserve', screening.screeningId] : ['/login']"
                      [queryParams]="!isLoggedIn ? { returnUrl: '/reserve/' + screening.screeningId } : null"
                      class="screening-time-link"
                    >
                      <div class="time-info">
                        <span class="time-display">{{ screening.time }}</span>
                        <span class="room-display">Room {{ screening.roomNumber }}</span>
                        <div class="format-display">
                          <span>{{ screening.format }}</span>
                            <span *ngIf="screening.is3D" class="tag">3D</span>
                          <span *ngIf="screening.hasSubtitles" class="tag">SUB</span>
                        </div>
                        </div>
                    </a>
                  </div>
                </mat-card>
              </div>
            </div>

            <!-- Loading screenings spinner -->
            <div *ngIf="loadingScreenings" class="loading-spinner" @fadeInOut>
              <mat-spinner [diameter]="50" color="accent"></mat-spinner>
              <div class="loading-text">Loading screenings...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition('void => *', animate('300ms ease-in')),
      transition('* => void', animate('300ms ease-out')),
    ]),
    trigger('slideInRight', [
      state('void', style({ transform: 'translateX(-20px)', opacity: 0 })),
      state('*', style({ transform: 'translateX(0)', opacity: 1 })),
      transition('void => *', animate('400ms ease-out')),
    ]),
    trigger('slideInUp', [
      state('void', style({ transform: 'translateY(20px)', opacity: 0 })),
      state('*', style({ transform: 'translateY(0)', opacity: 1 })),
      transition('void => *', animate('400ms ease-out')),
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
    ]),
    trigger('calendarDateAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'scale(0.9)' }))
      ])
    ]),
    trigger('pulseAnimation', [
      state('active', style({ transform: 'scale(1)' })),
      transition('* => active', [
        animate('300ms ease-in-out', keyframes([
          style({ transform: 'scale(1)', offset: 0 }),
          style({ transform: 'scale(1.1)', offset: 0.5 }),
          style({ transform: 'scale(1)', offset: 1 })
        ]))
      ])
    ]),
    trigger('carouselAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0 }),
          stagger(100, [
            animate('600ms ease', style({ opacity: 1 }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('backdropAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(1.05)' }),
        animate('700ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('screeningTimeAnimation', [
      transition(':enter', [
        style({ opacity: 0, height: 0, overflow: 'hidden' }),
        animate('300ms ease-out', style({ opacity: 1, height: '*' }))
      ])
    ])
  ]
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

    // Show loading state for a minimum time to allow animations to be visible
    const loadingStartTime = new Date().getTime();
    const minimumLoadingTime = 600; // ms

    const formattedDate = this.formatDateForApi(date);

    const subscription = this.screeningService
      .getScreeningsByDate(formattedDate)
      .subscribe({
        next: (screenings) => {
          if (screenings.length === 0) {
            // Ensure minimum loading time for UI smoothness
            const currentTime = new Date().getTime();
            const elapsedTime = currentTime - loadingStartTime;
            
            if (elapsedTime < minimumLoadingTime) {
              setTimeout(() => {
            this.moviesWithScreenings = [];
            this.loadingScreenings = false;
              }, minimumLoadingTime - elapsedTime);
            } else {
              this.moviesWithScreenings = [];
              this.loadingScreenings = false;
            }
            return;
          }

          // Filter screenings to ensure they match the selected date in local time
          const filteredScreenings = screenings.filter((screening) => {
            if (!screening.startTime) return false;

            const screeningDate = new Date(screening.startTime);
            return this.isSameDay(screeningDate, date);
          });

          if (filteredScreenings.length === 0) {
            const currentTime = new Date().getTime();
            const elapsedTime = currentTime - loadingStartTime;
            
            if (elapsedTime < minimumLoadingTime) {
              setTimeout(() => {
            this.moviesWithScreenings = [];
            this.loadingScreenings = false;
              }, minimumLoadingTime - elapsedTime);
            } else {
              this.moviesWithScreenings = [];
              this.loadingScreenings = false;
            }
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

              // Ensure minimum loading time for UI smoothness
              const currentTime = new Date().getTime();
              const elapsedTime = currentTime - loadingStartTime;
              
              if (elapsedTime < minimumLoadingTime) {
                setTimeout(() => {
              this.loadingScreenings = false;
                }, minimumLoadingTime - elapsedTime);
              } else {
                this.loadingScreenings = false;
              }
            },
            error: (error) => {
              console.error('Error loading movies:', error);
              setTimeout(() => {
              this.loadingScreenings = false;
              }, Math.max(0, minimumLoadingTime - (new Date().getTime() - loadingStartTime)));
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
          setTimeout(() => {
          this.loadingScreenings = false;
          }, Math.max(0, minimumLoadingTime - (new Date().getTime() - loadingStartTime)));
        },
      });

    this.subscriptions.add(subscription);
  }

  onDateSelected(date: Date | null): void {
    if (date) {
      // If same date is selected, don't reload
      if (this.selectedDate && this.isSameDay(this.selectedDate, date)) {
        return;
      }
      
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

      // Use smooth scrolling for better UX
      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: 'smooth'
      });
      
      this.updateScrollButtonsState();
    }
  }

  loadFeaturedMovies(): void {
    this.loadingFeaturedMovies = true;
    
    // Show loading state for a minimum time to allow animations to be visible
    const loadingStartTime = new Date().getTime();
    const minimumLoadingTime = 800; // ms

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
          const currentTime = new Date().getTime();
          const elapsedTime = currentTime - loadingStartTime;
          
          if (elapsedTime < minimumLoadingTime) {
            setTimeout(() => {
          this.loadingFeaturedMovies = false;
            }, minimumLoadingTime - elapsedTime);
          } else {
            this.loadingFeaturedMovies = false;
          }
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

            // Ensure minimum loading time for UI smoothness
            const currentTime = new Date().getTime();
            const elapsedTime = currentTime - loadingStartTime;
            
            if (elapsedTime < minimumLoadingTime) {
              setTimeout(() => {
            this.loadingFeaturedMovies = false;
              }, minimumLoadingTime - elapsedTime);
            } else {
              this.loadingFeaturedMovies = false;
            }
          },
          error: (error) => {
            console.error('Error loading movies:', error);
            setTimeout(() => {
            this.loadingFeaturedMovies = false;
            }, Math.max(0, minimumLoadingTime - (new Date().getTime() - loadingStartTime)));
          },
        });
      },
      error: (error) => {
        console.error('Error loading screenings:', error);
        setTimeout(() => {
        this.loadingFeaturedMovies = false;
        }, Math.max(0, minimumLoadingTime - (new Date().getTime() - loadingStartTime)));
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
