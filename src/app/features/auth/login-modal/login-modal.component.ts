import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { GoogleSigninButtonModule, SocialAuthService, SocialUser, GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { Subscription } from 'rxjs';

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
    ModalComponent
  ],
  template: `
    <app-modal [isOpen]="isOpen" [title]="'Login'" (close)="close.emit()">
      <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
        <div class="form-field-container">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Username</mat-label>
            <input matInput formControlName="username" placeholder="Username">
            <mat-error *ngIf="loginForm.get('username')?.hasError('required')">Username is required</mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput type="password" formControlName="password" placeholder="Password">
            <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Password is required</mat-error>
          </mat-form-field>
        </div>
        
        <div class="form-actions">
          <button type="submit" mat-raised-button color="accent" [disabled]="loginForm.invalid" class="action-button">
            Login
          </button>
        </div>
      </form>
      
      <mat-divider class="divider"></mat-divider>
      
      <div class="social-login-container">
        <p class="social-login-text">Or sign in with:</p>
        <div class="google-signin-options">
          <asl-google-signin-button type="standard" size="medium"></asl-google-signin-button>
        </div>
      </div>
      
      <mat-divider class="divider"></mat-divider>
      
      <div class="register-link">
        <p>Don't have an account?</p>
        <button mat-button color="primary" (click)="switchToRegister.emit()" class="link-button">Register now</button>
      </div>
    </app-modal>
  `,
  styles: [`
    :host ::ng-deep .mat-mdc-form-field {
      display: block;
      margin-bottom: 24px;
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
    
    .register-link {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 8px;
    }
    
    .register-link p {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 8px;
    }
  `]
})
export class LoginModalComponent implements OnDestroy {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() switchToRegister = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<void>();
  
  loginForm: FormGroup;
  private authStatusSub?: Subscription;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private socialAuthService: SocialAuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    
    // Subscribe to social auth state changes
    this.authStatusSub = this.socialAuthService.authState.subscribe((user: SocialUser) => {
      if (user && user.idToken) {
        this.handleGoogleSignIn(user.idToken);
      }
    });
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
          let errorMsg = 'Invalid credentials';
          
          if (error.error && error.error.message) {
            errorMsg = error.error.message;
          } else if (error.status === 0) {
            errorMsg = 'Could not connect to server. Please check your connection.';
          } else if (error.status === 401) {
            errorMsg = 'Invalid username or password';
          }
          
          this.snackBar.open('Login error: ' + errorMsg, 'Close', {
            duration: 5000
          });
        }
      });
    }
  }
  
  handleGoogleSignIn(idToken: string): void {
    this.authService.loginWithGoogle(idToken).subscribe({
      next: () => {
        this.close.emit();
        this.loginSuccess.emit();
        
        // Stay on current page after login
        this.snackBar.open('Google sign-in successful!', 'Close', { duration: 3000 });
      },
      error: (error) => {
        let errorMsg = 'Google authentication failed';
        
        if (error.error && error.error.message) {
          errorMsg = error.error.message;
        } else if (error.status === 0) {
          errorMsg = 'Could not connect to server. Please check your connection.';
        }
        
        this.snackBar.open('Login error: ' + errorMsg, 'Close', {
          duration: 5000
        });
      }
    });
  }
} 