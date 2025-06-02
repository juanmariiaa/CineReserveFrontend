import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthService } from '../../../core/services/auth.service';
import { MovieService } from '../../../core/services/movie.service';
import { ScreeningService } from '../../../core/services/screening.service';
import { Movie } from '../../../core/models/movie.model';
import { Screening } from '../../../core/models/screening.model';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-public-movie-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDividerModule,
    MatDialogModule,
    MatTabsModule,
    NavbarComponent,
  ],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate(
          '500ms ease-out',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
    ]),
  ],
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.scss'],
})
export class PublicMovieDetailComponent implements OnInit {
  movie: Movie | null = null;
  screenings: Screening[] = [];
  loading = true;
  isLoggedIn = false;
  hasScreenings = false;
  hasFutureScreenings = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private screeningService: ScreeningService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();

    // Subscribe to auth changes
    this.authService.currentUser$.subscribe((user) => {
      this.isLoggedIn = this.authService.isLoggedIn();
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadMovieAndScreenings(+id);
      } else {
        this.router.navigate(['/movies']);
      }
    });
  }

  // Método para manejar intentos de reserva cuando el usuario no está autenticado
  promptLogin(redirectUrl: string): void {
    // Usar el servicio para abrir el modal de login y guardar la URL de redirección
    this.authService.openLoginModal(redirectUrl);
  }

  loadMovieAndScreenings(movieId: number): void {
    this.loading = true;

    // Load movie details
    this.movieService.getMovie(movieId).subscribe({
      next: (movie: Movie) => {
        this.movie = movie;

        // Load screenings for this movie
        this.screeningService.getScreeningsByMovie(movieId).subscribe({
          next: (screenings) => {
            // Get current date and time
            const now = new Date();

            // Store all screenings
            this.screenings = screenings;
            this.hasScreenings = screenings.length > 0;

            // Check if there are any future screenings
            const futureScreenings = screenings.filter((screening) => {
              const screeningDate = new Date(screening.startTime);
              return screeningDate > now;
            });

            this.hasFutureScreenings = futureScreenings.length > 0;

            // If there are no future screenings, show a warning message
            if (this.hasScreenings && !this.hasFutureScreenings) {
              this.snackBar.open(
                'There are no upcoming screenings for this movie.',
                'Close',
                {
                  duration: 7000,
                  panelClass: ['warning-snackbar'],
                }
              );
            }

            this.loading = false;
          },
          error: (error: any) => {
            console.error('Error loading screenings:', error);
            this.loading = false;
          },
        });
      },
      error: (error: any) => {
        console.error('Error loading movie:', error);
        this.snackBar.open('Could not load movie details.', 'Close', {
          duration: 5000,
        });
        this.loading = false;
      },
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  formatDateHeading(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatGenres(genres: any[]): string {
    if (!genres || genres.length === 0) return '';
    return genres.map((genre) => genre.name).join(', ');
  }

  scrollToScreenings(): void {
    const element = document.getElementById('screenings');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Get unique dates from screenings
  getUniqueDates(): string[] {
    const now = new Date();

    // Filter out screenings that have already passed
    const futureScreenings = this.screenings.filter((screening) => {
      const screeningTime = new Date(screening.startTime);
      return screeningTime > now;
    });

    const dates = futureScreenings.map((screening) => {
      const date = new Date(screening.startTime);
      return date.toISOString().split('T')[0]; // Get only date part
    });

    // Remove duplicates
    return [...new Set(dates)].sort();
  }

  // Get screenings for a specific date
  getScreeningsByDate(date: string): Screening[] {
    const now = new Date();

    return this.screenings
      .filter((screening) => {
        const screeningDate = new Date(screening.startTime);
        const screeningDateStr = screeningDate.toISOString().split('T')[0];

        // Filter out past screenings
        const isFutureScreening = screeningDate > now;

        return screeningDateStr === date && isFutureScreening;
      })
      .sort((a, b) => {
        return (
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
      });
  }
}
