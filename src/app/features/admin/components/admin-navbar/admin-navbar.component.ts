import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
  ],
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.scss'],
})
export class AdminNavbarComponent {
  sidenavOpen = true;
  username = '';

  constructor(private authService: AuthService) {
    const userData = this.authService.getUserData();
    this.username = userData?.username || '';
  }

  toggleSidenav(): void {
    this.sidenavOpen = !this.sidenavOpen;
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/';
  }
}
