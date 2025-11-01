import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthServicio } from '../services/auth-servicio';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthServicio);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  
  // Guardar la URL intentada para redirección después del login
  localStorage.setItem('redirectUrl', state.url);
  
  // Redirigir al login
  router.navigate(['/login']);
  return false;
};

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthServicio);
  const router = inject(Router);
  
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }
  
  const requiredRoles = route.data['roles'] as string[];
  
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }
  
  if (authService.hasPermission(requiredRoles)) {
    return true;
  }
  
  // No tiene permisos, redirigir al dashboard
  router.navigate(['/dashboard']);
  return false;
};

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthServicio);
  const router = inject(Router);
  
  if (!authService.isAuthenticated()) {
    return true;
  }
  
  // Ya está autenticado, redirigir al dashboard
  router.navigate(['/dashboard']);
  return false;
};
