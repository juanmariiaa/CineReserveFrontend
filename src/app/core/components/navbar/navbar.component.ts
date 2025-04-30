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
      <a mat-button routerLink="/dashboard">
        <mat-icon>dashboard</mat-icon> Dashboard
      </a>
      <a mat-button routerLink="/movies">
        <mat-icon>movie</mat-icon> Películas
      </a>
      <a mat-button routerLink="/screenings">
        <mat-icon>event</mat-icon> Funciones
      </a>
      <a mat-button routerLink="/reservations">
        <mat-icon>book</mat-icon> Reservas
      </a>
      <button mat-button (click)="logout()">
        <mat-icon>exit_to_app</mat-icon> Salir
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