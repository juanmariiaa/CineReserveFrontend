import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    NavbarComponent
  ],
  templateUrl: './payment-cancel.component.html',
  styles: `
    .payment-cancel-container {
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
    
    .cancel-card {
      max-width: 500px;
      width: 100%;
      text-align: center;
      padding: 2rem;
    }
    
    .cancel-icon {
      margin-bottom: 1.5rem;
    }
    
    .cancel-icon mat-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
    }
    
    h1 {
      margin-bottom: 1.5rem;
      color: #d32f2f;
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
export class PaymentCancelComponent implements OnInit {
  
  constructor(private router: Router) {}
  
  ngOnInit(): void {
    // You could potentially handle any cleanup here
    // or redirect the user after a delay
  }
}
