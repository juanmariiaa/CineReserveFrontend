import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    RouterLink
  ],
  template: `
    <div class="admin-dashboard-container">
      <h1>Administration Panel</h1>

      <div class="admin-dashboard-cards">
        <mat-card routerLink="/admin/movies" class="admin-dashboard-card">
          <mat-card-content>
            <mat-icon class="card-icon">movie</mat-icon>
            <h2>Movies</h2>
            <p>Manage movie catalog</p>
          </mat-card-content>
        </mat-card>

        <mat-card routerLink="/admin/rooms" class="admin-dashboard-card">
          <mat-card-content>
            <mat-icon class="card-icon">weekend</mat-icon>
            <h2>Rooms</h2>
            <p>Configure cinema rooms</p>
          </mat-card-content>
        </mat-card>

        <mat-card routerLink="/admin/screenings" class="admin-dashboard-card">
          <mat-card-content>
            <mat-icon class="card-icon">event</mat-icon>
            <h2>Screenings</h2>
            <p>Schedule movie screenings</p>
          </mat-card-content>
        </mat-card>

        <mat-card routerLink="/admin/reservations" class="admin-dashboard-card">
          <mat-card-content>
            <mat-icon class="card-icon">book</mat-icon>
            <h2>Reservations</h2>
            <p>Manage customer reservations</p>
          </mat-card-content>
        </mat-card>

        <mat-card routerLink="/admin/users" class="admin-dashboard-card">
          <mat-card-content>
            <mat-icon class="card-icon">people</mat-icon>
            <h2>Users</h2>
            <p>Manage user accounts</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard-container {
      padding: 20px;
    }

    .admin-dashboard-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .admin-dashboard-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      height: 100%;
    }

    .admin-dashboard-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 10px rgba(0,0,0,0.15);
    }

    .card-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
      color: #3f51b5;
    }

    mat-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 24px;
    }

    h2 {
      margin: 0 0 8px;
      font-size: 24px;
    }

    p {
      margin: 0;
      color: rgba(0, 0, 0, 0.6);
    }
  `]
})
export class AdminDashboardComponent {}
