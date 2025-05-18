import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { SocialAuthService, GoogleSigninButtonModule, SocialUser, GoogleLoginProvider } from '@abacritt/angularx-social-login';
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
    RouterLink
  ],
  template: `
    <div class="login-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Login</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input matInput formControlName="username" placeholder="Username">
              <mat-error *ngIf="loginForm.get('username')?.invalid">Username is required</mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" placeholder="Password">
              <mat-error *ngIf="loginForm.get('password')?.invalid">Password is required</mat-error>
            </mat-form-field>
            
            <div class="form-actions">
              <button type="button" mat-button routerLink="/register">Don't have an account? Register</button>
              <button type="submit" mat-raised-button color="accent" [disabled]="loginForm.invalid">
                Login
              </button>
            </div>
          </form>
          
          <mat-divider class="divider"></mat-divider>
          
          <div class="social-login">
            <p class="social-login-text">Or sign in with:</p>
            <div class="google-btn-container">
              <asl-google-signin-button type="standard" size="large"></asl-google-signin-button>
              <button mat-raised-button color="primary" (click)="signInWithGoogle()" class="manual-google-btn">
                Sign in with Google
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #181818;
    }
    
    mat-card {
      width: 100%;
      max-width: 400px;
      padding: 20px;
      background-color: #202020 !important;
      color: #FFFFFF !important;
      border: 1px solid #303030;
    }
    
    mat-card-title {
      color: #FFFFFF !important;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }
    
    ::ng-deep .mat-mdc-form-field-label {
      color: rgba(255, 255, 255, 0.6) !important;
    }
    
    ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: #252525 !important;
    }
    
    ::ng-deep .mat-mdc-form-field-focus-overlay {
      background-color: #303030 !important;
    }
    
    ::ng-deep .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__leading,
    ::ng-deep .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__notch,
    ::ng-deep .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__trailing {
      border-color: rgba(255, 255, 255, 0.2) !important;
    }
    
    ::ng-deep .mat-mdc-input-element {
      color: #FFFFFF !important;
    }
    
    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20px;
    }
    
    .divider {
      margin: 30px 0 20px;
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    .social-login {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 20px;
    }
    
    .social-login-text {
      margin-bottom: 15px;
      color: rgba(255, 255, 255, 0.7);
    }
    
    .google-btn-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      gap: 10px;
    }
    
    .manual-google-btn {
      width: 240px;
      margin-top: 10px;
    }
  `]
})
export class LoginComponent implements OnDestroy {
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
          // Redirect based on user role
          if (this.authService.isAdmin()) {
          this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          let errorMsg = 'Invalid credentials';
          
          if (error.error && error.error.message) {
            errorMsg = error.error.message;
          } else if (error.status === 0) {
            errorMsg = 'Could not connect to server. Please check your connection or if the server is active.';
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
  
  // Manual trigger for Google Sign-In
  signInWithGoogle(): void {
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID)
      .then((user: SocialUser) => {
        if (user && user.idToken) {
          this.handleGoogleSignIn(user.idToken);
        }
      })
      .catch(error => {
        console.error('Google sign-in error:', error);
        this.snackBar.open('Google sign-in failed. Please try again.', 'Close', {
          duration: 5000
        });
      });
  }
  
  handleGoogleSignIn(idToken: string): void {
    this.authService.loginWithGoogle(idToken).subscribe({
      next: () => {
        // Redirect based on user role (always CLIENT for Google users)
        this.router.navigate(['/']);
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