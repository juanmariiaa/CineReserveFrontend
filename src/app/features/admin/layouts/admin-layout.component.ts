import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AdminNavbarComponent } from '../components/admin-navbar/admin-navbar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    AdminNavbarComponent
  ],
  template: `
    <div class="admin-layout">
      <app-admin-navbar>
        <div class="admin-content">
          <router-outlet></router-outlet>
        </div>
      </app-admin-navbar>
    </div>
  `,
  styles: [`
    .admin-layout {
      min-height: 100vh;
      background-color: #181818;
      color: #FFFFFF;
    }
    
    .admin-content {
      padding: 20px;
      margin-top: 64px; /* Match the height of the admin toolbar */
      background-color: #181818;
      color: #FFFFFF;
    }
  `]
})
export class AdminLayoutComponent { } 