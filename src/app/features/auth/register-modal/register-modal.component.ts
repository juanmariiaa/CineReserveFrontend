import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GoogleSigninButtonModule, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { Subscription } from 'rxjs';

import { ModalComponent } from '../../shared/modal/modal.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register-modal',
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
    ModalComponent
  ],
  templateUrl: './register-modal.component.html',
  styleUrls: ['./register-modal.component.scss'],
})
export class RegisterModalComponent implements OnDestroy {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() switchToLogin = new EventEmitter<void>();
  @Output() registerSuccess = new EventEmitter<void>();
  
  registerForm: FormGroup;
  private authStatusSub?: Subscription;
  private isProcessingGoogleAuth = false;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private socialAuthService: SocialAuthService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: ['']
    });
    
    // Subscribe to social auth state changes
    this.authStatusSub = this.socialAuthService.authState.subscribe((user: SocialUser) => {
      // Only process Google sign-up if modal is open and user is not already logged in
      if (user && user.idToken && this.isOpen && !this.authService.isLoggedIn() && !this.isProcessingGoogleAuth) {
        this.isProcessingGoogleAuth = true;
        this.handleGoogleSignUp(user.idToken);
      }
    });
  }
  
  ngOnDestroy(): void {
    if (this.authStatusSub) {
      this.authStatusSub.unsubscribe();
    }
    // Reset processing flag when component is destroyed
    this.isProcessingGoogleAuth = false;
  }
  
  onRegister(): void {
    if (this.registerForm.valid) {
      const registerData = {
        ...this.registerForm.value,
        roles: ['user'] // Default role is user
      };
      
      this.authService.register(registerData).subscribe({
        next: () => {
          this.registerForm.reset();
          this.registerSuccess.emit();
          this.switchToLogin.emit(); // Switch to login modal after successful registration
          this.snackBar.open('Registration successful! Please login.', 'Close', { duration: 3000 });
        },
        error: (error) => {
          let errorMsg = 'Registration failed';
          
          // Handle specific error cases
          if (error.status === 409) {
            errorMsg = 'Username or email already exists';
          } else if (error.status === 400) {
            errorMsg = 'Invalid registration data. Please check your information.';
          } else if (error.status === 0) {
            errorMsg = 'Could not connect to server. Please check your connection.';
          } else if (error.error && typeof error.error === 'string') {
            errorMsg = error.error;
          } else if (error.error && error.error.message) {
            errorMsg = error.error.message;
          } else if (error.status >= 500) {
            errorMsg = 'Server error. Please try again later.';
          }
          
          this.snackBar.open(errorMsg, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
  
  handleGoogleSignUp(idToken: string): void {
    // Use the same loginWithGoogle method since the backend already
    // handles creating a new user if one doesn't exist with that email
    this.authService.loginWithGoogle(idToken).subscribe({
      next: () => {
        this.isProcessingGoogleAuth = false;
        this.close.emit();
        this.registerSuccess.emit();
        
        this.snackBar.open('Google sign-up successful!', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.isProcessingGoogleAuth = false;
        let errorMsg = 'Google authentication failed';
        
        // Handle specific Google OAuth errors
        if (error.status === 401) {
          errorMsg = 'Google authentication failed. Please try again.';
        } else if (error.status === 0) {
          errorMsg = 'Could not connect to server. Please check your connection.';
        } else if (error.status === 409) {
          errorMsg = 'Account created successfully! Please try signing in again.';
        } else if (error.error && typeof error.error === 'string' && error.error.length < 100) {
          errorMsg = error.error;
        } else if (error.error && error.error.message && error.error.message.length < 100) {
          errorMsg = error.error.message;
        } else if (error.status >= 500) {
          errorMsg = 'Server error. Please try again later.';
        }
        
        // For first-time Google users, show a more friendly message
        if (error.status === 400 || (error.error && 
            (error.error.includes('User not found') || 
             error.error.includes('first time') ||
             error.error.includes('registration')))) {
          errorMsg = 'Welcome! Your account has been created. Please try signing in again.';
        }
        
        this.snackBar.open(errorMsg, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  // Add a method to handle modal close and reset state
  onModalClose(): void {
    this.isProcessingGoogleAuth = false;
    this.close.emit();
  }
} 