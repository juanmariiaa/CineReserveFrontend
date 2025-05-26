import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/${id}`);
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/users/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/users/${id}`);
  }

  changeUserRole(id: number, roles: string[]): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/users/${id}/roles`, { roles });
  }

  giveAdminRole(id: number): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/users/${id}/admin`, {});
  }

  activateUser(id: number): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/users/${id}/activate`, {});
  }

  deactivateUser(id: number): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/users/${id}/deactivate`, {});
  }
}
