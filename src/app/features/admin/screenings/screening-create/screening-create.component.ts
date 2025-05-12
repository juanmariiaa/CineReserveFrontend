import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ScreeningService } from '../../../../core/services/screening.service';
import { MovieService } from '../../../../core/services/movie.service';
import { RoomService } from '../../../../core/services/room.service';
import { Movie } from '../../../../core/models/movie.model';
import { Room, Screening } from '../../../../core/models/screening.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, map, startWith } from 'rxjs';

@Component({
  selector: 'app-screening-create',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatDividerModule,
    MatAutocompleteModule
  ],
  template: `
    <div class="screening-create-container">
      <div class="page-header">
        <h1>{{ isEditMode ? 'Edit Screening' : 'Schedule New Screening' }}</h1>
        <button mat-raised-button color="accent" routerLink="/admin/screenings">
          <mat-icon>arrow_back</mat-icon> Back to List
        </button>
      </div>

      <div *ngIf="loading" class="loading-spinner">
        <mat-spinner></mat-spinner>
      </div>

      <mat-card *ngIf="!loading">
        <mat-card-content>
          <form [formGroup]="screeningForm" (ngSubmit)="onSubmit()">
            <!-- Movie Selection -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Movie</mat-label>
              <input
                type="text"
                matInput
                formControlName="movieTitle"
                [matAutocomplete]="autoMovie"
                placeholder="Search movie..."
              >
              <mat-autocomplete #autoMovie="matAutocomplete" [displayWith]="displayMovieTitle">
                <mat-option *ngFor="let movie of filteredMovies | async" [value]="movie">
                  <div class="movie-option">
                    <img *ngIf="movie.posterUrl" [src]="movie.posterUrl" class="movie-poster">
                    <div *ngIf="!movie.posterUrl" class="no-poster">
                      <mat-icon>movie</mat-icon>
                    </div>
                    <span>{{ movie.title }}</span>
                  </div>
                </mat-option>
              </mat-autocomplete>
              <mat-error *ngIf="screeningForm.get('movieTitle')?.hasError('required')">
                Select a movie
              </mat-error>
            </mat-form-field>

            <!-- Room Selection -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Room</mat-label>
              <mat-select formControlName="roomId">
                <mat-option *ngFor="let room of rooms" [value]="room.id">
                  Room {{ room.number }} ({{ room.capacity }} seats)
                </mat-option>
              </mat-select>
              <mat-error *ngIf="screeningForm.get('roomId')?.hasError('required')">
                Select a room
              </mat-error>
            </mat-form-field>

            <div class="form-row">
              <!-- Date Selection -->
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Date</mat-label>
                <input
                  matInput
                  [matDatepicker]="picker"
                  formControlName="date"
                  [min]="minDate"
                >
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="screeningForm.get('date')?.hasError('required')">
                  Select a date
                </mat-error>
              </mat-form-field>

              <!-- Time Selection -->
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Time</mat-label>
                <input
                  matInput
                  type="time"
                  formControlName="time"
                >
                <mat-error *ngIf="screeningForm.get('time')?.hasError('required')">
                  Select a time
                </mat-error>
              </mat-form-field>
            </div>

            <!-- Price -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Price</mat-label>
              <input
                matInput
                type="number"
                formControlName="ticketPrice"
                min="0"
                step="0.01"
              >
              <span matSuffix>€</span>
              <mat-error *ngIf="screeningForm.get('ticketPrice')?.hasError('required')">
                Price is required
              </mat-error>
              <mat-error *ngIf="screeningForm.get('ticketPrice')?.hasError('min')">
                Price cannot be negative
              </mat-error>
            </mat-form-field>

            <mat-divider class="divider"></mat-divider>

            <h3>Additional Options</h3>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Language</mat-label>
                <input matInput formControlName="language">
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Format</mat-label>
                <mat-select formControlName="format">
                  <mat-option value="Digital">Digital</mat-option>
                  <mat-option value="IMAX">IMAX</mat-option>
                  <mat-option value="35mm">35mm</mat-option>
                  <mat-option value="70mm">70mm</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="checkbox-row">
              <mat-checkbox formControlName="is3D">3D</mat-checkbox>
              <mat-checkbox formControlName="hasSubtitles">Subtitles</mat-checkbox>
            </div>

            <div class="form-actions">
              <button type="button" mat-button color="warn" (click)="resetForm()">
                Reset
              </button>
              <button
                type="submit"
                mat-raised-button
                color="primary"
                [disabled]="screeningForm.invalid || saving"
              >
                <mat-icon>save</mat-icon> {{ isEditMode ? 'Update Screening' : 'Schedule Screening' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .screening-create-container {
      padding: 20px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 50px 0;
    }

    .form-row {
      display: flex;
      gap: 20px;
      margin-bottom: 16px;
    }

    .form-field {
      flex: 1;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .divider {
      margin: 24px 0 16px;
    }

    .checkbox-row {
      display: flex;
      gap: 20px;
      margin-bottom: 24px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }

    .movie-option {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .movie-poster {
      width: 30px;
      height: 45px;
      object-fit: cover;
      border-radius: 4px;
    }

    .no-poster {
      width: 30px;
      height: 45px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f0f0f0;
      border-radius: 4px;
    }
  `]
})
export class ScreeningCreateComponent implements OnInit {
  screeningForm: FormGroup;
  movies: Movie[] = [];
  rooms: Room[] = [];
  loading = true;
  saving = false;
  minDate = new Date();
  filteredMovies: Observable<Movie[]> | undefined;
  isEditMode = false;
  screeningId: number | null = null;
  currentScreening: Screening | null = null;

