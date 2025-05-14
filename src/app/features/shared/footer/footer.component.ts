import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <footer class="app-footer">
      <div class="footer-container">
        <div class="footer-brand">
          <h3 class="brand-name">CineReserve</h3>
          <p class="copyright">&copy; {{currentYear}} CineReserve. All rights reserved.</p>
        </div>
        
        <div class="footer-links">
          <a routerLink="/privacy-policy" class="footer-link">Privacy Policy</a>
          <a routerLink="/terms" class="footer-link">Terms of Use</a>
          <a routerLink="/faq" class="footer-link">FAQ</a>
          <a routerLink="/contact" class="footer-link">Contact</a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      background-color: #3c3b34;
      color: rgba(255, 255, 255, 0.85);
      padding: 1.5rem 2rem;
      margin-top: auto;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px 16px 0 0;
      box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.2);
    }
    
    .footer-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1600px;
      margin: 0 auto;
      width: 95%;
    }
    
    .footer-brand {
      display: flex;
      flex-direction: column;
    }
    
    .brand-name {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      color: #ffffff;
    }
    
    .copyright {
      font-size: 0.85rem;
      margin: 0;
      color: rgba(255, 255, 255, 0.7);
    }
    
    .footer-links {
      display: flex;
      gap: 1.5rem;
    }
    
    .footer-link {
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      font-size: 0.95rem;
      transition: all 0.2s ease;
    }
    
    .footer-link:hover {
      color: #ff6b6b;
      text-decoration: none;
    }
    
    @media (max-width: 768px) {
      .app-footer {
        padding: 1.5rem 1rem;
      }
      
      .footer-container {
        flex-direction: column;
        text-align: center;
      }
      
      .footer-brand {
        margin-bottom: 1.25rem;
      }
      
      .footer-links {
        flex-wrap: wrap;
        justify-content: center;
        gap: 1rem 2rem;
      }
    }
    
    @media (max-width: 480px) {
      .footer-links {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class FooterComponent {
  get currentYear(): number {
    return new Date().getFullYear();
  }
} 