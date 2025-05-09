import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatToolbarModule,
    MatCardModule,
    RouterLink
  ],
  template: `
      <mat-toolbar class="header-toolbar">
        <span>CineReserve</span>
        <span class="spacer"></span>
        <div *ngIf="!isLoggedIn">
          <button mat-button routerLink="/login">Login</button>
          <button mat-raised-button routerLink="/register">Register</button>
        </div>
        <div *ngIf="isLoggedIn">
          <button mat-button *ngIf="isAdmin" routerLink="/admin/dashboard">Admin Dashboard</button>
          <button mat-button *ngIf="!isAdmin" routerLink="/movies">View Movies</button>
          <button mat-button (click)="logout()">Logout</button>
        </div>
      </mat-toolbar>
  `,
  styles: [`
    
    .header-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .content {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 30px;
    }
    
    .welcome-card {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
      padding: 20px;
    }
    
  `]
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
    
    // Subscribe to auth changes
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isAdmin = this.authService.isAdmin();
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
} 