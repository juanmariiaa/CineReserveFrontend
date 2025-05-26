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
  styles: [
    `
      .admin-toolbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 100;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
        height: 64px;
        background-color: #272727 !important;
        color: #ffffff;
      }

      .title {
        font-size: 1.2rem;
        font-weight: 500;
        margin-left: 8px;
        color: #ffffff;
      }

      .spacer {
        flex: 1 1 auto;
      }

      .username {
        font-size: 0.9rem;
        margin-right: 16px;
        color: #ffffff;
      }

      .menu-icon {
        color: #ffffff;
      }

      .logout-btn {
        color: #ffffff;
      }

      .sidenav-container {
        position: fixed;
        top: 64px;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: #3c3b34;
      }

      .content-wrapper {
        min-height: calc(100vh - 64px);
        padding: 20px;
        box-sizing: border-box;
      }

      .admin-sidenav {
        width: 200px;
        background-color: #272727;
        border-right: none;
        color: #ffffff;
      }

      .nav-list {
        padding: 16px 0;
      }

      .nav-item {
        display: flex;
        align-items: center;
        height: 48px;
        padding: 0 16px;
        margin: 4px 8px;
        border-radius: 4px;
        text-decoration: none;
        color: #ffffff;
        transition: background-color 0.2s;
      }

      .nav-icon-container {
        margin-right: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
      }

      .nav-icon-container mat-icon {
        color: #ffffff;
      }

      .nav-item:hover:not(.active) {
        background-color: rgba(255, 255, 255, 0.05);
      }

      .nav-item.active {
        background-color: #ff6b6b;
        color: #ffffff;
        font-weight: 500;
      }

      .nav-item.active .nav-icon-container mat-icon {
        color: #ffffff;
      }

      .nav-divider {
        height: 1px;
        background-color: #444444;
        margin: 8px 16px;
      }

      .return-link {
        color: #ff6b6b !important;
      }

      .return-link .nav-icon-container mat-icon {
        color: #ff6b6b;
      }

      /* Angular Material overrides */
      ::ng-deep .mat-toolbar {
        background-color: #272727 !important;
        color: #ffffff !important;
      }

      ::ng-deep .mat-drawer-container {
        background-color: #3c3b34 !important;
        color: #ffffff !important;
      }

      ::ng-deep .mat-drawer {
        background-color: #272727 !important;
        color: #ffffff !important;
      }

      ::ng-deep .mat-mdc-list-item {
        color: #ffffff !important;
      }
    `,
  ],
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