  constructor(
    private fb: FormBuilder,
    private screeningService: ScreeningService,
    private movieService: MovieService,
    private roomService: RoomService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.screeningForm = this.createForm();
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.screeningId = +id;
      this.loadData();
    } else {
      this.loadData();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      movieTitle: ['', Validators.required],
      roomId: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      ticketPrice: [10.0, [Validators.required, Validators.min(0)]],
      is3D: [false],
      hasSubtitles: [false],
      language: ['English'],
      format: ['Digital']
    });
  }

  loadData(): void {
    this.loading = true;

    // Load movies
    this.movieService.getAllMovies().subscribe({
      next: (movies) => {
        this.movies = movies;
        this.setupMovieAutocomplete();

        // Load rooms
        this.roomService.getAllRooms().subscribe({
          next: (rooms) => {
            this.rooms = rooms;

            // If in edit mode, load the screening data
            if (this.isEditMode && this.screeningId) {
              this.loadScreeningData();
            } else {
              this.loading = false;
            }
          },
          error: (error) => {
            this.snackBar.open('Error loading rooms: ' + error.message, 'Close', {
              duration: 5000
            });
            this.loading = false;
          }
        });
      },
      error: (error) => {
        this.snackBar.open('Error loading movies: ' + error.message, 'Close', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }

  loadScreeningData(): void {
    if (!this.screeningId) return;

    this.screeningService.getScreeningById(this.screeningId).subscribe({
      next: (screening) => {
        this.currentScreening = screening;
        this.populateForm(screening);
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading screening: ' + error.message, 'Close', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }

  populateForm(screening: Screening): void {
    // Find the movie object from the movies array
    const movie = this.movies.find(m => m.id === screening.movieId);

    // Parse the date and time from the startTime
    // Convert the string date to a Date object properly
    const startDate = new Date(screening.startTime);

    // Extract hours and minutes directly from the Date object
    const hours = startDate.getHours().toString().padStart(2, '0');
    const minutes = startDate.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    this.screeningForm.patchValue({
      movieTitle: movie || '',
      roomId: screening.roomId,
      date: startDate,
      time: timeString,
      ticketPrice: screening.ticketPrice,
      is3D: screening.is3D || false,
      hasSubtitles: screening.hasSubtitles || false,
      language: screening.language || 'English',
      format: screening.format || 'Digital'
    });
  }

  setupMovieAutocomplete(): void {
    this.filteredMovies = this.screeningForm.get('movieTitle')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const title = typeof value === 'string' ? value : value?.title;
        return title ? this._filterMovies(title) : this.movies.slice();
      })
    );
  }

  private _filterMovies(title: string): Movie[] {
    const filterValue = title.toLowerCase();
    return this.movies.filter(movie => movie.title.toLowerCase().includes(filterValue));
  }

  displayMovieTitle(movie: Movie): string {
    return movie && movie.title ? movie.title : '';
  }

  resetForm(): void {
    this.screeningForm.reset({
      movieTitle: '',
      roomId: '',
      date: '',
      time: '',
      ticketPrice: 10.0,
      is3D: false,
      hasSubtitles: false,
      language: 'English',
      format: 'Digital'
    });
  }

  onSubmit(): void {
    if (this.screeningForm.invalid) {
      return;
    }

    this.saving = true;
    const formValue = this.screeningForm.value;

    // Format date and time
    const date = formValue.date;
    const time = formValue.time;
    const [hours, minutes] = time.split(':');

    // Create the date using the local date and time values
    const startTime = new Date(date);
    startTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    
    // Format date as ISO string but preserve the local time by manually constructing the string
    // This prevents time zone conversion issues
    const year = startTime.getFullYear();
    const month = String(startTime.getMonth() + 1).padStart(2, '0');
    const day = String(startTime.getDate()).padStart(2, '0');
    const formattedHours = String(startTime.getHours()).padStart(2, '0');
    const formattedMinutes = String(startTime.getMinutes()).padStart(2, '0');
    
    // Format: "YYYY-MM-DDTHH:MM:00" (no timezone)
    const localISOString = `${year}-${month}-${day}T${formattedHours}:${formattedMinutes}:00`;

    // Get movie ID from selected movie
    const movieId = typeof formValue.movieTitle === 'object' ? formValue.movieTitle.id : null;

    if (!movieId) {
      this.snackBar.open('Select a valid movie', 'Close', {
        duration: 5000
      });
      this.saving = false;
      return;
    }

    const screeningData = {
      movieId,
      roomId: formValue.roomId,
      startTime: localISOString,
      ticketPrice: formValue.ticketPrice,
      is3D: formValue.is3D,
      hasSubtitles: formValue.hasSubtitles,
      language: formValue.language,
      format: formValue.format
    };

    if (this.isEditMode && this.screeningId) {
      // Update existing screening
      this.screeningService.updateScreening(this.screeningId, screeningData).subscribe({
        next: () => {
          this.snackBar.open('Screening updated successfully', 'Close', {
            duration: 3000
          });
          this.router.navigate(['/admin/screenings']);
        },
        error: (error) => {
          this.snackBar.open('Error updating screening: ' + error.message, 'Close', {
            duration: 5000
          });
          this.saving = false;
        }
      });
    } else {
      // Create new screening
      this.screeningService.createScreening(screeningData).subscribe({
        next: () => {
          this.snackBar.open('Screening scheduled successfully', 'Close', {
            duration: 3000
          });
          this.router.navigate(['/admin/screenings']);
        },
        error: (error) => {
          this.snackBar.open('Error scheduling screening: ' + error.message, 'Close', {
            duration: 5000
          });
          this.saving = false;
        }
      });
    }
  }
}
