import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, Subscription, takeUntil, tap } from 'rxjs';

import { MovieService } from '../../../core/services/movie.service';
import { ScreeningService } from '../../../core/services/screening.service';
import { Movie, Genre } from '../../../core/models/movie.model';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { Screening } from '../../../core/models/screening.model';

interface MovieCategory {
  name: string;
  movies: Movie[];
}

interface MovieWithNextScreening extends Movie {
  nextScreening?: {
    date: Date;
    formattedTime: string;
    screeningId: number;
  };
  director?: string;
  actors?: string;
}

interface FilterOptions {
  genres: string[];
  durations: { value: string; label: string, min: number, max: number }[];
  ratings: string[];
  timeFrames: { value: string; label: string }[];
  sortOptions: { value: string; label: string }[];
}

@Component({
  selector: 'app-public-movie-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule,
    MatSliderModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatExpansionModule,
    MatCheckboxModule,
    NavbarComponent,
  ],
  template: `
    <div class="movie-list-page">
      <app-navbar></app-navbar>

      <div class="movie-list-container">
        <!-- Page title and trending section -->
        <div class="page-header">
        <h1 class="page-title">Discover Movies</h1>
        </div>

        <!-- Trending/Editor's Pick section -->
        <div *ngIf="!loading && trendingMovies.length > 0" class="trending-section">
          <div class="trending-header">
            <h2 class="trending-title">
              <mat-icon class="trending-icon">trending_up</mat-icon>
              <span>Trending Now</span>
            </h2>
          </div>
          
          <div class="trending-carousel">
            <div class="trending-slide" *ngFor="let movie of trendingMovies">
              <div class="trending-backdrop" [style.background-image]="'url(' + movie.backdropUrl + ')'">
                <div class="trending-overlay">
                  <div class="trending-content">
                    <h3 class="trending-movie-title">{{ movie.title }}</h3>
                    <div class="trending-movie-meta">
                      <span *ngIf="movie.durationMinutes" class="trending-duration">
                        <mat-icon>schedule</mat-icon> {{ movie.durationMinutes }} min
                      </span>
                      <span *ngIf="movie.rating" class="trending-rating">
                        <mat-icon>star</mat-icon> {{ movie.rating }}
                      </span>
                    </div>
                    <div class="trending-movie-genres" *ngIf="movie.genres?.length">
                      {{ getGenresList(movie) }}
                    </div>
                    <div class="trending-actions">
                      <button mat-raised-button color="primary" [routerLink]="['/movies', movie.id]">
                        <mat-icon>info</mat-icon> View Details
                      </button>
                      <button *ngIf="movie.nextScreening" 
                              mat-stroked-button 
                              color="primary" 
                              [routerLink]="['/reserve', movie.nextScreening.screeningId]">
                        <mat-icon>event_seat</mat-icon> Reserve Seats
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Search and filter section -->
        <div class="search-filter-section">
          <div class="search-container">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search movies</mat-label>
              <input matInput [formControl]="searchControl" placeholder="Enter movie title">
              <mat-icon matPrefix>search</mat-icon>
              <button *ngIf="searchControl.value" matSuffix mat-icon-button aria-label="Clear" (click)="searchControl.setValue('')">
                <mat-icon>close</mat-icon>
              </button>
            </mat-form-field>
          </div>
          
          <mat-accordion class="filter-accordion" multi>
            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon>filter_list</mat-icon> Filter & Sort Options
                </mat-panel-title>
              </mat-expansion-panel-header>
              
              <div class="filters-container">
                <div class="filter-row">
                  <div class="filter-group">
                    <label class="filter-label">Genre</label>
                    <mat-form-field appearance="outline">
                      <mat-label>Select genres</mat-label>
                      <mat-select [formControl]="genreControl" multiple>
                        <mat-option *ngFor="let genre of filterOptions.genres" [value]="genre">{{ genre }}</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                  
                  <div class="filter-group">
                    <label class="filter-label">Duration</label>
                    <mat-form-field appearance="outline">
                      <mat-label>Movie length</mat-label>
                      <mat-select [formControl]="durationControl">
                        <mat-option [value]="''">Any duration</mat-option>
                        <mat-option *ngFor="let duration of filterOptions.durations" [value]="duration.value">
                          {{ duration.label }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                  
                  <div class="filter-group">
                    <label class="filter-label">Rating</label>
                    <mat-form-field appearance="outline">
                      <mat-label>Age rating</mat-label>
                      <mat-select [formControl]="ratingControl">
                        <mat-option [value]="''">Any rating</mat-option>
                        <mat-option *ngFor="let rating of filterOptions.ratings" [value]="rating">{{ rating }}</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                </div>
                
                <div class="filter-row">
                  <div class="filter-group">
                    <label class="filter-label">Time Frame</label>
                    <mat-form-field appearance="outline">
                      <mat-label>Showing</mat-label>
                      <mat-select [formControl]="timeFrameControl">
                        <mat-option [value]="''">All screenings</mat-option>
                        <mat-option *ngFor="let timeFrame of filterOptions.timeFrames" [value]="timeFrame.value">
                          {{ timeFrame.label }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                  
                  <div class="filter-group">
                    <label class="filter-label">Sort By</label>
                    <mat-form-field appearance="outline">
                      <mat-label>Sort movies</mat-label>
                      <mat-select [formControl]="sortControl">
                        <mat-option *ngFor="let sort of filterOptions.sortOptions" [value]="sort.value">
                          {{ sort.label }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                </div>
                
                <div class="filter-actions">
                  <button mat-stroked-button color="primary" (click)="resetFilters()">
                    <mat-icon>refresh</mat-icon> Reset Filters
                  </button>
                </div>
              </div>
            </mat-expansion-panel>
          </mat-accordion>
        </div>

        <!-- Loading spinner -->
        <div *ngIf="loading" class="loading-spinner">
          <mat-spinner></mat-spinner>
        </div>

        <!-- No movies message -->
        <div *ngIf="!loading && filteredMovies.length === 0" class="no-movies">
          <p>
            <mat-icon>movie_filter</mat-icon>
            No movies found matching your criteria. Try adjusting your filters.
          </p>
          <button mat-raised-button color="accent" (click)="resetFilters()">Reset All Filters</button>
        </div>

        <!-- Movies grid view -->
        <div *ngIf="!loading && filteredMovies.length > 0" class="movies-grid-section">
          <div class="movies-grid">
            <div *ngFor="let movie of filteredMovies" class="movie-card-container">
              <mat-card class="movie-card">
                <div class="movie-poster" [routerLink]="['/movies', movie.id]">
                  <img
                    *ngIf="movie.posterUrl"
                    [src]="movie.posterUrl"
                    alt="{{ movie.title }} poster"
                  />
                  <div *ngIf="!movie.posterUrl" class="no-poster">
                    <mat-icon>movie</mat-icon>
                  </div>
                  
                  <!-- Next screening badge -->
                  <div *ngIf="movie.nextScreening" class="next-screening-badge">
                    <span class="next-time">{{ movie.nextScreening.formattedTime }}</span>
                    <span class="next-label">Next Show</span>
                </div>
                  
                  <!-- Hover Quick Preview -->
                  <div class="movie-preview-overlay">
                    <div class="preview-content">
                      <h3 class="preview-title">{{ movie.title }}</h3>
                      
                      <div class="preview-info">
                        <p *ngIf="movie.description" class="preview-synopsis">
                          {{ movie.description | slice:0:150 }}{{ movie.description.length > 150 ? '...' : '' }}
                        </p>
                        
                        <div *ngIf="movie.director" class="preview-meta">
                          <span class="preview-director"><strong>Director:</strong> {{ movie.director }}</span>
                </div>
                        
                        <div *ngIf="movie.actors" class="preview-meta">
                          <span class="preview-cast"><strong>Cast:</strong> {{ movie.actors | slice:0:80 }}{{ movie.actors.length > 80 ? '...' : '' }}</span>
          </div>
        </div>

                      <div class="preview-actions">
                        <button mat-stroked-button color="primary" [routerLink]="['/movies', movie.id]">
                          <mat-icon>info</mat-icon> Full Details
                        </button>
                    </div>
                  </div>
                  </div>
                </div>
                
                  <div class="movie-content">
                    <mat-card-header>
                    <mat-card-title [routerLink]="['/movies', movie.id]">{{ movie.title }}</mat-card-title>
                    <mat-card-subtitle *ngIf="movie.nextScreening" class="next-screening-subtitle">
                      <mat-icon>event_available</mat-icon>
                      Next: {{ formatDate(movie.nextScreening.date) }}
                      </mat-card-subtitle>
                    </mat-card-header>

                    <mat-card-content>
                    <div class="movie-meta-container">
                      <div class="movie-meta" *ngIf="movie.durationMinutes">
                        <mat-icon>schedule</mat-icon>
                        <span>{{ movie.durationMinutes }} min</span>
                      </div>
                      <div class="movie-meta" *ngIf="movie.rating">
                        <mat-icon>movie_filter</mat-icon>
                        <span>{{ movie.rating }}</span>
                      </div>
                      <div class="movie-meta" *ngIf="movie.voteAverage">
                        <mat-icon>star</mat-icon>
                        <span>{{ movie.voteAverage }}/10</span>
                      </div>
                    </div>
                    
                    <div class="movie-genres-container" *ngIf="movie.genres && movie.genres.length > 0">
                      <mat-chip-set>
                        <mat-chip *ngFor="let genre of movie.genres.slice(0, 3)">
                          {{ genre.name }}
                        </mat-chip>
                      </mat-chip-set>
                    </div>
                    </mat-card-content>

                    <mat-card-actions>
                      <button
                      mat-stroked-button
                        color="primary"
                        [routerLink]="['/movies', movie.id]"
                      >
                      <mat-icon>calendar_today</mat-icon>Dates
                    </button>
                    <button
                      *ngIf="movie.nextScreening"
                      mat-raised-button
                      color="accent"
                      [routerLink]="['/reserve', movie.nextScreening.screeningId]"
                    >
                      <mat-icon>event_seat</mat-icon> Reserve
                      </button>
                    </mat-card-actions>
                  </div>
                </mat-card>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./movie-list.component.scss']

})
export class PublicMovieListComponent implements OnInit, OnDestroy {
  // Original movies array
  movies: MovieWithNextScreening[] = [];
  
  // Filtered movies for display
  filteredMovies: MovieWithNextScreening[] = [];
  
  // Trending/featured movies
  trendingMovies: MovieWithNextScreening[] = [];
  
  // Loading state
  loading = true;
  
  // Movie categories
  movieCategories: MovieCategory[] = [];
  
  // Form controls for filtering
  searchControl = new FormControl('');
  genreControl = new FormControl<string[]>([]);
  durationControl = new FormControl('');
  ratingControl = new FormControl('');
  timeFrameControl = new FormControl('');
  sortControl = new FormControl('title-asc');
  
  // Filter options
  filterOptions: FilterOptions = {
    genres: [],
    durations: [
      { value: 'short', label: 'Short (< 90 min)', min: 0, max: 90 },
      { value: 'medium', label: 'Medium (90-120 min)', min: 90, max: 120 },
      { value: 'long', label: 'Long (> 120 min)', min: 120, max: 999 }
    ],
    ratings: ['G', 'PG', 'PG-13', 'R'],
    timeFrames: [
      { value: 'today', label: 'Today' },
      { value: 'week', label: 'This Week' },
      { value: 'all', label: 'All Screenings' }
    ],
    sortOptions: [
      { value: 'title-asc', label: 'Title (A-Z)' },
      { value: 'title-desc', label: 'Title (Z-A)' },
      { value: 'rating', label: 'Rating (Highest)' },
      { value: 'nextScreening', label: 'Next Screening' }
    ]
  };
  
  private destroy$ = new Subject<void>();

  constructor(
    private movieService: MovieService,
    private screeningService: ScreeningService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadGenres();
    this.loadMovies();
    this.setupFilterSubscriptions();
    this.loadTrendingMovies();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // Initialize by loading genres, then movies
  private loadGenres(): void {
    this.movieService.getAllGenres()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (genres) => {
          this.filterOptions.genres = genres;
        },
        error: (error) => {
          console.error('Error loading genres:', error);
          this.showErrorMessage('Failed to load movie genres');
          // Use fallback genres
          this.filterOptions.genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller'];
        }
      });
  }
  
  // Load trending movies
  private loadTrendingMovies(): void {
    this.movieService.getTrendingMovies()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (movies) => {
          this.trendingMovies = movies.slice(0, 5); // Limit to 5 trending movies
        },
        error: (error) => {
          console.error('Error loading trending movies:', error);
          // Use empty array as fallback
          this.trendingMovies = [];
        }
      });
  }
  
  // Load movies with filters applied
  private loadMovies(): void {
    this.loading = true;
    
    this.movieService.getFilteredMovies(
      this.searchControl.value || undefined,
      this.genreControl.value?.length ? this.genreControl.value : undefined,
      this.durationControl.value || undefined,
      this.ratingControl.value || undefined,
      this.timeFrameControl.value || undefined,
      this.sortControl.value || undefined
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (movies) => {
        this.movies = movies;
        this.filteredMovies = movies;
          this.loading = false;
      },
      error: (error) => {
        console.error('Error loading movies:', error);
        this.showErrorMessage('Failed to load movies. Using fallback data.');
        this.loading = false;
        
        // Use fallback approach: load all movies and apply filters locally
        this.loadFallbackMovies();
      }
    });
  }
  
  // Fallback method to load movies when the filter endpoint fails
  private loadFallbackMovies(): void {
    this.movieService.getAllMovies()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (movies) => {
          // Convert regular movies to movies with next screening info
          this.movies = movies.map(movie => {
            return {
              ...movie,
              actors: "Cast information not available",
              // Add random next screening for demo purposes
              nextScreening: Math.random() > 0.3 ? {
                screeningId: Math.floor(Math.random() * 1000),
                date: new Date(Date.now() + Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
                formattedTime: this.getRandomTime()
              } : undefined
            };
          });
          
          // Apply client-side filtering
          this.applyClientSideFilters();
        },
        error: (err) => {
          console.error('Even fallback method failed:', err);
          this.filteredMovies = [];
          this.loading = false;
        }
      });
  }
  
  // Apply filters on the client side when backend filtering is not available
  private applyClientSideFilters(): void {
    let filtered = [...this.movies];
    
    // Apply search filter
    const searchTerm = this.searchControl.value?.toLowerCase().trim();
    if (searchTerm) {
      filtered = filtered.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply genre filter
    const selectedGenres = this.genreControl.value;
    if (selectedGenres && selectedGenres.length > 0) {
      filtered = filtered.filter(movie => 
        movie.genres && movie.genres.some(genre => 
          selectedGenres.includes(genre.name)
        )
      );
    }
    
    // Apply duration filter
    const selectedDuration = this.durationControl.value;
    if (selectedDuration) {
      const duration = this.filterOptions.durations.find(d => d.value === selectedDuration);
      if (duration) {
        filtered = filtered.filter(movie => 
          movie.durationMinutes && 
          movie.durationMinutes >= duration.min && 
          movie.durationMinutes <= duration.max
        );
      }
    }
    
    // Apply rating filter
    const selectedRating = this.ratingControl.value;
    if (selectedRating) {
      filtered = filtered.filter(movie => 
        movie.rating === selectedRating
      );
    }
    
    // Apply sorting
    const sortOption = this.sortControl.value;
    if (sortOption) {
      switch (sortOption) {
        case 'title-asc':
          filtered.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'title-desc':
          filtered.sort((a, b) => b.title.localeCompare(a.title));
          break;
        case 'rating':
          filtered.sort((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0));
          break;
        case 'nextScreening':
          filtered.sort((a, b) => {
            if (!a.nextScreening) return 1;
            if (!b.nextScreening) return -1;
            return a.nextScreening.date.getTime() - b.nextScreening.date.getTime();
          });
          break;
      }
    }
    
    this.filteredMovies = filtered;
    this.loading = false;
  }
  
  // Helper method to generate random time strings for demo data
  private getRandomTime(): string {
    const hours = String(Math.floor(Math.random() * 24)).padStart(2, '0');
    const minutes = ['00', '15', '30', '45'][Math.floor(Math.random() * 4)];
    return `${hours}:${minutes}`;
  }
  
  // Set up subscriptions to filter controls
  private setupFilterSubscriptions(): void {
    // Subscribe to search control changes with debounce
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.loadMovies());
    
    // Subscribe to other filter controls
    this.genreControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadMovies());
    
    this.durationControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadMovies());
    
    this.ratingControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadMovies());
    
    this.timeFrameControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadMovies());
    
    this.sortControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadMovies());
  }
  
  // Reset all filters
  resetFilters(): void {
    this.searchControl.setValue('');
    this.genreControl.setValue([]);
    this.durationControl.setValue('');
    this.ratingControl.setValue('');
    this.timeFrameControl.setValue('');
    this.sortControl.setValue('title-asc');
  }
  
  // Format the screening date for display
  formatDate(date: Date): string {
    if (!date) return '';
    
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  // Get comma-separated list of genres
  getGenresList(movie: Movie): string {
    if (!movie.genres || movie.genres.length === 0) return 'No genres';
    return movie.genres.map(g => g.name).join(', ');
  }
  
  // Show error message
  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }
}
