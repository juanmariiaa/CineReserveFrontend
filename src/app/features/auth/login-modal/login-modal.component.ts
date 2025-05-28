import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import {
  GoogleSigninButtonModule,
  SocialAuthService,
  SocialUser,
  GoogleLoginProvider,
} from '@abacritt/angularx-social-login';
import { Subscription, finalize } from 'rxjs';

import { ModalComponent } from '../../shared/modal/modal.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    GoogleSigninButtonModule,
    ModalComponent,
  ],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss'],
})
export class LoginModalComponent implements OnDestroy {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() switchToRegister = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<void>();

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
        // Only process Google sign-in if modal is open and user is not already logged in
        if (
          user &&
          user.idToken &&
          this.isOpen &&
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
    // Reset processing flag when component is destroyed
    this.isProcessingGoogleAuth = false;
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login({ username, password }).subscribe({
        next: () => {
          this.loginForm.reset();
          this.close.emit();
          this.loginSuccess.emit();

          // Check if user is admin for redirect
          if (this.authService.isAdmin()) {
            this.router.navigate(['/admin/dashboard']);
          } else {
            // Stay on current page
          }

          this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
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

  handleGoogleSignIn(idToken: string): void {
    this.authService.loginWithGoogle(idToken)
      .pipe(
        finalize(() => {
          this.isProcessingGoogleAuth = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.close.emit();
          this.loginSuccess.emit();

          // Navigate based on user role
          if (this.authService.isAdmin()) {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/']);
          }

          this.snackBar.open('Google sign-in successful!', 'Close', {
            duration: 3000,
          });
        },
        error: (error) => {
          console.error('Google auth error:', error);
          let errorMsg = 'Google authentication failed';

          // Handle specific Google OAuth errors
          if (error.status === 401) {
            errorMsg = 'Google authentication failed. Please try again.';
          } else if (error.status === 0) {
            errorMsg =
              'Could not connect to server. Please check your connection.';
          } else if (error.status === 409) {
            // User might be registering for the first time
            errorMsg =
              'Account created successfully! Please try signing in again.';
          } else if (
            error.error && 
            typeof error.error === 'string'
          ) {
            // Only show string error messages
            errorMsg = error.error;
          } else if (
            error.error && 
            error.error.message && 
            typeof error.error.message === 'string'
          ) {
            errorMsg = error.error.message;
          } else if (error.status >= 500) {
            errorMsg = 'Server error. Please try again later.';
          }

          // For first-time Google users, show a more friendly message
          const isNewUserError = this.isNewUserError(error);
          if (isNewUserError) {
            // Try to sign in again automatically after a short delay
            setTimeout(() => {
              this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
            }, 1500);
            
            errorMsg =
              'Welcome! Your account has been created. Signing you in now...';
          }

          this.snackBar.open(errorMsg, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
        },
      });
  }

  // Safe method to check if error indicates a new user
  private isNewUserError(error: any): boolean {
    if (!error || error.status !== 400) {
      return false;
    }
    
    // Check if error.error is a string and contains relevant text
    if (typeof error.error === 'string') {
      const errorText = error.error.toLowerCase();
      return errorText.includes('user not found') || 
             errorText.includes('first time') || 
             errorText.includes('registration');
    }
    
    // Check if error.error.message is a string and contains relevant text
    if (error.error && typeof error.error.message === 'string') {
      const messageText = error.error.message.toLowerCase();
      return messageText.includes('user not found') || 
             messageText.includes('first time') || 
             messageText.includes('registration');
    }
    
    return false;
  }

  // Add a method to handle modal close and reset state
  onModalClose(): void {
    this.isProcessingGoogleAuth = false;
    this.close.emit();
  }
}
