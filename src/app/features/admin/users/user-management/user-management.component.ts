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
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
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
