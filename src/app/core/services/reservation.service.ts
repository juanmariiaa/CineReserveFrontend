import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SeatReservation } from '../models/screening.model';

export interface CheckoutSessionResponse {
  checkoutUrl: string;
}

@Injectable({
  providedIn: 'root',
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
    return this.http.post<any>(
      `${environment.apiUrl}/reservations`,
      reservation
    );
  }

  modifySeats(reservationId: number, seatModification: any): Observable<any> {
    return this.http.put<any>(
      `${environment.apiUrl}/reservations/${reservationId}/seats`,
      seatModification
    );
  }

  cancelReservation(reservationId: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/reservations/${reservationId}`
    );
  }

  getReservationsByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.apiUrl}/reservations/user/${userId}`
    );
  }

  getReservationsByScreening(screeningId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.apiUrl}/reservations/screening/${screeningId}`
    );
  }

  // Get all reservations for current user
  getUserReservations(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/reservations/user`);
  }

  // Get all seats for a specific screening
  getScreeningSeats(
    screeningId: number,
    timestamp?: number
  ): Observable<any[]> {
    let url = `${environment.apiUrl}/seats/screening/${screeningId}`;

    // Add timestamp to prevent caching if provided
    if (timestamp) {
      url += `?t=${timestamp}`;
    }

    return this.http.get<any[]>(url);
  }

  // Get available seats for a specific screening
  getAvailableSeats(screeningId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.apiUrl}/seats/screening/${screeningId}/available`
    );
  }

  // Create a Stripe checkout session for a reservation
  createCheckoutSession(
    reservationId: number,
    successUrl?: string,
    cancelUrl?: string
  ): Observable<CheckoutSessionResponse> {
    let url = `${environment.apiUrl}/payments/create-checkout-session/${reservationId}`;

    // Add query parameters if provided
    if (successUrl || cancelUrl) {
      const params = new URLSearchParams();
      if (successUrl) params.append('successUrl', successUrl);
      if (cancelUrl) params.append('cancelUrl', cancelUrl);
      url += `?${params.toString()}`;
    }

    return this.http.post<CheckoutSessionResponse>(url, {});
  }

  // Get reservation status
  getReservationStatus(reservationId: number): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/reservations/${reservationId}/status`
    );
  }

  // Añadir este método para obtener la reserva por ID de sesión de Stripe
  getReservationBySessionId(sessionId: string): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/reservations/by-session/${sessionId}`
    );
  }

  // Añadir este método para obtener los datos del ticket
  getTicketData(reservationId: number): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/reservations/${reservationId}/ticket`
    );
  }
}
