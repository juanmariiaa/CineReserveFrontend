import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Screening } from '../models/screening.model';
import { environment } from '../../../environments/environment';

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
}
