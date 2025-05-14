import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room, RoomBasicDTO } from '../models/room.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  constructor(private http: HttpClient) {}

  getAllRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(`${environment.apiUrl}/rooms`);
  }

  getAllRoomsBasic(): Observable<RoomBasicDTO[]> {
    return this.http.get<RoomBasicDTO[]>(`${environment.apiUrl}/rooms/basic`);
  }

  getRoomById(id: number): Observable<Room> {
    return this.http.get<Room>(`${environment.apiUrl}/rooms/${id}`);
  }

  getRoomBasicById(id: number): Observable<RoomBasicDTO> {
    return this.http.get<RoomBasicDTO>(`${environment.apiUrl}/rooms/basic/${id}`);
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
