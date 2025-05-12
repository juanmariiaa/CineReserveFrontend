import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, RouterLink],
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
  styles: [
    `
      .admin-dashboard-container {
        padding: 20px;
        background-color: #181818;
        color: #ffffff;
        min-height: 100vh;
        width: 100%;
      }

      h1 {
        color: #ffffff;
        margin-bottom: 20px;
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
        background-color: #2c2c2c;
        border: 1px solid #3a3a3a;
        border-left: 4px solid #00b020;
      }

      .admin-dashboard-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 6px 10px rgba(0, 0, 0, 0.3);
        border-color: rgba(0, 176, 32, 0.6);
      }

      .card-icon {
        font-size: 48px;
        height: 48px;
        width: 48px;
        margin-bottom: 16px;
        color: #00b020;
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
        color: #ffffff;
      }

      p {
        margin: 0;
        color: #ffffff;
      }

      /* Angular Material overrides */
      ::ng-deep .mat-mdc-card {
        background-color: #2c2c2c !important;
        color: #ffffff !important;
        border: 1px solid #3a3a3a !important;
      }

      ::ng-deep .mat-mdc-card-content {
        color: #ffffff !important;
      }

      /* Asegurar que todos los elementos del dashboard usen el tema oscuro */
      ::ng-deep .admin-dashboard-container * {
        color: #ffffff;
      }

      ::ng-deep .mat-mdc-button-touch-target {
        background-color: transparent !important;
      }
    `,
  ],
})
export class AdminDashboardComponent {}
