import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SeatReservation } from '../models/screening.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  constructor(private http: HttpClient) {}

  getAllReservations(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/reservations`);
  }

  getReservationById(id: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/reservations/${id}`);
  }

  createReservation(reservation: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/reservations`, reservation);
  }

  modifySeats(reservationId: number, seatModification: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/reservations/${reservationId}/seats`, seatModification);
  }

  cancelReservation(reservationId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/reservations/${reservationId}`);
  }

  getReservationsByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/reservations/user/${userId}`);
  }

  getReservationsByScreening(screeningId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/reservations/screening/${screeningId}`);
  }

  // Get all reservations for current user
  getUserReservations(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/reservations/user`);
  }

  // Get all seats for a specific screening
  getScreeningSeats(screeningId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/seats/screening/${screeningId}`);
  }

  // Get available seats for a specific screening
  getAvailableSeats(screeningId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/seats/screening/${screeningId}/available`);
  }
}
