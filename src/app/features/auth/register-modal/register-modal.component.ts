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
  template: `
    <app-modal [isOpen]="isOpen" [title]="'Register'" (close)="close.emit()">
      <form [formGroup]="registerForm" (ngSubmit)="onRegister()">
        <div class="form-field-container">
          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>First Name</mat-label>
              <input matInput formControlName="firstName" placeholder="First Name">
              <mat-error *ngIf="registerForm.get('firstName')?.hasError('required')">
                First name is required
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Last Name</mat-label>
              <input matInput formControlName="lastName" placeholder="Last Name">
              <mat-error *ngIf="registerForm.get('lastName')?.hasError('required')">
                Last name is required
              </mat-error>
            </mat-form-field>
          </div>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Username</mat-label>
            <input matInput formControlName="username" placeholder="Username">
            <mat-error *ngIf="registerForm.get('username')?.hasError('required')">
              Username is required
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" placeholder="Email" type="email">
            <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
              Email is required
            </mat-error>
            <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
              Please enter a valid email address
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput formControlName="password" placeholder="Password" type="password">
            <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
              Password is required
            </mat-error>
            <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
              Password must be at least 6 characters
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Phone Number (Optional)</mat-label>
            <input matInput formControlName="phoneNumber" placeholder="Phone Number">
          </mat-form-field>
        </div>
        
        <div class="form-actions">
          <button type="submit" mat-raised-button color="accent" [disabled]="registerForm.invalid" class="action-button">
            Register
          </button>
        </div>
      </form>
      
      <mat-divider class="divider"></mat-divider>
      
      <div class="social-login-container">
        <p class="social-login-text">Or sign up with:</p>
        <div class="google-signin-options">
          <asl-google-signin-button type="standard" size="medium" text="signup_with"></asl-google-signin-button>
        </div>
      </div>
      
      <mat-divider class="divider"></mat-divider>
      
      <div class="login-link">
        <p>Already have an account?</p>
        <button mat-button color="primary" (click)="switchToLogin.emit()" class="link-button">Login now</button>
      </div>
    </app-modal>
  `,
  styles: [`
    :host ::ng-deep .mat-mdc-form-field {
      display: block;
    }
    
    :host ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      height: auto !important;
      position: static !important;
    }
    
    :host ::ng-deep .mat-mdc-form-field-infix {
      min-height: 40px;
      padding-top: 12px !important;
      padding-bottom: 8px !important;
    }

    :host ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: rgba(255, 255, 255, 0.06);
      height: auto;
    }

    :host ::ng-deep .mat-mdc-form-field-flex {
      margin-top: 0;
    }
    
    :host ::ng-deep .mdc-notched-outline {
      z-index: 0;
    }

    :host ::ng-deep .mdc-text-field--outlined .mdc-notched-outline__leading,
    :host ::ng-deep .mdc-text-field--outlined .mdc-notched-outline__notch,
    :host ::ng-deep .mdc-text-field--outlined .mdc-notched-outline__trailing {
      border-color: rgba(255, 255, 255, 0.2);
    }

    :host ::ng-deep .mdc-text-field:not(.mdc-text-field--disabled) .mdc-floating-label {
      color: rgba(255, 255, 255, 0.7);
    }

    :host ::ng-deep .mat-mdc-input-element {
      color: white;
    }
    
    :host ::ng-deep .mat-mdc-form-field-error {
      margin-top: 6px;
    }

    :host ::ng-deep .mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--focused .mdc-notched-outline__leading,
    :host ::ng-deep .mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--focused .mdc-notched-outline__notch,
    :host ::ng-deep .mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--focused .mdc-notched-outline__trailing {
      border-color: #ff6b6b;
    }

    .form-field-container {
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }
    
    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 0;
    }
    
    .half-width {
      width: 50%;
    }
    
    .form-actions {
      display: flex;
      justify-content: center;
      margin-top: 20px;
      margin-bottom: 16px;
    }
    
    :host ::ng-deep .action-button {
      width: 100%;
      height: 44px;
      font-weight: 500;
      background-color: #ff6b6b !important;
      color: white !important;
      border-radius: 8px !important;
      padding: 0 16px;
      box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
      transition: all 0.2s ease;
    }
    
    :host ::ng-deep .action-button:hover:not([disabled]) {
      background-color: #ff5252 !important;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      transform: translateY(-1px);
    }
    
    :host ::ng-deep .action-button:disabled {
      background-color: rgba(255, 107, 107, 0.5) !important;
      color: rgba(255, 255, 255, 0.6) !important;
    }
    
    :host ::ng-deep .link-button {
      color: #ff6b6b !important;
      font-weight: 500;
    }
    
    :host ::ng-deep .link-button:hover {
      background-color: rgba(255, 107, 107, 0.1);
    }
    
    .divider {
      margin: 16px 0;
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .social-login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 16px 0;
    }
    
    .social-login-text {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 12px;
      text-align: center;
    }
    
    .google-signin-options {
      display: flex;
      justify-content: center;
      width: 100%;
    }
    
    .login-link {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 8px;
    }
    
    .login-link p {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 8px;
    }
    
    @media (max-width: 500px) {
      .form-row {
        flex-direction: column;
        gap: 0;
      }
      
      .half-width {
        width: 100%;
      }
    }
  `]
})
export class RegisterModalComponent implements OnDestroy {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() switchToLogin = new EventEmitter<void>();
  @Output() registerSuccess = new EventEmitter<void>();
  
  registerForm: FormGroup;
  private authStatusSub?: Subscription;
  
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
      if (user && user.idToken) {
        this.handleGoogleSignUp(user.idToken);
      }
    });
  }
  
  ngOnDestroy(): void {
    if (this.authStatusSub) {
      this.authStatusSub.unsubscribe();
    }
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
          
          if (error.error && error.error.message) {
            errorMsg = error.error.message;
          } else if (error.status === 0) {
            errorMsg = 'Could not connect to server. Please check your connection.';
          }
          
          this.snackBar.open('Registration error: ' + errorMsg, 'Close', {
            duration: 5000
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
        this.close.emit();
        this.registerSuccess.emit();
        
        this.snackBar.open('Google sign-up successful!', 'Close', { duration: 3000 });
      },
      error: (error) => {
        let errorMsg = 'Google authentication failed';
        
        if (error.error && error.error.message) {
          errorMsg = error.error.message;
        } else if (error.status === 0) {
          errorMsg = 'Could not connect to server. Please check your connection.';
        }
        
        this.snackBar.open('Registration error: ' + errorMsg, 'Close', {
          duration: 5000
        });
      }
    });
  }
} 