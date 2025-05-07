import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room } from '../models/screening.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  constructor(private http: HttpClient) {}

  getAllRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(`${environment.apiUrl}/rooms`);
  }

  getRoomById(id: number): Observable<Room> {
    return this.http.get<Room>(`${environment.apiUrl}/rooms/${id}`);
  }

  getRoomByNumber(number: number): Observable<Room> {
    return this.http.get<Room>(`${environment.apiUrl}/rooms/number/${number}`);
  }

  createRoom(room: any): Observable<Room> {
    return this.http.post<Room>(`${environment.apiUrl}/rooms`, room);
  }

  deleteRoom(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/rooms/${id}`);
  }

  deleteLastRoom(): Observable<Room> {
    return this.http.delete<Room>(`${environment.apiUrl}/rooms/delete-highest`);
  }
}
