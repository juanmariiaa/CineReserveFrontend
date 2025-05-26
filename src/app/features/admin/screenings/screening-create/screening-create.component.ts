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
  templateUrl: './screening-create.component.html',
  styleUrls: ['./screening-create.component.scss'],
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
