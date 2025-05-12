import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    RouterLink
  ],
  template: `
    <div class="dashboard-container">
      <h1>Administration Panel</h1>

      <div *ngIf="isAdmin" class="admin-section">
        <h2>Administration</h2>
        <div class="dashboard-cards">
          <mat-card routerLink="/admin/movies" class="dashboard-card admin-card">
            <mat-card-content>
              <mat-icon class="card-icon">movie</mat-icon>
              <h2>Movie Management</h2>
              <p>Manage movie catalog</p>
            </mat-card-content>
          </mat-card>

          <mat-card routerLink="/admin/rooms" class="dashboard-card admin-card">
            <mat-card-content>
              <mat-icon class="card-icon">weekend</mat-icon>
              <h2>Room Management</h2>
              <p>Configure cinema rooms</p>
            </mat-card-content>
          </mat-card>

          <mat-card routerLink="/admin/screenings" class="dashboard-card admin-card">
            <mat-card-content>
              <mat-icon class="card-icon">event</mat-icon>
              <h2>Screening Management</h2>
              <p>Schedule movie screenings</p>
            </mat-card-content>
          </mat-card>

          <mat-card routerLink="/admin/reservations" class="dashboard-card admin-card">
            <mat-card-content>
              <mat-icon class="card-icon">book</mat-icon>
              <h2>Reservation Management</h2>
              <p>Manage customer reservations</p>
            </mat-card-content>
          </mat-card>

          <mat-card routerLink="/admin/users" class="dashboard-card admin-card">
            <mat-card-content>
              <mat-icon class="card-icon">people</mat-icon>
              <h2>User Management</h2>
              <p>Manage user accounts</p>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <h2>Quick Access</h2>
      <div class="dashboard-cards">
        <mat-card routerLink="/movies" class="dashboard-card">
          <mat-card-content>
            <mat-icon class="card-icon">movie</mat-icon>
            <h2>Movies</h2>
            <p>View movie catalog</p>
          </mat-card-content>
        </mat-card>

        <mat-card routerLink="/screenings" class="dashboard-card">
          <mat-card-content>
            <mat-icon class="card-icon">event</mat-icon>
            <h2>Screenings</h2>
            <p>View available showtimes</p>
          </mat-card-content>
        </mat-card>

        <mat-card routerLink="/reservations" class="dashboard-card">
          <mat-card-content>
            <mat-icon class="card-icon">book</mat-icon>
            <h2>My Reservations</h2>
            <p>View my current reservations</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      background-color: #181818;
      color: #FFFFFF;
      min-height: 100vh;
    }

    h1, h2 {
      margin-top: 30px;
      margin-bottom: 15px;
      color: #FFFFFF;
      font-weight: 500;
    }

    .admin-section {
      margin-top: 20px;
      padding: 20px;
      background-color: #222222;
      border-radius: 8px;
      border-left: 4px solid #00B020;
    }

    .admin-section h2 {
      margin-top: 0;
    }

    .dashboard-cards {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-top: 20px;
    }

    .dashboard-card {
      width: 300px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      background-color: #2c2c2c;
      border: 1px solid #3a3a3a;
    }

    .dashboard-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 10px rgba(0,0,0,0.3);
      border-color: rgba(0, 176, 32, 0.6);
    }

    .admin-card {
      border-left: 4px solid #00B020;
    }

    .card-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
      color: #00B020;
    }

    mat-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 24px;
    }

    mat-card-content h2 {
      margin: 0 0 8px;
      font-size: 20px;
      color: #FFFFFF;
    }

    mat-card-content p {
      margin: 0;
      color: rgba(255, 255, 255, 0.7);
    }
  `]
})
export class DashboardComponent implements OnInit {
  isAdmin = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
  }
}
