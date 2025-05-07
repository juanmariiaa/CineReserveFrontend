import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary">
      <span>Cine Admin</span>
      <div class="spacer"></div>
      <a mat-button routerLink="/admin/dashboard">
        <mat-icon>dashboard</mat-icon> Dashboard
      </a>
      <a mat-button routerLink="/admin/movies">
        <mat-icon>movie</mat-icon> Movies
      </a>
      <a mat-button routerLink="/admin/screenings">
        <mat-icon>event</mat-icon> Screenings
      </a>
      <a mat-button routerLink="/admin/reservations">
        <mat-icon>book</mat-icon> Reservations
      </a>
      <a mat-button routerLink="/admin/users">
        <mat-icon>people</mat-icon> Users
      </a>
      <button mat-button (click)="logout()">
        <mat-icon>exit_to_app</mat-icon> Exit
      </button>
    </mat-toolbar>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }

    a {
      margin: 0 8px;
    }
  `]
})
export class NavbarComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
