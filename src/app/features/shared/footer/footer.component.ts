import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule
  ],
  template: `
    <footer class="app-footer">
      <div class="footer-container">
        <div class="footer-section">
          <h3 class="footer-title">CineReserve</h3>
          <p class="footer-description">
            Your ultimate cinema experience. Book tickets online and enjoy your favorite movies.
          </p>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-subtitle">Quick Links</h4>
          <ul class="footer-links">
            <li><a routerLink="/">Home</a></li>
            <li><a routerLink="/movies">Movies</a></li>
            <li><a routerLink="/register">Register</a></li>
            <li><a routerLink="/about">About Us</a></li>
            <li><a routerLink="/contact">Contact</a></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-subtitle">Follow Us</h4>
          <div class="footer-social">
            <a href="https://facebook.com" target="_blank" class="social-icon">
              <mat-icon>facebook</mat-icon>
            </a>
            <a href="https://twitter.com" target="_blank" class="social-icon">
              <mat-icon>Twitter</mat-icon>
            </a>
            <a href="https://instagram.com" target="_blank" class="social-icon">
              <mat-icon>photo_camera</mat-icon>
            </a>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; {{currentYear}} CineReserve. All rights reserved.</p>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      background-color: #212121;
      color: #fff;
      padding: 2rem 0 0 0;
      margin-top: auto;
    }
    
    .footer-container {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    
    .footer-section {
      flex: 1;
      min-width: 250px;
      margin-bottom: 1.5rem;
      padding: 0 1rem;
    }
    
    .footer-title {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #fff;
    }
    
    .footer-subtitle {
      font-size: 1.1rem;
      margin-bottom: 1rem;
      color: #fff;
    }
    
    .footer-description {
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.7);
    }
    
    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .footer-links li {
      margin-bottom: 0.5rem;
    }
    
    .footer-links a {
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      transition: color 0.3s;
    }
    
    .footer-links a:hover {
      color: #fff;
    }
    
    .footer-social {
      display: flex;
      gap: 1rem;
    }
    
    .social-icon {
      color: rgba(255, 255, 255, 0.7);
      font-size: 1.5rem;
      transition: color 0.3s;
    }
    
    .social-icon:hover {
      color: #fff;
    }
    
    .footer-bottom {
      background-color: #111;
      padding: 1rem 0;
      text-align: center;
      margin-top: 1rem;
    }
    
    .footer-bottom p {
      margin: 0;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9rem;
    }
    
    @media (max-width: 768px) {
      .footer-container {
        flex-direction: column;
      }
      
      .footer-section {
        margin-bottom: 2rem;
      }
    }
  `]
})
export class FooterComponent {
  get currentYear(): number {
    return new Date().getFullYear();
  }
} 