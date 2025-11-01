import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { AuthServicio } from '../../services/auth-servicio';

@Component({
  selector: 'app-login-pagina',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatDividerModule
  ],
  template: `
    <div class="login-container">
      <div class="login-background">
        <div class="gradient-overlay"></div>
        <div class="basketball-pattern"></div>
      </div>
      
      <mat-card class="login-card">
        <div class="logo-section">
          <mat-icon class="logo-icon">sports_basketball</mat-icon>
          <h1 class="app-title">Sistema de Gestión de Baloncesto</h1>
        </div>
        
        <mat-card-header>
          <mat-card-title>
            <h2>{{ isLoginMode() ? 'Iniciar Sesión' : 'Registrarse' }}</h2>
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="authForm" (ngSubmit)="onSubmit()">
            <!-- Campos de registro -->
            @if (!isLoginMode()) {
              <div class="name-fields">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Nombre</mat-label>
                  <input matInput formControlName="nombre" placeholder="Tu nombre">
                  <mat-icon matSuffix>person</mat-icon>
                  @if (authForm.get('nombre')?.invalid && authForm.get('nombre')?.touched) {
                    <mat-error>El nombre es requerido</mat-error>
                  }
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Apellido</mat-label>
                  <input matInput formControlName="apellido" placeholder="Tu apellido">
                  <mat-icon matSuffix>person</mat-icon>
                  @if (authForm.get('apellido')?.invalid && authForm.get('apellido')?.touched) {
                    <mat-error>El apellido es requerido</mat-error>
                  }
                </mat-form-field>
              </div>
            }
            
            <!-- Email -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Correo Electrónico</mat-label>
              <input matInput 
                     type="email" 
                     formControlName="email" 
                     placeholder="correo@ejemplo.com">
              <mat-icon matSuffix>email</mat-icon>
              @if (authForm.get('email')?.invalid && authForm.get('email')?.touched) {
                <mat-error>
                  @if (authForm.get('email')?.errors?.['required']) {
                    El email es requerido
                  }
                  @if (authForm.get('email')?.errors?.['email']) {
                    Email inválido
                  }
                </mat-error>
              }
            </mat-form-field>
            
            <!-- Contraseña -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput 
                     [type]="hidePassword() ? 'password' : 'text'" 
                     formControlName="password"
                     placeholder="Tu contraseña">
              <button mat-icon-button 
                      matSuffix 
                      type="button"
                      (click)="hidePassword.set(!hidePassword())">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (authForm.get('password')?.invalid && authForm.get('password')?.touched) {
                <mat-error>
                  @if (authForm.get('password')?.errors?.['required']) {
                    La contraseña es requerida
                  }
                  @if (authForm.get('password')?.errors?.['minlength']) {
                    Mínimo 6 caracteres
                  }
                </mat-error>
              }
            </mat-form-field>
            
            <!-- Confirmar contraseña (solo registro) -->
            @if (!isLoginMode()) {
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Confirmar Contraseña</mat-label>
                <input matInput 
                       [type]="hidePassword() ? 'password' : 'text'" 
                       formControlName="confirmPassword"
                       placeholder="Confirma tu contraseña">
                <mat-icon matSuffix>lock</mat-icon>
                @if (authForm.get('confirmPassword')?.invalid && authForm.get('confirmPassword')?.touched) {
                  <mat-error>
                    @if (authForm.get('confirmPassword')?.errors?.['required']) {
                      Confirma tu contraseña
                    }
                    @if (authForm.errors?.['passwordMismatch']) {
                      Las contraseñas no coinciden
                    }
                  </mat-error>
                }
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Teléfono (opcional)</mat-label>
                <input matInput 
                       type="tel" 
                       formControlName="telefono" 
                       placeholder="+34 600 00 00 00">
                <mat-icon matSuffix>phone</mat-icon>
              </mat-form-field>
            }
            
            <!-- Opciones de login -->
            @if (isLoginMode()) {
              <div class="login-options">
                <mat-checkbox formControlName="rememberMe">Recordarme</mat-checkbox>
                <a class="forgot-password" href="#">¿Olvidaste tu contraseña?</a>
              </div>
            }
            
            <!-- Botón de submit -->
            <button mat-raised-button 
                    color="primary" 
                    type="submit" 
                    class="submit-button"
                    [disabled]="authForm.invalid || isLoading()">
              @if (isLoading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                {{ isLoginMode() ? 'Iniciar Sesión' : 'Registrarse' }}
              }
            </button>
          </form>
          
          <mat-divider class="divider"></mat-divider>
          
          <!-- Toggle modo -->
          <div class="mode-toggle">
            <p>
              {{ isLoginMode() ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?' }}
              <button mat-button 
                      type="button"
                      color="primary"
                      (click)="toggleMode()">
                {{ isLoginMode() ? 'Regístrate' : 'Inicia Sesión' }}
              </button>
            </p>
          </div>
          
          <!-- Credenciales de prueba -->
          @if (isLoginMode()) {
            <div class="demo-credentials">
              <p class="demo-title">Credenciales de prueba:</p>
              <div class="credential-item" (click)="fillDemoCredentials('admin')">
                <mat-icon>admin_panel_settings</mat-icon>
                <span>Admin: admin@baloncesto.com / Admin123!</span>
              </div>
              <div class="credential-item" (click)="fillDemoCredentials('entrenador')">
                <mat-icon>sports</mat-icon>
                <span>Entrenador: entrenador@baloncesto.com / Coach123!</span>
              </div>
              <div class="credential-item" (click)="fillDemoCredentials('analista')">
                <mat-icon>analytics</mat-icon>
                <span>Analista: analista@baloncesto.com / Analyst123!</span>
              </div>
              <div class="credential-item" (click)="fillDemoCredentials('visor')">
                <mat-icon>visibility</mat-icon>
                <span>Visor: visor@baloncesto.com / Viewer123!</span>
              </div>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    
    .login-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: -1;
    }
    
    .gradient-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      opacity: 0.9;
    }
    
    .basketball-pattern {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
    
    .login-card {
      width: 100%;
      max-width: 480px;
      padding: 2rem;
      margin: 2rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      border-radius: 16px;
    }
    
    .logo-section {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .logo-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #667eea;
      margin-bottom: 1rem;
    }
    
    .app-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
    
    mat-card-header {
      margin-bottom: 1.5rem;
    }
    
    mat-card-title h2 {
      text-align: center;
      color: #333;
      font-size: 1.8rem;
      margin: 0;
    }
    
    .name-fields {
      display: flex;
      gap: 1rem;
    }
    
    .half-width {
      flex: 1;
    }
    
    .full-width {
      width: 100%;
    }
    
    mat-form-field {
      margin-bottom: 0.5rem;
    }
    
    .login-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 1rem 0;
    }
    
    .forgot-password {
      color: #667eea;
      text-decoration: none;
      font-size: 0.9rem;
      
      &:hover {
        text-decoration: underline;
      }
    }
    
    .submit-button {
      width: 100%;
      height: 48px;
      font-size: 1.1rem;
      margin-top: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      
      mat-spinner {
        margin: 0 auto;
      }
    }
    
    .divider {
      margin: 2rem 0 1rem;
    }
    
    .mode-toggle {
      text-align: center;
      
      p {
        color: #666;
        margin: 0;
      }
    }
    
    .demo-credentials {
      margin-top: 2rem;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 8px;
    }
    
    .demo-title {
      font-weight: 600;
      color: #666;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }
    
    .credential-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      margin: 0.25rem 0;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.85rem;
      color: #666;
      
      &:hover {
        background: #e3f2fd;
        color: #667eea;
        transform: translateX(4px);
      }
      
      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }
    
    :host ::ng-deep {
      .mat-mdc-form-field-subscript-wrapper {
        margin-top: 0.25rem;
      }
      
      .mat-mdc-text-field-wrapper {
        background-color: #f5f5f5 !important;
      }
      
      .mat-mdc-form-field-focus-overlay {
        background-color: transparent;
      }
    }
  `]
})
export class LoginPagina {
  private fb = inject(FormBuilder);
  private authService = inject(AuthServicio);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  
  isLoginMode = signal(true);
  isLoading = signal(false);
  hidePassword = signal(true);
  
