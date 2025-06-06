import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-not-allowed',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './not-allowed.component.html',
  styleUrls: ['./not-allowed.component.scss'],
})
export class NotAllowedComponent {
  constructor(private router: Router, private snackBar: MatSnackBar) {}

  goBack(): void {
    window.history.back();
  }

  openContactInfo(): void {
    this.snackBar.open(
      'Contact your system administrator for access permissions',
      'Close',
      {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['info-snackbar'],
      }
    );
  }
}
