import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './core/components/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <app-navbar *ngIf="authService.isLoggedIn()"></app-navbar>
    <div class="container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      margin: 0 auto;
      max-width: 1200px;
    }
  `]
})
export class AppComponent implements OnInit {
  constructor(public authService: AuthService) {}

  ngOnInit() {
    console.log('App iniciada. Usuario autenticado:', this.authService.isLoggedIn());
    if (this.authService.isLoggedIn()) {
      // Log para depuración
      console.log('Usuario actual:', this.authService.currentUser$);
    }
  }
}