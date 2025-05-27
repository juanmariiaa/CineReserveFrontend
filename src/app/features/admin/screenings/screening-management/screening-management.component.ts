import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScreeningService } from '../../../../core/services/screening.service';
import {
  Screening,
  ScreeningBasicDTO,
} from '../../../../core/models/screening.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-screening-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    FormsModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  templateUrl: './screening-management.component.html',
  styleUrls: ['./screening-management.component.scss'],
})
export class ScreeningManagementComponent implements OnInit, AfterViewInit {
  screenings: ScreeningBasicDTO[] = [];
  loading = true;
  displayedColumns: string[] = [
    'id',
    'poster',
    'movie',
    'room',
    'date',
    'time',
    'format',
    'actions',
  ];
  dataSource = new MatTableDataSource<ScreeningBasicDTO>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private screeningService: ScreeningService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadScreenings();
  }

  ngAfterViewInit(): void {
    // This ensures paginator and sort are set after the view is initialized
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadScreenings(): void {
    this.loading = true;
    this.screeningService.getAllScreeningsBasic().subscribe({
      next: (screenings) => {
        this.screenings = screenings;
        this.dataSource.data = this.screenings;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading screenings:', error);
        this.snackBar.open(
          'Error loading screenings. Please try again.',
          'Close',
          {
            duration: 5000,
          }
        );
        this.loading = false;
      },
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  confirmDelete(screening: ScreeningBasicDTO): void {
    const movieTitle = screening.movieTitle || 'Unknown';
    const roomNumber = screening.roomNumber;
    const screeningDate = new Date(screening.startTime).toLocaleDateString();
    const screeningTime = new Date(screening.startTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const message = `Are you sure you want to delete screening for "${movieTitle}" in Room ${roomNumber} on ${screeningDate} at ${screeningTime}?`;

    if (confirm(message)) {
      this.deleteScreening(screening.id);
    }
  }

  deleteScreening(id: number): void {
    this.screeningService.deleteScreening(id).subscribe({
      next: () => {
        this.snackBar.open('Screening deleted successfully', 'Close', {
          duration: 3000,
        });
        this.loadScreenings();
      },
      error: (error) => {
        console.error('Error deleting screening:', error);
        this.snackBar.open(
          'Error deleting screening. Please try again.',
          'Close',
          {
            duration: 5000,
          }
        );
      },
    });
  }
}
