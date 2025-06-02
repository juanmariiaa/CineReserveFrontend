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
import {
  SocialAuthService,
  GoogleLoginProvider,
} from '@abacritt/angularx-social-login';
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
    RegisterModalComponent,
  ],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('200ms ease-out', style({ opacity: 0 }))]),
    ]),
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
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
  private loginModalSub?: Subscription;

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
    
    // Suscribirse al estado del modal de login
    this.loginModalSub = this.authService.loginModal$.subscribe(isOpen => {
      if (isOpen) {
        this.openLoginModal();
      }
    });
    
    // Suscribirse a los cambios de estado de autenticación
    this.authStatusSub = this.authService.currentUser$.subscribe(() => {
      this.updateAuthStatus();
    });
  }

  ngOnDestroy(): void {
    if (this.authStatusSub) {
      this.authStatusSub.unsubscribe();
    }
    
    if (this.loginModalSub) {
      this.loginModalSub.unsubscribe();
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
    this.authService.closeLoginModal();
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
    this.closeLoginModal();
    this.closeRegisterModal();
    
    // Redirigir si hay una URL guardada
    if (this.authService.getRedirectUrl()) {
      this.authService.redirectAfterLogin();
    }
  }

  onRegisterSuccess(): void {
    // Handle registration success
    this.snackBar.open('Registration successful! Please login.', 'Close', {
      duration: 3000,
    });
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
    this.socialAuthService
      .signOut(true)
      .then(() => {
        // Explicitly revoke access to force account selection next time
        (window as any).google?.accounts.id.disableAutoSelect();
      })
      .catch((error) => {
        console.error('Error signing out from Google:', error);
      })
      .finally(() => {
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
        this.snackBar.open('You have been logged out', 'Close', {
          duration: 3000,
        });
      });
  }

  // Helper method to clear Google cookies
  private clearGoogleCookies() {
    const googleCookies = ['g_state', 'gapi-auth', 'g_csrf_token'];
    googleCookies.forEach((cookieName) => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  }
}
