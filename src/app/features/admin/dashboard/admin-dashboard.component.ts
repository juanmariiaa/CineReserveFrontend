import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styles: [
    `
      .admin-dashboard-container {
        width: 100%;
        color: #ffffff;
      }

      .dashboard-title-container {
        display: flex;
        align-items: center;
        margin-bottom: 30px;
      }

      .dashboard-title-marker {
        width: 5px;
        height: 30px;
        background-color: #ff6b6b;
        margin-right: 10px;
      }

      .dashboard-title {
        color: #ffffff;
        font-size: 24px;
        font-weight: 500;
        margin: 0;
      }

      .admin-dashboard-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 25px;
      }

      .dashboard-card {
        display: flex;
        flex-direction: column;
        cursor: pointer;
        transition: transform 0.2s;
        border-radius: 4px;
        overflow: hidden;
      }

      .dashboard-card:hover {
        transform: translateY(-5px);
      }

      .card-icon-container {
        background-color: #ff6b6b;
        height: 120px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
      }

      .card-icon-container mat-icon {
        font-size: 40px;
        height: 40px;
        width: 40px;
        color: white;
      }

      .card-content {
        padding: 20px;
        text-align: center;
        background-color: #333333;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      h2 {
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 500;
        color: #ffffff;
      }

      p {
        margin: 0;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.7);
      }

      @media (max-width: 768px) {
        .admin-dashboard-cards {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 480px) {
        .admin-dashboard-cards {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AdminDashboardComponent {}
