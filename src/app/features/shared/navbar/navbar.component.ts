import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthService } from '../../../core/services/auth.service';
import { SocialAuthService, GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { Subscription } from 'rxjs';

// Import modal components
import { LoginModalComponent } from '../../auth/login-modal/login-modal.component';
import { RegisterModalComponent } from '../../auth/register-modal/register-modal.component';

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
    MatDividerModule,
    MatSidenavModule,
    MatListModule,
    LoginModalComponent,
    RegisterModalComponent
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
  templateUrl: './navbar.component.html',
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
      
      /* Menu Styling */
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
      
      .menu-button mat-icon {
        color: white;
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
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  isAdmin = false;
  username = '';
  mobileNavOpen = false;
  isMobile = false;
  
  // Modal states
  isLoginModalOpen = false;
  isRegisterModalOpen = false;
  
  private authStatusSub?: Subscription;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private socialAuthService: SocialAuthService
  ) {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    this.updateAuthStatus();
  }

  ngOnDestroy(): void {
    if (this.authStatusSub) {
      this.authStatusSub.unsubscribe();
    }
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth < 960;
    if (!this.isMobile && this.mobileNavOpen) {
      this.mobileNavOpen = false;
    }
  }

  private updateAuthStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      const user = this.authService.getUserData();
      if (user) {
        this.username = user.username;
        this.isAdmin = user.roles.includes('ROLE_ADMIN');
      }
    }
  }
  
  // Modal control methods
  openLoginModal(): void {
    this.isLoginModalOpen = true;
    // Close mobile nav if open
    if (this.mobileNavOpen) {
      this.closeMobileNav();
    }
  }
  
  closeLoginModal(): void {
    this.isLoginModalOpen = false;
  }
  
  openRegisterModal(): void {
    this.isRegisterModalOpen = true;
    // Close mobile nav if open
    if (this.mobileNavOpen) {
      this.closeMobileNav();
    }
  }
  
  closeRegisterModal(): void {
    this.isRegisterModalOpen = false;
  }
  
  switchToRegister(): void {
    this.closeLoginModal();
    this.openRegisterModal();
  }
  
  switchToLogin(): void {
    this.closeRegisterModal();
    this.openLoginModal();
  }
  
  onAuthSuccess(): void {
    this.updateAuthStatus();
  }
  
  onRegisterSuccess(): void {
    // Handle registration success
    this.snackBar.open('Registration successful! Please login.', 'Close', { duration: 3000 });
  }
  
  toggleMobileNav(): void {
    this.mobileNavOpen = !this.mobileNavOpen;
    if (this.mobileNavOpen) {
      document.body.style.overflow = 'hidden'; // Prevent scrolling when mobile nav is open
    } else {
      document.body.style.overflow = ''; // Restore scrolling
    }
  }
  
  closeMobileNav(): void {
    this.mobileNavOpen = false;
    document.body.style.overflow = '';
  }
  
  logout(): void {
    // Sign out from Google when logging out
    this.socialAuthService.signOut(true).then(() => {
      // Explicitly revoke access to force account selection next time
      (window as any).google?.accounts.id.disableAutoSelect();
    }).catch(error => {
      console.error('Error signing out from Google:', error);
    }).finally(() => {
      // Continue with normal logout process regardless of Google sign-out result
      this.authService.logout();
      this.isLoggedIn = false;
      this.isAdmin = false;
      this.username = '';
      
      // Clear any stored Google tokens in browser storage
      localStorage.removeItem('googleToken');
      sessionStorage.removeItem('googleToken');
      
      // Clear all Google cookies
      this.clearGoogleCookies();
      
      this.router.navigate(['/']);
      this.snackBar.open('You have been logged out', 'Close', { duration: 3000 });
    });
  }
  
  // Helper method to clear Google cookies
  private clearGoogleCookies() {
    const googleCookies = ['g_state', 'gapi-auth', 'g_csrf_token'];
    googleCookies.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  }
}
