import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

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
    MatSnackBarModule
  ],
  template: `
    <div class="login-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Iniciar sesión</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Usuario</mat-label>
              <input matInput formControlName="username" placeholder="Usuario">
              <mat-error *ngIf="loginForm.get('username')?.invalid">Usuario requerido</mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput type="password" formControlName="password" placeholder="Contraseña">
              <mat-error *ngIf="loginForm.get('password')?.invalid">Contraseña requerida</mat-error>
            </mat-form-field>
            
            <button type="submit" mat-raised-button color="primary" class="full-width" [disabled]="loginForm.invalid">
              Iniciar sesión
            </button>
          </form>
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
    }
    
    mat-card {
      width: 100%;
      max-width: 400px;
      padding: 20px;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login({ username, password }).subscribe({
        next: () => {
          this.router.navigate(['/admin/dashboard']);
        },
        error: (error) => {
          let errorMsg = 'Credenciales incorrectas';
          
          if (error.error && error.error.message) {
            errorMsg = error.error.message;
          } else if (error.status === 0) {
            errorMsg = 'No se pudo conectar con el servidor. Verifica tu conexión o si el servidor está activo.';
          } else if (error.status === 401) {
            errorMsg = 'Usuario o contraseña incorrectos';
          }
          
          this.snackBar.open('Error al iniciar sesión: ' + errorMsg, 'Cerrar', {
            duration: 5000
          });
        }
      });
    }
  }}