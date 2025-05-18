import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }),
        animate('250ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(-20px)', opacity: 0 }))
      ])
    ])
  ],
  template: `
    <div *ngIf="isOpen" class="modal-backdrop" (click)="onBackdropClick($event)" @fadeInOut>
      <div class="modal-container" @slideInOut>
        <div class="modal-header">
          <h2>{{ title }}</h2>
          <button mat-icon-button (click)="close.emit()" class="close-button">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        <div class="modal-content">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1050;
      padding: 20px;
      box-sizing: border-box;
    }

    .modal-container {
      background-color: #35342e;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
      width: 100%;
      max-width: 450px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      color: #fff;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      flex-shrink: 0;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 500;
      color: #fff;
    }

    .close-button {
      color: rgba(255, 255, 255, 0.7);
      transition: color 0.2s;
    }

    .close-button:hover {
      color: #fff;
    }

    .modal-content {
      padding: 24px;
      overflow-y: auto;
      flex-grow: 1;
      -webkit-overflow-scrolling: touch;
    }

    @media (max-width: 600px) {
      .modal-container {
        height: 100%;
        max-width: 100%;
        max-height: 100%;
        border-radius: 0;
      }
      
      .modal-backdrop {
        padding: 0;
      }
      
      .modal-content {
        padding: 16px;
      }
    }
  `]
})
export class ModalComponent {
  @Input() title: string = '';
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  onBackdropClick(event: MouseEvent): void {
    // Only close if the backdrop itself was clicked, not its children
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }
} 