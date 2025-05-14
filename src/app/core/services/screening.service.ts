import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Screening, ScreeningBasicDTO } from '../models/screening.model';
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
  
  // New method to get all screenings with basic data only
  getAllScreeningsBasic(): Observable<ScreeningBasicDTO[]> {
    return this.http.get<ScreeningBasicDTO[]>(`${environment.apiUrl}/screenings/basic`);
  }

  getScreeningById(id: number): Observable<Screening> {
    return this.http.get<Screening>(`${environment.apiUrl}/screenings/${id}`);
  }
  
  // New method to get a screening by ID with basic data only
  getScreeningBasicById(id: number): Observable<ScreeningBasicDTO> {
    return this.http.get<ScreeningBasicDTO>(`${environment.apiUrl}/screenings/basic/${id}`);
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
  
  // New method to get screenings by movie with basic data only
  getScreeningsByMovieBasic(movieId: number): Observable<ScreeningBasicDTO[]> {
    return this.http.get<ScreeningBasicDTO[]>(`${environment.apiUrl}/screenings/movie/${movieId}/basic`);
  }

  getScreeningsByRoom(roomId: number): Observable<Screening[]> {
    return this.http.get<Screening[]>(`${environment.apiUrl}/screenings/room/${roomId}`);
  }
  
  // New method to get screenings by room with basic data only
  getScreeningsByRoomBasic(roomId: number): Observable<ScreeningBasicDTO[]> {
    return this.http.get<ScreeningBasicDTO[]>(`${environment.apiUrl}/screenings/room/${roomId}/basic`);
  }

  getScreeningsByDate(date: string): Observable<Screening[]> {
    return this.http.get<Screening[]>(`${environment.apiUrl}/screenings/date/${date}`);
  }
  
  // New method to get screenings by date with basic data only
  getScreeningsByDateBasic(date: string): Observable<ScreeningBasicDTO[]> {
    return this.http.get<ScreeningBasicDTO[]>(`${environment.apiUrl}/screenings/date/${date}/basic`);
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
