import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NavbarComponent
  ],
  template: `
    <div class="payment-success-container">
      <app-navbar></app-navbar>
      
      <div class="content">
        <mat-card class="success-card">
          <mat-card-content>
            <div class="success-icon">
              <mat-icon color="primary">check_circle</mat-icon>
            </div>
            
            <h1>Payment Successful!</h1>
            
            <p>Your reservation has been confirmed and your tickets are now ready.</p>
            
            <div class="actions">
              <button mat-raised-button color="primary" routerLink="/my-reservations">
                View My Reservations
              </button>
              
              <button mat-button routerLink="/">
                Return to Home
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: `
    .payment-success-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .content {
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
      padding: 2rem;
    }
    
    .success-card {
      max-width: 500px;
      width: 100%;
      text-align: center;
      padding: 2rem;
    }
    
    .success-icon {
      margin-bottom: 1.5rem;
    }
    
    .success-icon mat-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
    }
    
    h1 {
      margin-bottom: 1.5rem;
      color: #2e7d32;
    }
    
    p {
      margin-bottom: 2rem;
      font-size: 1.1rem;
      color: #555;
    }
    
    .actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    @media (min-width: 600px) {
      .actions {
        flex-direction: row;
        justify-content: center;
      }
    }
  `
})
export class PaymentSuccessComponent implements OnInit {
  
  constructor(private router: Router) {}
  
  ngOnInit(): void {
    // You could potentially verify the payment status here
    // by checking a query parameter or making an API call
  }
}