  authForm: FormGroup;
  
  constructor() {
    this.authForm = this.createForm();
    
    // Si el usuario ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }
  
  createForm(): FormGroup {
    if (this.isLoginMode()) {
      // Formulario de login
      return this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        rememberMe: [false]
      });
    } else {
      // Formulario de registro
      return this.fb.group({
        nombre: ['', Validators.required],
        apellido: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        telefono: [''],
        rememberMe: [false]
      }, { validators: this.passwordMatchValidator });
    }
  }
  
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }
  
  toggleMode(): void {
    this.isLoginMode.set(!this.isLoginMode());
    this.authForm = this.createForm();
  }
  
  fillDemoCredentials(role: string): void {
    const credentials: { [key: string]: { email: string; password: string } } = {
      admin: { email: 'admin@baloncesto.com', password: 'Admin123!' },
      entrenador: { email: 'entrenador@baloncesto.com', password: 'Coach123!' },
      analista: { email: 'analista@baloncesto.com', password: 'Analyst123!' },
      visor: { email: 'visor@baloncesto.com', password: 'Viewer123!' }
    };
    
    if (credentials[role]) {
      this.authForm.patchValue({
        email: credentials[role].email,
        password: credentials[role].password
      });
    }
  }
  
  onSubmit(): void {
    if (this.authForm.invalid) {
      Object.keys(this.authForm.controls).forEach(key => {
        this.authForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    this.isLoading.set(true);
    const formValue = this.authForm.value;
    
    if (this.isLoginMode()) {
      // Login
      this.authService.login({
        email: formValue.email,
        password: formValue.password
      }).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          if (response.success) {
            this.snackBar.open('¡Bienvenido!', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/dashboard']);
          } else {
            this.snackBar.open(response.message || 'Error al iniciar sesión', 'Cerrar', { 
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          this.snackBar.open('Error de conexión', 'Cerrar', { 
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      // Registro
      this.authService.register({
        nombre: formValue.nombre,
        apellido: formValue.apellido,
        email: formValue.email,
        password: formValue.password,
        telefono: formValue.telefono
      }).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          if (response.success) {
            this.snackBar.open('¡Registro exitoso! Bienvenido', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/dashboard']);
          } else {
            this.snackBar.open(response.message || 'Error al registrarse', 'Cerrar', { 
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          this.snackBar.open('Error de conexión', 'Cerrar', { 
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}
