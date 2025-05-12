import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Screening } from '../models/screening.model';
import { environment } from '../../../environments/environment';

export interface ScreeningDateDTO {
  movieId: number;
  movieTitle: string;
  availableDates: string[]; // ISO date strings
}

export interface ScreeningTimeSlot {
  screeningId: number;
  startTime: string; // LocalTime as ISO string
  format: string;
  is3D: boolean;
  language: string;
  hasSubtitles: boolean;
  roomNumber: number;
  availableSeats: number;
  ticketPrice: number;
}

export interface ScreeningTimeDTO {
  movieId: number;
  movieTitle: string;
  date: string; // ISO date string
  timeSlots: ScreeningTimeSlot[];
}

@Injectable({
  providedIn: 'root'
})
export class ScreeningService {
  constructor(private http: HttpClient) {}

  getAllScreenings(): Observable<Screening[]> {
    return this.http.get<Screening[]>(`${environment.apiUrl}/screenings`);
  }

  getScreeningById(id: number): Observable<Screening> {
    return this.http.get<Screening>(`${environment.apiUrl}/screenings/${id}`);
  }

  createScreening(screening: any): Observable<Screening> {
    return this.http.post<Screening>(`${environment.apiUrl}/screenings`, screening);
  }

  updateScreening(id: number, screening: any): Observable<Screening> {
    return this.http.put<Screening>(`${environment.apiUrl}/screenings/${id}`, screening);
  }

  deleteScreening(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/screenings/${id}`);
  }

  getScreeningsByMovie(movieId: number): Observable<Screening[]> {
    return this.http.get<Screening[]>(`${environment.apiUrl}/screenings/movie/${movieId}`);
  }

  getScreeningsByRoom(roomId: number): Observable<Screening[]> {
    return this.http.get<Screening[]>(`${environment.apiUrl}/screenings/room/${roomId}`);
  }

  getScreeningsByDate(date: string): Observable<Screening[]> {
    return this.http.get<Screening[]>(`${environment.apiUrl}/screenings/date/${date}`);
  }
  
  // New methods for date-based scheduling
  
  getAvailableDatesForMovie(movieId: number): Observable<ScreeningDateDTO> {
    return this.http.get<ScreeningDateDTO>(`${environment.apiUrl}/screenings/movie/${movieId}/dates`);
  }
  
  getScreeningsByMovieAndDate(movieId: number, date: string): Observable<ScreeningTimeDTO> {
    return this.http.get<ScreeningTimeDTO>(`${environment.apiUrl}/screenings/movie/${movieId}/date/${date}`);
  }
  
  getScreeningsByMovieForDateRange(movieId: number, startDate: string, endDate: string): Observable<ScreeningTimeDTO[]> {
    return this.http.get<ScreeningTimeDTO[]>(
      `${environment.apiUrl}/screenings/movie/${movieId}/daterange`,
      { params: { startDate, endDate } }
    );
  }
}
