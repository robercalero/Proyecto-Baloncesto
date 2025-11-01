import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'admin' | 'entrenador' | 'analista' | 'visor';
  avatar?: string;
  telefono?: string;
  activo: boolean;
  ultimoAcceso?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    usuario: Usuario;
    token: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthServicio {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = environment.apiUrl;
  
  // Estado de autenticación
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Señales para estado reactivo
  public isAuthenticated = signal(false);
  public currentUser = signal<Usuario | null>(null);
  public userRole = signal<string>('');
  public isLoading = signal(false);
  
  constructor() {
    // Verificar si hay un token guardado al iniciar
    this.checkStoredAuth();
  }
  
  private checkStoredAuth(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.setCurrentUser(user);
        this.verifyToken().subscribe();
      } catch (error) {
        console.error('Error al recuperar sesión:', error);
        this.clearAuth();
      }
    }
  }
  
  // Login
  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.isLoading.set(true);
    
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.saveAuth(response.data.token, response.data.usuario);
            this.setCurrentUser(response.data.usuario);
          }
          this.isLoading.set(false);
        }),
        catchError(error => {
          this.isLoading.set(false);
          console.error('Error en login:', error);
          return of({
            success: false,
            message: error.error?.message || 'Error al iniciar sesión',
            data: null as any
          });
        })
      );
  }
  
  // Registro
  register(userData: RegisterRequest): Observable<AuthResponse> {
    this.isLoading.set(true);
    
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, userData)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.saveAuth(response.data.token, response.data.usuario);
            this.setCurrentUser(response.data.usuario);
          }
          this.isLoading.set(false);
        }),
        catchError(error => {
          this.isLoading.set(false);
          console.error('Error en registro:', error);
          return of({
            success: false,
            message: error.error?.message || 'Error al registrar usuario',
            data: null as any
          });
        })
      );
  }
  
  // Logout
  logout(): void {
    const token = localStorage.getItem('token');
    
    if (token) {
      this.http.post(`${this.baseUrl}/auth/logout`, {})
        .subscribe({
          complete: () => {
            this.clearAuth();
            this.router.navigate(['/login']);
          },
          error: () => {
            // Aún así hacer logout local
            this.clearAuth();
            this.router.navigate(['/login']);
          }
        });
    } else {
      this.clearAuth();
      this.router.navigate(['/login']);
    }
  }
  
  // Verificar token
  verifyToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/verify-token`, {})
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.setCurrentUser(response.data.usuario);
          } else {
            this.clearAuth();
          }
        }),
        catchError(() => {
          this.clearAuth();
          return of({
            success: false,
            message: 'Token inválido',
            data: null as any
          });
        })
      );
  }
  
  // Obtener perfil actual
  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/auth/me`)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.setCurrentUser(response.data.usuario);
          }
        }),
        catchError(error => {
          console.error('Error al obtener perfil:', error);
          return of(null);
        })
      );
  }
  
  // Actualizar perfil
  updateProfile(profileData: Partial<Usuario>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/auth/profile`, profileData)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.setCurrentUser(response.data.usuario);
            this.saveUserToStorage(response.data.usuario);
          }
        }),
        catchError(error => {
          console.error('Error al actualizar perfil:', error);
          return of(null);
        })
      );
  }
  
  // Cambiar contraseña
  changePassword(passwordData: { passwordActual: string; passwordNueva: string }): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/auth/change-password`, passwordData);
  }
  
  // Métodos auxiliares
  private setCurrentUser(user: Usuario): void {
    this.currentUserSubject.next(user);
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    this.userRole.set(user.rol);
  }
  
  private saveAuth(token: string, user: Usuario): void {
    localStorage.setItem('token', token);
    this.saveUserToStorage(user);
  }
  
  private saveUserToStorage(user: Usuario): void {
    localStorage.setItem('user', JSON.stringify(user));
  }
  
  private clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.userRole.set('');
  }
  
  // Getters útiles
  get isAdmin(): boolean {
    return this.userRole() === 'admin';
  }
  
  get isEntrenador(): boolean {
    return this.userRole() === 'entrenador';
  }
  
  get isAnalista(): boolean {
    return this.userRole() === 'analista';
  }
  
  get isVisor(): boolean {
    return this.userRole() === 'visor';
  }
  
  get canEdit(): boolean {
    return this.isAdmin || this.isEntrenador;
  }
  
  get canAnalyze(): boolean {
    return this.isAdmin || this.isEntrenador || this.isAnalista;
  }
  
  hasPermission(requiredRole: string | string[]): boolean {
    if (!this.isAuthenticated()) return false;
    
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(this.userRole());
  }
  
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
