import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface FilterOptions {
  genres: string[];
  durations: { value: string; label: string; min: number; max: number }[];
  ratings: string[];
  timeFrames: { value: string; label: string }[];
  sortOptions: { value: string; label: string }[];
}

@Component({
  selector: 'app-movie-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './movie-filters.component.html',
  styleUrls: ['./movie-filters.component.scss'],
})
export class MovieFiltersComponent {
  @Input() filterOptions!: FilterOptions;
  @Input() searchControl!: FormControl;
  @Input() genreControl!: FormControl;
  @Input() durationControl!: FormControl;
  @Input() ratingControl!: FormControl;
  @Input() timeFrameControl!: FormControl;
  @Input() sortControl!: FormControl;

  @Output() resetFilters = new EventEmitter<void>();

  onResetFilters(): void {
    this.resetFilters.emit();
  }
}
