import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AdminNavbarComponent } from '../components/admin-navbar/admin-navbar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AdminNavbarComponent],
  templateUrl: './admin-layout.component.html',
  styles: [
    `
      .admin-layout {
        min-height: 100vh;
        background-color: #3c3b34;
        color: #ffffff;
      }

      .admin-content {
        padding: 20px;
        margin-top: 64px; /* Match the height of the admin toolbar */
        background-color: #3c3b34;
        color: #ffffff;
        min-height: calc(100vh - 64px);
        box-sizing: border-box;
      }

      ::ng-deep body {
        background-color: #3c3b34 !important;
        color: #ffffff !important;
        margin: 0;
        padding: 0;
      }

      ::ng-deep .mat-mdc-card {
        background-color: #333333 !important;
        color: #ffffff !important;
        border-radius: 8px !important;
        overflow: hidden !important;
      }

      ::ng-deep .mat-mdc-card-content {
        color: #ffffff !important;
      }
      
      /* Make sure admin dashboard has consistent styling */
      ::ng-deep .admin-dashboard-container {
        padding: 0 !important;
        margin: 0 !important;
        background-color: transparent !important;
      }

      /* Estilos adicionales para asegurar consistencia de colores en toda la aplicación */
      ::ng-deep .mat-mdc-form-field {
        color: #ffffff !important;
      }

      ::ng-deep .mat-mdc-text-field-wrapper {
        background-color: #333333 !important;
      }

      ::ng-deep .mat-mdc-form-field-label {
        color: rgba(255, 255, 255, 0.6) !important;
      }

      ::ng-deep .mat-mdc-input-element {
        color: #ffffff !important;
      }

      ::ng-deep .mat-mdc-select-value,
      ::ng-deep .mat-mdc-select-arrow {
        color: #ffffff !important;
      }

      ::ng-deep .mat-mdc-paginator {
        background-color: #333333 !important;
        color: #ffffff !important;
      }

      ::ng-deep .mat-mdc-tab-group,
      ::ng-deep .mat-mdc-tab-header,
      ::ng-deep .mat-mdc-tab-body-wrapper {
        background-color: #333333 !important;
        color: #ffffff !important;
      }

      ::ng-deep .mat-mdc-tab .mdc-tab__text-label {
        color: #ffffff !important;
      }

      ::ng-deep .mat-mdc-tab-header-pagination-chevron {
        border-color: #ffffff !important;
      }

      ::ng-deep .mat-mdc-table {
        background-color: #333333 !important;
      }

      ::ng-deep .mat-mdc-row:hover .mat-mdc-cell {
        background-color: #444444 !important;
      }

      ::ng-deep .accent-color {
        color: #ff6b6b !important;
      }

      ::ng-deep .accent-bg {
        background-color: #ff6b6b !important;
      }
    `,
  ],
})
export class AdminLayoutComponent {}
