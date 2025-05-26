import { Component, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import {
  SocialAuthService,
  GoogleSigninButtonModule,
  SocialUser,
  GoogleLoginProvider,
} from '@abacritt/angularx-social-login';
import { Subscription } from 'rxjs';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDividerModule,
    GoogleSigninButtonModule,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnDestroy {
  loginForm: FormGroup;
  private authStatusSub?: Subscription;
  private isProcessingGoogleAuth = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private socialAuthService: SocialAuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    // Subscribe to social auth state changes
    this.authStatusSub = this.socialAuthService.authState.subscribe(
      (user: SocialUser) => {
        // Only process Google sign-in if user is not already logged in and we're not already processing
        if (
          user &&
          user.idToken &&
          !this.authService.isLoggedIn() &&
          !this.isProcessingGoogleAuth
        ) {
          this.isProcessingGoogleAuth = true;
          this.handleGoogleSignIn(user.idToken);
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.authStatusSub) {
      this.authStatusSub.unsubscribe();
    }
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login({ username, password }).subscribe({
        next: () => {
          // Redirect based on user role
          if (this.authService.isAdmin()) {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          let errorMsg = 'Invalid username or password';

          // Handle specific error cases
          if (error.status === 401) {
            errorMsg = 'Invalid username or password';
          } else if (error.status === 0) {
            errorMsg =
              'Could not connect to server. Please check your connection.';
          } else if (error.error && typeof error.error === 'string') {
            errorMsg = error.error;
          } else if (error.error && error.error.message) {
            errorMsg = error.error.message;
          } else if (error.status >= 500) {
            errorMsg = 'Server error. Please try again later.';
          }

          this.snackBar.open(errorMsg, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
        },
      });
    }
  }

  // Manual trigger for Google Sign-In
  signInWithGoogle(): void {
    this.socialAuthService
      .signIn(GoogleLoginProvider.PROVIDER_ID)
      .then((user: SocialUser) => {
        if (user && user.idToken) {
          this.handleGoogleSignIn(user.idToken);
        }
      })
      .catch((error) => {
        console.error('Google sign-in error:', error);
        this.snackBar.open(
          'Google sign-in failed. Please try again.',
          'Close',
          {
            duration: 5000,
          }
        );
      });
  }

  handleGoogleSignIn(idToken: string): void {
    this.authService.loginWithGoogle(idToken).subscribe({
      next: () => {
        this.isProcessingGoogleAuth = false;
        // Redirect based on user role (always CLIENT for Google users)
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isProcessingGoogleAuth = false;
        let errorMsg = 'Google authentication failed';

        // Handle specific Google OAuth errors
        if (error.status === 401) {
          errorMsg = 'Google authentication failed. Please try again.';
        } else if (error.status === 0) {
          errorMsg =
            'Could not connect to server. Please check your connection.';
        } else if (error.status === 409) {
          errorMsg =
            'Account created successfully! Please try signing in again.';
        } else if (
          error.error &&
          typeof error.error === 'string' &&
          error.error.length < 100
        ) {
          errorMsg = error.error;
        } else if (
          error.error &&
          error.error.message &&
          error.error.message.length < 100
        ) {
          errorMsg = error.error.message;
        } else if (error.status >= 500) {
          errorMsg = 'Server error. Please try again later.';
        }

        // For first-time Google users, show a more friendly message
        if (
          error.status === 400 ||
          (error.error &&
            (error.error.includes('User not found') ||
              error.error.includes('first time') ||
              error.error.includes('registration')))
        ) {
          errorMsg =
            'Welcome! Your account has been created. Please try signing in again.';
        }

        this.snackBar.open(errorMsg, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }
}
