import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-allowed',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterLink
  ],
  template: `
    <div class="not-allowed-container">
      <mat-card class="not-allowed-card">
        <mat-card-header>
          <mat-icon color="warn" class="not-allowed-icon">block</mat-icon>
          <mat-card-title>Access Denied</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>You do not have permission to access this section.</p>
          <p>This area is reserved for administrators only.</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" routerLink="/">Return to Home Page</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .not-allowed-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f5f5f5;
    }
    
    .not-allowed-card {
      max-width: 400px;
      text-align: center;
      padding: 2rem;
    }
    
    .not-allowed-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 1rem;
    }
    
    mat-card-title {
      font-size: 24px;
      margin-bottom: 1rem;
    }
    
    mat-card-content {
      font-size: 16px;
      margin-bottom: 1.5rem;
    }
    
    mat-card-actions {
      display: flex;
      justify-content: center;
    }
  `]
})
export class NotAllowedComponent {} 