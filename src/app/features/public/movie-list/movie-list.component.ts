import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormControl, FormGroup } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  Subscription,
  takeUntil,
  tap,
  map,
} from 'rxjs';

import { MovieService } from '../../../core/services/movie.service';
import { ScreeningService } from '../../../core/services/screening.service';
import { Movie, Genre } from '../../../core/models/movie.model';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { Screening } from '../../../core/models/screening.model';

// Import the new components
import { TrendingMoviesComponent } from './components/trending-movies/trending-movies.component';
import {
  MovieFiltersComponent,
  FilterOptions,
} from './components/movie-filters/movie-filters.component';
import { MovieCardComponent } from './components/movie-card/movie-card.component';
import { MovieWithNextScreening } from '../../../core/models/movie.model';

interface MovieCategory {
  name: string;
  movies: Movie[];
}

@Component({
  selector: 'app-public-movie-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    NavbarComponent,
    TrendingMoviesComponent,
    MovieFiltersComponent,
    MovieCardComponent,
  ],
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.scss'],
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
      { value: 'long', label: 'Long (> 120 min)', min: 120, max: 999 },
    ],
    ratings: ['G', 'PG', 'PG-13', 'R'],
    timeFrames: [
      { value: 'today', label: 'Today' },
      { value: 'week', label: 'This Week' },
      { value: 'all', label: 'All Screenings' },
    ],
    sortOptions: [
      { value: 'title-asc', label: 'Title (A-Z)' },
      { value: 'title-desc', label: 'Title (Z-A)' },
      { value: 'rating', label: 'Rating (Highest)' },
      { value: 'nextScreening', label: 'Next Screening' },
    ],
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
    this.movieService
      .getAllGenres()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (genres) => {
          this.filterOptions.genres = genres;
        },
        error: (error) => {
          console.error('Error loading genres:', error);
          this.showErrorMessage('Failed to load movie genres');
          // Use fallback genres
          this.filterOptions.genres = [
            'Action',
            'Comedy',
            'Drama',
            'Horror',
            'Sci-Fi',
            'Thriller',
          ];
        },
      });
  }

  // Load trending movies
  private loadTrendingMovies(): void {
    this.movieService
      .getMoviesWithFutureScreenings()
      .pipe(
        takeUntil(this.destroy$),
        map((movies) => {
          // Sort by rating if available
          const sortedMovies = [...movies].sort(
            (a, b) => (b.voteAverage || 0) - (a.voteAverage || 0)
          );

          // Convert to MovieWithNextScreening and limit to 5 movies
          return sortedMovies.slice(0, 5).map((movie) => {
            return {
              ...movie,
              // Add random next screening for demo purposes
              nextScreening: {
                screeningId: Math.floor(Math.random() * 1000),
                date: new Date(
                  Date.now() +
                    Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
                ),
                formattedTime: this.getRandomTime(),
              },
            } as MovieWithNextScreening;
          });
        })
      )
      .subscribe({
        next: (movies) => {
          this.trendingMovies = movies;
        },
        error: (error) => {
          console.error('Error loading trending movies:', error);
          // Use empty array as fallback
          this.trendingMovies = [];
        },
      });
  }

  // Load movies with filters applied
  private loadMovies(): void {
    this.loading = true;

    this.movieService
      .getFilteredMoviesWithFutureScreenings(
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
        },
      });
  }

  // Fallback method to load movies when the filter endpoint fails
  private loadFallbackMovies(): void {
    this.movieService
      .getMoviesWithFutureScreenings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (movies) => {
          // Convert regular movies to movies with next screening info
          this.movies = movies.map((movie) => {
            return {
              ...movie,
              actors: 'Cast information not available',
              // Add random next screening for demo purposes
              nextScreening:
                Math.random() > 0.3
                  ? {
                      screeningId: Math.floor(Math.random() * 1000),
                      date: new Date(
                        Date.now() +
                          Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
                      ),
                      formattedTime: this.getRandomTime(),
                    }
                  : undefined,
            };
          });

          // Apply client-side filtering
          this.applyClientSideFilters();
        },
        error: (err) => {
          console.error('Even fallback method failed:', err);
          this.filteredMovies = [];
          this.loading = false;
        },
      });
  }

  // Apply filters on the client side when backend filtering is not available
  private applyClientSideFilters(): void {
    let filtered = [...this.movies];

    // Apply search filter
    const searchTerm = this.searchControl.value?.toLowerCase().trim();
    if (searchTerm) {
      filtered = filtered.filter((movie) =>
        movie.title.toLowerCase().includes(searchTerm)
      );
    }

    // Apply genre filter
    const selectedGenres = this.genreControl.value;
    if (selectedGenres && selectedGenres.length > 0) {
      filtered = filtered.filter(
        (movie) =>
          movie.genres &&
          movie.genres.some((genre) => selectedGenres.includes(genre.name))
      );
    }

    // Apply duration filter
    const selectedDuration = this.durationControl.value;
    if (selectedDuration) {
      const duration = this.filterOptions.durations.find(
        (d) => d.value === selectedDuration
      );
      if (duration) {
        filtered = filtered.filter(
          (movie) =>
            movie.durationMinutes &&
            movie.durationMinutes >= duration.min &&
            movie.durationMinutes <= duration.max
        );
      }
    }

    // Apply rating filter
    const selectedRating = this.ratingControl.value;
    if (selectedRating) {
      filtered = filtered.filter((movie) => movie.rating === selectedRating);
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
            return (
              a.nextScreening.date.getTime() - b.nextScreening.date.getTime()
            );
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
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
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
      day: 'numeric',
    });
  }

  // Get comma-separated list of genres
  getGenresList(movie: Movie): string {
    if (!movie.genres || movie.genres.length === 0) return 'No genres';
    return movie.genres.map((g) => g.name).join(', ');
  }

  // Show error message
  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar'],
    });
  }
}
