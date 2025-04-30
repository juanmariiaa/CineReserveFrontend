import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

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
      <h1>Panel de Administración</h1>
      <div class="dashboard-cards">
        <mat-card routerLink="/movies" class="dashboard-card">
          <mat-card-content>
            <mat-icon class="card-icon">movie</mat-icon>
            <h2>Películas</h2>
            <p>Gestionar películas del catálogo</p>
          </mat-card-content>
        </mat-card>
        
        <mat-card routerLink="/screenings" class="dashboard-card">
          <mat-card-content>
            <mat-icon class="card-icon">event</mat-icon>
            <h2>Funciones</h2>
            <p>Administrar horarios y salas</p>
          </mat-card-content>
        </mat-card>
        
        <mat-card routerLink="/reservations" class="dashboard-card">
          <mat-card-content>
            <mat-icon class="card-icon">book</mat-icon>
            <h2>Reservas</h2>
            <p>Ver y gestionar reservas</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
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
      transition: transform 0.2s;
    }
    
    .dashboard-card:hover {
      transform: translateY(-5px);
    }
    
    .card-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 10px;
    }
  `]
})
export class DashboardComponent {}