import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
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
import { ScreeningService, ScreeningTimeDTO, ScreeningTimeSlot } from '../../core/services/screening.service';
import { MovieService } from '../../core/services/movie.service';
import { Screening } from '../../core/models/screening.model';
import { Movie } from '../../core/models/movie.model';
import { MovieWithScreenings, ScreeningTime } from '../../core/models/movie-screening.model';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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
    NavbarComponent
  ],
  template: `
    <div class="home-container">
      <app-navbar></app-navbar>

      <!-- Main content section -->
      <div class="content">
        <div class="hero-section">
          <div class="hero-content">
            <h1>Welcome to CineReserve</h1>
            <p>Discover the latest movies and reserve your seats today!</p>
            <button mat-raised-button color="accent" routerLink="/public/movies">
              <mat-icon>movie</mat-icon> Browse All Movies
            </button>
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
            <h3 class="date-selection-title">Select a date to view screenings</h3>
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
          <div *ngIf="selectedDate && !loadingScreenings" class="screenings-for-date">
            <h2 class="date-heading">
              Screenings for {{ selectedDate | date:'EEEE, MMMM d, y' }}
            </h2>
            
            <!-- No screenings message -->
            <div *ngIf="moviesWithScreenings.length === 0" class="no-data">
              <p>No screenings available for this date.</p>
            </div>
            
            <!-- Movies with screenings -->
            <div *ngIf="moviesWithScreenings.length > 0" class="movies-container">
              <mat-card *ngFor="let item of moviesWithScreenings" class="movie-screening-card">
                <div class="movie-info">
                  <div class="poster-container" *ngIf="item.movie.posterUrl">
                    <img [src]="item.movie.posterUrl" [alt]="item.movie.title + ' poster'" class="movie-poster">
                  </div>
                  <div class="movie-details">
                    <h3 class="movie-title">{{ item.movie.title }}</h3>
                    <div class="movie-meta">
                      <span *ngIf="item.movie.durationMinutes" class="duration">
                        <mat-icon>schedule</mat-icon> {{ item.movie.durationMinutes }} min
                      </span>
                      <span *ngIf="item.movie.rating" class="rating">
                        <mat-icon>star</mat-icon> {{ item.movie.rating }}
                      </span>
                    </div>
                    <div *ngIf="item.movie.genres && item.movie.genres.length > 0" class="genres">
                      {{ getGenresList(item.movie) }}
                    </div>
                    <a mat-button color="primary" [routerLink]="['/public/movies', item.movie.id]">
                      <mat-icon>info</mat-icon> Details
                    </a>
                  </div>
                </div>
                
                <div class="screening-times">
                  <h4>Available Times</h4>
                  <div class="time-buttons">
                    <button 
                      *ngFor="let screening of item.screeningTimes" 
                      mat-stroked-button
                      [color]="isLoggedIn ? 'primary' : ''"
                      [routerLink]="isLoggedIn ? ['/reserve', screening.screeningId] : ['/login']"
                      [queryParams]="!isLoggedIn ? {returnUrl: '/reserve/' + screening.screeningId} : null"
                      class="time-button"
                    >
                      <div class="time-display">
                        <span class="time">{{ screening.time }}</span>
                        <span class="format-tags">
                          {{ screening.format }}
                          <span *ngIf="screening.is3D" class="tag">3D</span>
                          <span *ngIf="screening.hasSubtitles" class="tag">SUB</span>
                        </span>
                      </div>
                      <div class="room-number">Room {{ screening.roomNumber }}</div>
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
  `,
  styles: [`
    .home-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .content {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 30px;
    }
    
    .hero-section {
      background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('/assets/cinema-background.jpg');
      background-size: cover;
      background-position: center;
      color: white;
      padding: 60px 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .hero-content {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
    }
    
    .hero-content h1 {
      font-size: 2.5rem;
      margin-bottom: 20px;
    }
    
    .hero-content p {
      font-size: 1.2rem;
      margin-bottom: 30px;
    }

    .section-title {
      margin-top: 30px;
      margin-bottom: 20px;
      font-size: 28px;
    }
    
    .calendar-section {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
    }
    
    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 50px 0;
    }
    
    .no-data {
      text-align: center;
      padding: 30px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }
    
    .date-selection {
      margin-bottom: 20px;
    }
    
    .date-selection-title {
      margin-bottom: 12px;
      font-size: 18px;
      font-weight: 500;
    }
    
    .horizontal-calendar {
      display: flex;
      align-items: center;
      position: relative;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 5px 0;
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
    }
    
    .calendar-date:hover {
      background-color: #f0f0f0;
    }
    
    .calendar-date.active {
      background-color: #673ab7;
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
      background-color: #ff4081;
    }
    
    .calendar-date.active.has-screenings:after {
      background-color: white;
    }
    
    .weekday {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .date-number {
      font-size: 24px;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 4px;
    }
    
    .month {
      font-size: 14px;
    }
    
    .scroll-button {
      background-color: white;
      z-index: 10;
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
    }
    
    .movie-screening-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .movie-info {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .poster-container {
      width: 100px;
      height: 150px;
      overflow: hidden;
      border-radius: 4px;
      flex-shrink: 0;
    }
    
    .movie-poster {
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
    }
    
    .movie-meta {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    
    .duration, .rating {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #666;
      font-size: 13px;
    }
    
    .duration mat-icon, .rating mat-icon {
      font-size: 14px;
      height: 14px;
      width: 14px;
    }
    
    .genres {
      font-size: 13px;
      color: #666;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .screening-times {
      border-top: 1px solid #eee;
      padding-top: 12px;
      margin-top: auto;
    }
    
    .screening-times h4 {
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 15px;
      font-weight: 500;
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
    }
    
    .time-display {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .time {
      font-size: 14px;
      font-weight: 500;
    }
    
    .format-tags {
      font-size: 11px;
      display: flex;
      gap: 4px;
      align-items: center;
    }
    
    .tag {
      display: inline-block;
      padding: 1px 3px;
      background-color: #f0f0f0;
      border-radius: 2px;
      font-size: 10px;
      font-weight: 500;
    }
    
    .room-number {
      font-size: 11px;
      color: #666;
      margin-top: 2px;
    }
    
    .date-heading {
      margin-bottom: 15px;
      font-size: 20px;
      font-weight: 500;
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
      background-color: #ff4081;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .date-selection {
        flex-direction: column;
      }
      
      .movies-container {
        grid-template-columns: 1fr;
      }
      
      .movie-info {
        flex-direction: row;
      }
      
      .poster-container {
        width: 80px;
        height: 120px;
      }
    }
  `]
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  isLoggedIn = false;
  loading = true;
  loadingScreenings = false;
  
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

  private subscriptions = new Subscription();

  constructor(
    private screeningService: ScreeningService,
    private movieService: MovieService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Check login status from NavbarComponent
    document.addEventListener('loginStatusChange', (event: any) => {
      this.isLoggedIn = event.detail.isLoggedIn;
    });

    // Load available dates
    this.loadAvailableDates();
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
      this.datesContainer.nativeElement.removeEventListener('scroll', this.updateScrollButtonsState);
    }
  }

  loadAvailableDates(): void {
    this.loading = true;
    
    // Generate an array of all dates for the next 30 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Generate all dates for the next 30 days
    this.allDates = Array.from({length: 30}, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });
    
    // Format dates for API calls to check which ones have screenings
    const datesToCheck = this.allDates.map(date => this.formatDateForApi(date));
    
    // Use forkJoin to make multiple API calls in parallel
    const requests = datesToCheck.map(dateStr => 
      this.screeningService.getScreeningsByDate(dateStr).pipe(
        catchError(error => {
          console.error(`Error loading screenings for ${dateStr}:`, error);
          return of([]);
        })
      )
    );
    
    forkJoin(requests).subscribe(results => {
      // Process results to identify dates with screenings
      this.availableDates = [];
      
      results.forEach((screenings, index) => {
        if (screenings && screenings.length > 0) {
          // Verify screenings are actually on this date in local time
          const dateToCheck = this.allDates[index];
          const hasScreeningsOnDate = screenings.some(screening => {
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
    
    const subscription = this.screeningService.getScreeningsByDate(formattedDate).subscribe({
      next: (screenings) => {
        if (screenings.length === 0) {
          this.moviesWithScreenings = [];
          this.loadingScreenings = false;
          return;
        }
        
        // Filter screenings to ensure they match the selected date in local time
        const filteredScreenings = screenings.filter(screening => {
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
        const movieIds = [...new Set(filteredScreenings.map(s => s.movie?.id).filter(id => id !== undefined))] as number[];
        
        // Create an array of observables for each movie
        const movieObservables = movieIds.map(movieId => 
          this.movieService.getMovie(movieId).pipe(
            catchError(error => {
              console.error(`Error loading movie ${movieId}:`, error);
              return of(null);
            })
          )
        );
        
        // Use forkJoin to wait for all movie requests to complete
        const movieSubscription = forkJoin(movieObservables).subscribe({
          next: (movies) => {
            // Filter out null movies
            const validMovies = movies.filter(m => m !== null) as Movie[];
            
            // Create MovieWithScreenings objects
            this.moviesWithScreenings = validMovies.map(movie => {
              const movieScreenings = filteredScreenings.filter(s => s.movie?.id === movie.id);
              
              const screeningTimes: ScreeningTime[] = movieScreenings.map(s => ({
                screeningId: s.id!,
                time: this.formatTime(s.startTime),
                format: s.format || 'Standard',
                is3D: s.is3D || false,
                hasSubtitles: s.hasSubtitles || false,
                roomNumber: s.room?.number || 0,
                ticketPrice: s.ticketPrice
              }));
              
              // Sort by time
              screeningTimes.sort((a, b) => a.time.localeCompare(b.time));
              
              return {
                movie,
                screeningTimes
              };
            });
            
            this.loadingScreenings = false;
          },
          error: (error) => {
            console.error('Error loading movies:', error);
            this.loadingScreenings = false;
          }
        });
        
        this.subscriptions.add(movieSubscription);
      },
      error: (error) => {
        console.error('Error loading screenings for date:', error);
        this.snackBar.open('Could not load screenings. Please try again later.', 'Close', {
          duration: 5000
        });
        this.loadingScreenings = false;
      }
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
    return this.availableDates.some(d => this.isSameDay(d, date));
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  formatDate(date: Date): string {
    // Format date as "Weekday, Month Day" (e.g., "Mon, Jun 15")
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
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
      hour12: true 
    });
  }

  getUniqueDatesFromScreenings(screenings: Screening[]): Date[] {
    const uniqueDates = new Set<string>();
    
    screenings.forEach(screening => {
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
      .map(dateStr => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
      })
      .sort((a, b) => a.getTime() - b.getTime());
  }
  
  getGenresList(movie: Movie): string {
    if (!movie.genres || movie.genres.length === 0) return '';
    return movie.genres.map(genre => genre.name).join(', ');
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
    this.canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth - 10);
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
    const selectedIndex = this.allDates.findIndex(date => 
      this.isSameDay(date, this.selectedDate!)
    );
    
    if (selectedIndex >= 0 && dateElements[selectedIndex]) {
      // Calculate scroll position to center the selected date
      const dateElement = dateElements[selectedIndex];
      const scrollLeft = dateElement.offsetLeft - (container.clientWidth / 2) + (dateElement.clientWidth / 2);
      
      container.scrollLeft = Math.max(0, scrollLeft);
      this.updateScrollButtonsState();
    }
  }
} 