import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ScreeningService } from '../../../../core/services/screening.service';
import { MovieService } from '../../../../core/services/movie.service';
import { RoomService } from '../../../../core/services/room.service';
import { Movie } from '../../../../core/models/movie.model';
import { Screening } from '../../../../core/models/screening.model';
import { Room, RoomBasicDTO } from '../../../../core/models/room.model';
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
      <div class="dashboard-title-container">
        <div class="dashboard-title-marker"></div>
        <h1 class="dashboard-title">{{ isEditMode ? 'Edit Screening' : 'Schedule New Screening' }}</h1>
      </div>

      <div class="action-bar">
        <button mat-raised-button routerLink="/admin/screenings">
          <mat-icon>arrow_back</mat-icon> Back to Screenings
        </button>
      </div>

      <div *ngIf="loading" class="loading-spinner">
        <mat-spinner class="accent-spinner"></mat-spinner>
      </div>

      <mat-card *ngIf="!loading" class="form-card">
        <mat-card-content>
          <form [formGroup]="screeningForm" (ngSubmit)="onSubmit()">
            <!-- Movie Selection with Autocomplete -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Movie</mat-label>
              <input
                type="text"
                matInput
                formControlName="movieTitle"
                [matAutocomplete]="autoMovie"
                placeholder="Search for a movie..."
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
                Movie selection is required
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
                Room selection is required
              </mat-error>
            </mat-form-field>

            <div class="form-row">
              <!-- Date Selection -->
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Date</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="date" [min]="minDate">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="screeningForm.get('date')?.hasError('required')">
                  Date is required
                </mat-error>
              </mat-form-field>

              <!-- Time Selection -->
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Time</mat-label>
                <input matInput type="time" formControlName="time">
                <mat-error *ngIf="screeningForm.get('time')?.hasError('required')">
                  Time is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <!-- Language -->
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Language</mat-label>
                <input matInput formControlName="language" placeholder="e.g., English, Spanish, etc.">
              </mat-form-field>

              <!-- Format -->
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Format</mat-label>
                <mat-select formControlName="format">
                  <mat-option value="Digital">Digital</mat-option>
                  <mat-option value="IMAX">IMAX</mat-option>
                  <mat-option value="35mm">35mm Film</mat-option>
                  <mat-option value="70mm">70mm Film</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="feature-options">
              <h3>Additional Features</h3>
              <div class="checkbox-row">
                <!-- 3D Checkbox -->
                <mat-checkbox formControlName="is3D" color="accent">3D Screening</mat-checkbox>

                <!-- Subtitles Checkbox -->
                <mat-checkbox formControlName="hasSubtitles" color="accent">With Subtitles</mat-checkbox>
              </div>
            </div>

            <div class="form-actions">
              <button mat-button type="button" (click)="resetForm()" [disabled]="saving">
                Reset Form
              </button>
              <button mat-raised-button class="accent-bg" type="submit" [disabled]="screeningForm.invalid || saving">
                {{ isEditMode ? 'Update' : 'Schedule' }} Screening
                <mat-spinner *ngIf="saving" diameter="20" class="button-spinner"></mat-spinner>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .screening-create-container {
      width: 100%;
      color: #ffffff;
      background-color: transparent;
    }

    .dashboard-title-container {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
    }

    .dashboard-title-marker {
      width: 5px;
      height: 30px;
      background-color: #ff6b6b;
      margin-right: 10px;
    }

    .dashboard-title {
      color: #ffffff;
      font-size: 24px;
      font-weight: 500;
      margin: 0;
    }
    
    .action-bar {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-bottom: 20px;
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 50px;
    }
    
    .accent-spinner ::ng-deep circle {
      stroke: #ff6b6b !important;
    }
    
    .button-spinner {
      display: inline-block;
      margin-left: 8px;
    }
    
    .form-card {
      border-radius: 8px;
      overflow: hidden;
      background-color: #333333 !important;
      margin-bottom: 20px;
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

    .feature-options {
      background-color: rgba(255, 107, 107, 0.1);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
    }
    
    .feature-options h3 {
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 500;
    }

    .checkbox-row {
      display: flex;
      gap: 16px;
      margin-bottom: 10px;
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
      border-radius: 3px;
    }

    .no-poster {
      width: 30px;
      height: 45px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #444444;
      border-radius: 3px;
    }
    
    .accent-bg {
      background-color: #ff6b6b !important;
      color: white !important;
    }

    ::ng-deep .mat-mdc-card {
      background-color: #333333 !important;
      color: #ffffff !important;
    }

    ::ng-deep .mat-mdc-form-field-label {
      color: rgba(255, 255, 255, 0.6) !important;
    }

    ::ng-deep .mat-mdc-input-element {
      color: #ffffff !important;
    }

    ::ng-deep .mat-mdc-form-field-infix input, 
    ::ng-deep .mat-mdc-form-field-infix textarea {
      color: #ffffff !important;
    }

    ::ng-deep .mat-mdc-icon {
      color: rgba(255, 255, 255, 0.7);
    }

    ::ng-deep .mat-mdc-raised-button:not(.accent-bg) {
      background-color: #444444 !important;
      color: #ffffff !important;
    }

    ::ng-deep .mat-mdc-button {
      color: rgba(255, 255, 255, 0.7) !important;
    }

    ::ng-deep .mat-mdc-datepicker-toggle {
      color: rgba(255, 255, 255, 0.7) !important;
    }

    ::ng-deep .mat-mdc-checkbox .mdc-checkbox .mdc-checkbox__native-control:enabled:checked ~ .mdc-checkbox__background {
      background-color: #ff6b6b !important;
      border-color: #ff6b6b !important;
    }
    
    ::ng-deep .mat-mdc-checkbox .mdc-checkbox .mdc-checkbox__native-control:enabled ~ .mdc-checkbox__background {
      border-color: rgba(255, 255, 255, 0.7) !important;
    }
    
    ::ng-deep .mat-calendar {
      background-color: #333333 !important;
      color: #ffffff !important;
    }
    
    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
        gap: 0;
      }
      
      .checkbox-row {
        flex-direction: column;
        gap: 8px;
      }
    }

    ::ng-deep .mat-calendar-body-selected {
      background-color: #00B020 !important;
    }

    ::ng-deep .mat-calendar-body-cell-content {
      color: #FFFFFF !important;
    }

    ::ng-deep .mat-icon {
      color: rgba(255, 255, 255, 0.7);
    }

    ::ng-deep .mat-raised-button.mat-primary {
      background-color: #00B020;
    }

    ::ng-deep .mat-raised-button.mat-accent {
      background-color: #2c2c2c;
      color: #FFFFFF;
    }

    ::ng-deep .mat-button.mat-warn {
      color: #f44336;
    }
  `]
})
export class ScreeningCreateComponent implements OnInit {
  screeningForm: FormGroup;
  movies: Movie[] = [];
  rooms: RoomBasicDTO[] = [];
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
      is3D: [false],
      hasSubtitles: [false],
      language: ['English'],
      format: ['Digital']
    });
  }

  loadData(): void {
    this.loading = true;

    // Get movies for autocomplete
    this.movieService.getAllMovies().subscribe({
      next: (movies) => {
        this.movies = movies;
        this.setupMovieAutocomplete();

        // Get rooms with basic data only
        this.roomService.getAllRoomsBasic().subscribe({
          next: (rooms) => {
            this.rooms = rooms;

            if (this.isEditMode && this.screeningId) {
              this.loadScreeningData();
            } else {
              this.loading = false;
            }
          },
          error: (error) => {
            console.error('Error loading rooms:', error);
            this.snackBar.open('Failed to load rooms. Please try again.', 'Close', { duration: 3000 });
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading movies:', error);
        this.snackBar.open('Failed to load movies. Please try again.', 'Close', { duration: 3000 });
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
    // Find the movie in the movies array by ID
    const movie = this.movies.find(m => m.id === screening.movieId);
    
    if (!movie) {
      console.error('Movie not found for screening:', screening);
      this.snackBar.open('Error: Movie not found for this screening', 'Close', {
        duration: 5000
      });
      return;
    }

    // Format the date and time for the form
    const screeningDate = new Date(screening.startTime);
    const date = screeningDate;
    const hours = String(screeningDate.getHours()).padStart(2, '0');
    const minutes = String(screeningDate.getMinutes()).padStart(2, '0');
    const time = `${hours}:${minutes}`;

    // Populate the form with existing values
    this.screeningForm.patchValue({
      movieTitle: movie,
      roomId: screening.roomId,
      date: date,
      time: time,
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
      is3D: formValue.is3D,
      hasSubtitles: formValue.hasSubtitles,
      language: formValue.language,
      format: formValue.format
    };

    // Debug log to see what data is being sent
    console.log('Sending screening data:', screeningData);

    if (this.isEditMode && this.screeningId) {
      // Update existing screening
      this.screeningService.updateScreening(this.screeningId, screeningData).subscribe({
        next: (response) => {
          console.log('Screening updated successfully:', response);
          this.snackBar.open('Screening updated successfully', 'Close', {
            duration: 3000
          });
          this.router.navigate(['/admin/screenings']);
        },
        error: (error) => {
          console.error('Error updating screening:', error);
          this.saving = false;
          // Simple generic error message
          this.snackBar.open('Error updating screening. Please try again.', 'Close', {
            duration: 3000
          });
        }
      });
    } else {
      // Create new screening
      this.screeningService.createScreening(screeningData).subscribe({
        next: (response) => {
          console.log('Screening created successfully:', response);
          this.snackBar.open('Screening scheduled successfully', 'Close', {
            duration: 3000
          });
          this.router.navigate(['/admin/screenings']);
        },
        error: (error) => {
          console.error('Error creating screening:', error);
          this.saving = false;
          // Simple generic error message
          this.snackBar.open('Error creating screening. Please try again.', 'Close', {
            duration: 3000
          });
        }
      });
    }
  }
}
