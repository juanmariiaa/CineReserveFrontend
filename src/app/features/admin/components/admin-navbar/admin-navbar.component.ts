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
  template: `
    <mat-toolbar color="primary" class="admin-toolbar">
      <button mat-icon-button class="menu-icon" (click)="toggleSidenav()">
        <mat-icon>menu</mat-icon>
      </button>
      <span class="title">Admin Dashboard</span>
      <span class="spacer"></span>
      <span class="username">{{ username }}</span>
      <button mat-icon-button (click)="logout()" class="logout-btn">
        <mat-icon>exit_to_app</mat-icon>
      </button>
    </mat-toolbar>

    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav
        #sidenav
        [mode]="'side'"
        [opened]="sidenavOpen"
        class="admin-sidenav"
      >
        <mat-nav-list>
          <a
            mat-list-item
            routerLink="/admin/dashboard"
            routerLinkActive="active"
          >
            <mat-icon>dashboard</mat-icon> Dashboard
          </a>
          <a mat-list-item routerLink="/admin/movies" routerLinkActive="active">
            <mat-icon>movie</mat-icon> Movies
          </a>
          <a
            mat-list-item
            routerLink="/admin/screenings"
            routerLinkActive="active"
          >
            <mat-icon>theaters</mat-icon> Screenings
          </a>
          <a mat-list-item routerLink="/admin/rooms" routerLinkActive="active">
            <mat-icon>weekend</mat-icon> Rooms
          </a>
          <a mat-list-item routerLink="/admin/users" routerLinkActive="active">
            <mat-icon>people</mat-icon> Users
          </a>
          <a
            mat-list-item
            routerLink="/admin/reservations"
            routerLinkActive="active"
          >
            <mat-icon>book_online</mat-icon> Reservations
          </a>
          <a
            mat-list-item
            routerLink="/admin/reports"
            routerLinkActive="active"
          >
            <mat-icon>bar_chart</mat-icon> Reports
          </a>
          <a mat-list-item routerLink="/" class="return-link">
            <mat-icon>home</mat-icon> Back to Site
          </a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content [style.marginLeft.px]="sidenavOpen ? 200 : 0">
        <ng-content></ng-content>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
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
        background-color: #121212;
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

      .user-btn {
        margin-right: 8px;
        color: #ffffff;
      }

      .menu-icon {
        color: #ffffff;
      }

      .logout-btn {
        color: #ffffff;
      }

      .logout-btn mat-icon {
        color: #ffffff;
      }

      .sidenav-container {
        position: fixed;
        top: 64px;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: #181818;
      }

      .admin-sidenav {
        width: 200px;
        background-color: #202020;
        border-right: 1px solid #303030;
        color: #ffffff;
      }

      .mat-nav-list a {
        display: flex;
        align-items: center;
        height: 48px;
        color: #ffffff;
        border-bottom: 1px solid #252525;
      }

      .mat-nav-list a mat-icon {
        margin-right: 16px;
        color: #ffffff;
      }

      .mat-nav-list a.active {
        background-color: #252525;
        color: #00b020;
        font-weight: 500;
        border-left: 3px solid #00b020;
      }

      .mat-nav-list a.active mat-icon {
        color: #00b020;
      }

      .mat-nav-list a:hover {
        background-color: #252525;
      }

      .return-link {
        margin-top: 16px;
        border-top: 1px solid #303030;
        color: #00b020 !important;
      }

      .return-link mat-icon {
        color: #00b020 !important;
      }

      /* Angular Material overrides */
      ::ng-deep .mat-toolbar {
        background-color: #121212 !important;
        color: #ffffff !important;
      }

      ::ng-deep .mat-drawer-container {
        background-color: #181818 !important;
        color: #ffffff !important;
      }

      ::ng-deep .mat-drawer {
        background-color: #202020 !important;
        color: #ffffff !important;
      }

      ::ng-deep .mat-mdc-list-item {
        color: #ffffff !important;
      }

      ::ng-deep .mdc-list-item__primary-text {
        color: #ffffff !important;
      }

      ::ng-deep .mat-mdc-list-item-icon {
        color: #ffffff !important;
      }

      /* Forzar color de texto en elementos del listado */
      ::ng-deep .mat-mdc-list-item .mdc-list-item__primary-text {
        color: #ffffff !important;
      }

      ::ng-deep .mat-mdc-list-item .mat-icon {
        color: #ffffff !important;
      }

      ::ng-deep .mat-mdc-list-item.active .mdc-list-item__primary-text {
        color: #00b020 !important;
      }

      ::ng-deep .mat-mdc-list-item.active .mat-icon {
        color: #00b020 !important;
      }

      /* Asegurarse de que todos los textos sean blancos */
      ::ng-deep .mat-mdc-button,
      ::ng-deep .mat-mdc-raised-button,
      ::ng-deep .mat-mdc-outlined-button,
      ::ng-deep .mat-mdc-icon-button {
        color: #ffffff !important;
      }

      ::ng-deep .mat-mdc-menu-item {
        color: #ffffff !important;
      }

      ::ng-deep .mat-mdc-card-title,
      ::ng-deep .mat-mdc-card-subtitle,
      ::ng-deep .mat-mdc-card-content {
        color: #ffffff !important;
      }

      ::ng-deep .mat-mdc-paginator,
      ::ng-deep .mat-mdc-paginator-page-size-label,
      ::ng-deep .mat-mdc-paginator-range-label {
        color: #ffffff !important;
      }

      ::ng-deep .mat-mdc-table {
        color: #ffffff !important;
        background-color: #222222 !important;
      }

      ::ng-deep .mat-mdc-header-cell,
      ::ng-deep .mat-mdc-cell {
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
