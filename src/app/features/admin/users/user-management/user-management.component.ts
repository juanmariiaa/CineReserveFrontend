import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatChipsModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="screening-management-container">
      <div class="dashboard-title-container">
        <div class="dashboard-title-marker"></div>
        <h1 class="dashboard-title">User Management</h1>
      </div>

      <div class="action-bar">
        <div></div> <!-- Empty div to push the button to the right -->
        <button
          mat-raised-button
          class="back-button"
          routerLink="/admin/dashboard"
        >
          <mat-icon>arrow_back</mat-icon> Back to Dashboard
        </button>
      </div>

      <mat-card class="table-card">
        <mat-card-content>
          <div *ngIf="loading" class="loading-spinner">
            <mat-spinner class="accent-spinner"></mat-spinner>
          </div>

          <div *ngIf="!loading">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Filter Users</mat-label>
              <input
                matInput
                (keyup)="applyFilter($event)"
                placeholder="Name, email, role..."
                #input
              />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <div class="table-container">
              <table
                mat-table
                [dataSource]="dataSource"
                matSort
                class="user-table"
              >
                <!-- ID Column -->
                <ng-container matColumnDef="id">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
                  <td mat-cell *matCellDef="let user">
                    {{ user.id }}
                  </td>
                </ng-container>

                <!-- Username Column -->
                <ng-container matColumnDef="username">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Username</th>
                  <td mat-cell *matCellDef="let user">
                    {{ user.username }}
                  </td>
                </ng-container>

                <!-- Email Column -->
                <ng-container matColumnDef="email">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
                  <td mat-cell *matCellDef="let user">
                    {{ user.email }}
                  </td>
                </ng-container>

                <!-- Name Column -->
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
                  <td mat-cell *matCellDef="let user">
                    {{ user.firstName }} {{ user.lastName }}
                  </td>
                </ng-container>

                <!-- Roles Column -->
                <ng-container matColumnDef="roles">
                  <th mat-header-cell *matHeaderCellDef>Roles</th>
                  <td mat-cell *matCellDef="let user">
                    <div class="role-chips">
                      <span class="role-chip" *ngFor="let role of user.roles">
                        {{ role.name ? (role.name === 'ROLE_ADMIN' ? 'Admin' : role.name === 'ROLE_USER' ? 'User' : role.name) : (role === 'ROLE_ADMIN' ? 'Admin' : role === 'ROLE_USER' ? 'User' : role) }}
                      </span>
                    </div>
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let user">
                    <button 
                      mat-icon-button 
                      class="action-button"
                      matTooltip="View Details" 
                      (click)="viewUserDetails(user)"
                    >
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button 
                      mat-icon-button 
                      class="action-button"
                      matTooltip="Give Admin Role" 
                      (click)="giveUserAdminRole(user)" 
                      [disabled]="isCurrentUser(user) || hasAdminRole(user)"
                    >
                      <mat-icon>admin_panel_settings</mat-icon>
                    </button>
                    <button 
                      mat-icon-button 
                      class="action-button"
                      matTooltip="Delete User" 
                      (click)="confirmDelete(user)" 
                      [disabled]="isCurrentUser(user)"
                    >
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

                <tr class="mat-row" *matNoDataRow>
                  <td class="mat-cell" colspan="7">No users found matching "{{input.value}}"</td>
                </tr>
              </table>

              <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="User page selector"></mat-paginator>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .screening-management-container {
      padding: 20px;
    }

    .dashboard-title-container {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
    }

    .dashboard-title-marker {
      width: 5px;
      height: 30px;
      background-color: #ff6b6b;
      margin-right: 10px;
      border-radius: 3px;
    }

    .dashboard-title {
      font-size: 24px;
      font-weight: 500;
      margin: 0;
    }

    .action-bar {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      gap: 10px;
    }
      
    .back-button {
      background-color: #444444 !important;
      color: white !important;
      transition: background-color 0.3s ease;
    }
      
    .back-button:hover {
      background-color: #555555 !important;
    }

    .table-card {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 30px;
    }

    .accent-spinner ::ng-deep circle {
      stroke: #ff6b6b !important;
    }

    .filter-field {
      width: 100%;
      margin-bottom: 20px;
    }

    .table-container {
      overflow-x: auto;
    }

    .user-table {
      width: 100%;
      color: rgba(255, 255, 255, 0.7) !important;
    }

    .role-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }

    .role-chip {
      padding: 4px 8px;
      border-radius: 16px;
      font-size: 12px;
      background-color: #ff6b6b;
      color: white;
      font-weight: 500;
    }

    .view-button {
      color: #ff6b6b;
    }

    .admin-button {
      color: #ff6b6b;
    }

    .delete-button {
      color: #ff6b6b;
    }

    ::ng-deep .mat-raised-button {
      background-color: #ff6b6b;
      color: white;
    }
  `]
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  loading = true;
  displayedColumns: string[] = ['id', 'username', 'email', 'name', 'roles', 'actions'];
  dataSource: any;
  currentUserId: number = 0; // Replace this with value from AuthService

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    // Example: this.currentUserId = this.authService.getCurrentUser().id;
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.dataSource = this.users;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load users: ' + error.message, 'Close', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  isCurrentUser(user: User): boolean {
    return user.id === this.currentUserId;
  }

  toggleUserStatus(user: User): void {
    const toggleAction = user.isActive
      ? this.userService.deactivateUser(user.id)
      : this.userService.activateUser(user.id);

    toggleAction.subscribe({
      next: () => {
        const statusMsg = user.isActive ? 'deactivated' : 'activated';
        this.snackBar.open(`User ${user.username} ${statusMsg}`, 'Close', {
          duration: 3000
        });
        this.loadUsers();
      },
      error: (error) => {
        this.snackBar.open('Error updating user status: ' + error.message, 'Close', {
          duration: 5000
        });
      }
    });
  }

  viewUserDetails(user: User): void {
    const roleLabels = user.roles.map(role => {
      if (typeof role === 'object' && role.name) {
        if (role.name === 'ROLE_ADMIN') return 'Admin';
        if (role.name === 'ROLE_USER') return 'User';
        return role.name;
      } else {
        if (role === 'ROLE_ADMIN') return 'Admin';
        if (role === 'ROLE_USER') return 'User';
        return role;
      }
    }).join(', ');
    
    alert(`User Details:\n\nID: ${user.id}\nEmail: ${user.email}\nName: ${user.firstName} ${user.lastName}\nRoles: ${roleLabels}`);
  }
  
  hasAdminRole(user: User): boolean {
    return user.roles.some(role => 
      (typeof role === 'object' && role.name === 'ROLE_ADMIN') || role === 'ROLE_ADMIN'
    );
  }
  
  giveUserAdminRole(user: User): void {
    if (confirm(`Are you sure you want to give ${user.username} admin privileges?`)) {
      this.userService.giveAdminRole(user.id).subscribe({
        next: () => {
          this.snackBar.open(`Admin role granted to ${user.username}`, 'Close', {
            duration: 3000
          });
          this.loadUsers();
        },
        error: (error) => {
          this.snackBar.open('Error granting admin role: ' + error.message, 'Close', {
            duration: 5000
          });
        }
      });
    }
  }

  editUserRoles(user: User): void {
    const isAdmin = user.roles.includes('ROLE_ADMIN');
    const newRoles = isAdmin ? ['ROLE_USER'] : ['ROLE_USER', 'ROLE_ADMIN'];

    if (confirm(`Change roles for ${user.username} to ${newRoles.join(', ')}?`)) {
      this.userService.changeUserRole(user.id, newRoles).subscribe({
        next: () => {
          this.snackBar.open(`Roles updated for ${user.username}`, 'Close', {
            duration: 3000
          });
          this.loadUsers();
        },
        error: (error) => {
          this.snackBar.open('Error updating roles: ' + error.message, 'Close', {
            duration: 5000
          });
        }
      });
    }
  }

  confirmDelete(user: User): void {
    if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
      this.deleteUser(user.id);
    }
  }

  deleteUser(id: number): void {
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.snackBar.open('User successfully deleted', 'Close', {
          duration: 3000
        });
        this.loadUsers();
      },
      error: (error) => {
        this.snackBar.open('Error deleting user: ' + error.message, 'Close', {
          duration: 5000
        });
      }
    });
  }
}
