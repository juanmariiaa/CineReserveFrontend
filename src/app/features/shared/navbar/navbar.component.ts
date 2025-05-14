import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthService } from '../../../core/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatDividerModule,
    MatSidenavModule,
    MatListModule
  ],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ],
  template: `
    <div class="navbar-container">
      <!-- Main Toolbar -->
      <mat-toolbar class="header-toolbar">
        <div class="toolbar-container">
          <!-- Mobile Menu Button -->
          <button mat-icon-button class="menu-button" (click)="toggleMobileNav()" aria-label="Menu">
            <mat-icon>{{ mobileNavOpen ? 'close' : 'menu' }}</mat-icon>
          </button>
          
          <!-- Logo -->
          <div class="logo-container" routerLink="/">
            <span class="logo-text">CineReserve</span>
          </div>
          
          <span class="spacer"></span>
          
          <!-- Desktop Navigation Links - Now Centered -->
          <div class="desktop-nav">
            <button mat-button routerLink="/" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">
              <mat-icon>home</mat-icon> Home
            </button>
            <button mat-button routerLink="/movies" routerLinkActive="active-link">
              <mat-icon>movie</mat-icon> Browse Movies
            </button>
            <button mat-button *ngIf="isAdmin" routerLink="/admin/dashboard" routerLinkActive="active-link">
              <mat-icon>dashboard</mat-icon> Admin Dashboard
            </button>
          </div>
          
          <span class="spacer"></span>
          
          <!-- Auth Actions -->
          <div class="auth-container">
            <!-- Not logged in: show login dropdown -->
            <div *ngIf="!isLoggedIn" class="auth-actions">
              <button mat-button [matMenuTriggerFor]="loginMenu" class="login-button">
                <mat-icon>person</mat-icon> Login
              </button>
              <mat-menu #loginMenu="matMenu" class="login-menu">
                <div class="login-form-container" (click)="$event.stopPropagation()">
                  <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
                    <mat-form-field appearance="outline">
                      <mat-label>Username</mat-label>
                      <input matInput formControlName="username" />
                      <mat-error *ngIf="loginForm.get('username')?.hasError('required')">Required</mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Password</mat-label>
                      <input matInput type="password" formControlName="password" />
                      <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Required</mat-error>
                    </mat-form-field>

                    <div class="login-actions">
                      <button mat-raised-button color="accent" type="submit" [disabled]="loginForm.invalid">
                        Login
                      </button>
                    </div>
                  </form>
                  <div class="register-link">
                    <a mat-button routerLink="/register">Don't have an account? Register</a>
                  </div>
                </div>
              </mat-menu>
              <button mat-raised-button color="accent" routerLink="/register" class="register-button">
                Register
              </button>
            </div>

            <!-- Logged in: show username with dropdown -->
            <div *ngIf="isLoggedIn" class="user-profile">
              <div class="user-button" [matMenuTriggerFor]="userMenu">
                <span class="avatar-circle">{{ username.charAt(0) }}</span>
                <span class="username">{{ username }}</span>
                <mat-icon class="dropdown-icon">arrow_drop_down</mat-icon>
              </div>
              <mat-menu #userMenu="matMenu" class="user-menu">
                <button mat-menu-item routerLink="/my-reservations">
                  <mat-icon>confirmation_number</mat-icon> My Reservations
                </button>
                <button mat-menu-item *ngIf="isAdmin" routerLink="/admin/dashboard">
                  <mat-icon>dashboard</mat-icon> Admin Dashboard
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="logout()">
                  <mat-icon>exit_to_app</mat-icon> Sign Out
                </button>
              </mat-menu>
            </div>
          </div>
        </div>
      </mat-toolbar>
      
      <!-- Mobile Navigation -->
      <div class="mobile-nav-backdrop" *ngIf="mobileNavOpen" (click)="closeMobileNav()" @fadeInOut></div>
      <div class="mobile-nav" [class.open]="mobileNavOpen">
        <div class="mobile-nav-header">
          <div class="logo-container">
            <span class="logo-text">CineReserve</span>
          </div>
          <button mat-icon-button (click)="closeMobileNav()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        
        <mat-divider></mat-divider>
        
        <div class="mobile-nav-content">
          <div class="mobile-nav-user" *ngIf="isLoggedIn">
            <span class="avatar-circle large">{{ username.charAt(0) }}</span>
            <div class="user-info">
              <span class="username">{{ username }}</span>
              <small *ngIf="isAdmin" class="user-role">Administrator</small>
              <small *ngIf="!isAdmin" class="user-role">Customer</small>
            </div>
          </div>
          
          <mat-divider *ngIf="isLoggedIn"></mat-divider>
          
          <div class="mobile-nav-links">
            <a class="mobile-nav-link" routerLink="/" (click)="closeMobileNav()">
              <mat-icon>home</mat-icon> Home
            </a>
            <a class="mobile-nav-link" routerLink="/movies" (click)="closeMobileNav()">
              <mat-icon>movie</mat-icon> Browse Movies
            </a>
            <a class="mobile-nav-link" *ngIf="isLoggedIn" routerLink="/my-reservations" (click)="closeMobileNav()">
              <mat-icon>confirmation_number</mat-icon> My Reservations
            </a>
            <a class="mobile-nav-link" *ngIf="isAdmin" routerLink="/admin/dashboard" (click)="closeMobileNav()">
              <mat-icon>dashboard</mat-icon> Admin Dashboard
            </a>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="mobile-nav-footer">
            <ng-container *ngIf="!isLoggedIn">
              <button mat-raised-button color="accent" routerLink="/register" (click)="closeMobileNav()" class="mobile-register-btn">
                <mat-icon>person_add</mat-icon> Register
              </button>
              <button mat-raised-button routerLink="/login" (click)="closeMobileNav()" class="mobile-login-btn">
                <mat-icon>login</mat-icon> Login
              </button>
            </ng-container>
            
            <button mat-raised-button color="warn" *ngIf="isLoggedIn" (click)="logout(); closeMobileNav()">
              <mat-icon>exit_to_app</mat-icon> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* Container */
      .navbar-container {
        position: relative;
      }
      
      /* Main Toolbar */
      .header-toolbar {
        position: sticky;
        top: 0;
        z-index: 1000;
        background-color: #3c3b34;
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        height: 64px;
        padding: 0;
      }
      
      .toolbar-container {
        display: flex;
        align-items: center;
        width: 100%;
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 24px;
        height: 100%;
      }
      
      /* Logo */
      .logo-container {
        display: flex;
        align-items: center;
        cursor: pointer;
        margin-right: 0;
        min-width: 150px;
      }
      
      .logo-text {
        font-size: 24px;
        font-weight: 500;
        letter-spacing: 0.5px;
        background: linear-gradient(90deg, #ff6b6b, #ffb88c);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        transition: transform 0.3s ease;
      }
      
      .logo-container:hover .logo-text {
        transform: scale(1.05);
      }
      
      /* Desktop Navigation */
      .desktop-nav {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .desktop-nav button {
        margin-right: 8px;
        border-radius: 8px;
        font-weight: 500;
        padding: 0 16px;
        height: 40px;
        transition: all 0.2s ease;
      }
      
      .desktop-nav button mat-icon {
        margin-right: 6px;
        color: #ff6b6b;
      }
      
      .active-link {
        background-color: rgba(255, 107, 107, 0.12) !important;
        color: #ff6b6b !important;
      }
      
      .desktop-nav button:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
      
      /* Auth Container */
      .auth-container {
        min-width: 150px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
      }
      
      .auth-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        width: 100%;
      }
      
      /* Spacer */
      .spacer {
        flex: 1 1 auto;
      }
      
      /* Auth Actions */
      .auth-actions {
        display: flex;
        align-items: center;
      }
      
      .login-button {
        margin-right: 8px;
        font-weight: 500;
      }
      
      .login-button mat-icon {
        margin-right: 4px;
        color: #ff6b6b;
      }
      
      .register-button {
        font-weight: 500;
        background-color: #ff6b6b !important;
        color: white !important;
        border-radius: 8px;
        padding: 0 16px;
        height: 40px;
      }
      
      /* User Profile */
      .user-profile {
        display: flex;
        align-items: center;
      }
      
      .user-button {
        display: flex;
        align-items: center;
        height: 36px;
        border-radius: 18px;
        padding: 0 8px 0 2px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        transition: all 0.2s ease;
        background-color: rgba(255, 255, 255, 0.08);
        min-height: 0;
        line-height: normal;
        cursor: pointer;
      }
      
      /* Override Material Button Styles */
      ::ng-deep .user-button .mat-mdc-button-touch-target {
        height: 100% !important;
      }
      
      ::ng-deep .mat-mdc-button.user-button {
        padding: 0 8px 0 2px;
        height: 36px;
      }
      
      .user-button:hover {
        background-color: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.3);
      }
      
      .dropdown-icon {
        color: rgba(255, 255, 255, 0.7);
        font-size: 18px;
        height: 18px;
        width: 18px;
        margin-top: -2px;
      }
      
      .avatar-circle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: #ff6b6b;
        color: white;
        text-transform: uppercase;
        font-weight: 600;
        font-size: 14px;
        margin-right: 8px;
        line-height: 1;
      }
      
      .avatar-circle.large {
        width: 48px;
        height: 48px;
        font-size: 20px;
      }
      
      .username {
        font-weight: 500;
        margin-right: 4px;
        font-size: 14px;
      }
      
      /* Login Form */
      .login-form-container {
        padding: 24px;
        min-width: 300px;
        background-color: #35342e;
        color: #ffffff;
        border-radius: 12px;
      }
      
      .login-form-container mat-form-field {
        width: 100%;
        margin-bottom: 16px;
        color: #ffffff;
      }
      
      ::ng-deep .login-form-container .mat-mdc-text-field-wrapper {
        background-color: rgba(255, 255, 255, 0.08);
      }
      
      ::ng-deep .login-form-container .mat-mdc-form-field-focus-overlay {
        background-color: rgba(255, 255, 255, 0.04);
      }
      
      .login-actions {
        display: flex;
        justify-content: center;
        margin-top: 16px;
      }
      
      .login-actions button {
        width: 100%;
        background-color: #ff6b6b !important;
        color: white !important;
        height: 44px;
        border-radius: 8px;
        font-weight: 500;
      }
      
      .register-link {
        margin-top: 16px;
        text-align: center;
      }
      
      .register-link a {
        color: #ff6b6b;
      }
      
      /* Menu Styling */
      ::ng-deep .mat-mdc-menu-panel.login-menu {
        max-width: none !important;
      }
      
      ::ng-deep .mat-mdc-menu-panel {
        background-color: #35342e !important;
        border-radius: 12px !important;
        overflow: hidden;
        padding: 0 !important;
      }
      
      ::ng-deep .mat-mdc-menu-item {
        color: #ffffff !important;
        font-weight: 500;
      }
      
      ::ng-deep .mat-mdc-menu-item mat-icon {
        color: #ff6b6b !important;
      }
      
      ::ng-deep .mat-mdc-menu-item:hover:not([disabled]) {
        background-color: rgba(255, 107, 107, 0.1) !important;
      }
      
      /* Mobile Menu Button */
      .menu-button {
        display: none;
        margin-right: 16px;
      }
      
      /* Mobile Navigation */
      .mobile-nav-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
      }
      
      .mobile-nav {
        position: fixed;
        top: 0;
        left: -300px;
        width: 280px;
        height: 100%;
        background-color: #35342e;
        z-index: 1001;
        box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
        transition: left 0.3s ease;
        overflow-y: auto;
      }
      
      .mobile-nav.open {
        left: 0;
      }
      
      .mobile-nav-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        background-color: #3c3b34;
      }
      
      .mobile-nav-user {
        display: flex;
        align-items: center;
        padding: 24px 16px;
      }
      
      .user-info {
        display: flex;
        flex-direction: column;
        margin-left: 16px;
      }
      
      .user-role {
        opacity: 0.7;
        margin-top: 4px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
      }
      
      .mobile-nav-content {
        display: flex;
        flex-direction: column;
        height: calc(100% - 64px);
      }
      
      .mobile-nav-links {
        padding: 16px 0;
        flex: 1;
      }
      
      .mobile-nav-link {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        color: white;
        text-decoration: none;
        font-weight: 500;
        transition: background-color 0.2s ease;
      }
      
      .mobile-nav-link:hover {
        background-color: rgba(255, 107, 107, 0.1);
      }
      
      .mobile-nav-link mat-icon {
        margin-right: 16px;
        color: #ff6b6b;
      }
      
      .mobile-nav-footer {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .mobile-register-btn, .mobile-login-btn {
        width: 100%;
        height: 44px;
      }
      
      /* Responsive Design */
      @media (max-width: 960px) {
        .desktop-nav {
          display: none;
        }
        
        .menu-button {
          display: block;
        }
        
        .logo-container {
          min-width: 0;
        }
        
        .auth-container {
          min-width: 0;
        }
      }
      
      @media (max-width: 600px) {
        .register-button {
          display: none;
        }
        
        .user-button {
          padding: 0 6px;
          height: 32px;
        }
        
        .avatar-circle {
          width: 28px;
          height: 28px;
          font-size: 12px;
          margin-right: 4px;
        }
        
        .username {
          display: none;
        }
        
        .toolbar-container {
          padding: 0 12px;
        }
      }
    `,
  ],
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  username = '';
  loginForm: FormGroup;
  mobileNavOpen = false;
  isMobile = false;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.updateAuthStatus();
    this.checkScreenSize();

    // Subscribe to auth changes
    this.authService.currentUser$.subscribe((user) => {
      this.updateAuthStatus();
    });
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth < 960;
    if (!this.isMobile) {
      this.closeMobileNav();
    }
  }

  private updateAuthStatus(): void {
    const previousStatus = this.isLoggedIn;
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();

    // Get username from stored user data
    const userData = this.authService.getUserData();
    this.username = userData?.username || '';

    // If the login status has changed, dispatch a custom event
    if (previousStatus !== this.isLoggedIn) {
      const event = new CustomEvent('loginStatusChange', {
        detail: {
          isLoggedIn: this.isLoggedIn,
          isAdmin: this.isAdmin,
        },
        bubbles: true,
      });
      document.dispatchEvent(event);
    }
  }

  toggleMobileNav(): void {
    this.mobileNavOpen = !this.mobileNavOpen;
    if (this.mobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileNav(): void {
    this.mobileNavOpen = false;
    document.body.style.overflow = '';
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login({ username, password }).subscribe({
        next: () => {
          this.updateAuthStatus();
          // Redirect based on user role
          if (this.isAdmin) {
            this.router.navigate(['/admin/dashboard']);
          }
          // For regular users, stay on the current page with updated UI
        },
        error: (error) => {
          let errorMsg = 'Invalid credentials';
          if (error.error && error.error.message) {
            errorMsg = error.error.message;
          }
          this.snackBar.open(errorMsg, 'Close', {
            duration: 5000,
          });
        },
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
