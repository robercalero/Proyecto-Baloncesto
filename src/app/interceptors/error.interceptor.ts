import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AnalyticsServicio } from '../services/analytics-servicio';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const analytics = inject(AnalyticsServicio);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado';
      
      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Error del lado del servidor
        switch (error.status) {
          case 400:
            errorMessage = 'Solicitud incorrecta';
            break;
          case 401:
            errorMessage = 'No autorizado. Por favor, inicia sesión.';
            break;
          case 403:
            errorMessage = 'Acceso denegado';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado';
            break;
          case 500:
            errorMessage = 'Error interno del servidor';
            break;
          case 503:
            errorMessage = 'Servicio no disponible temporalmente';
            break;
          default:
            errorMessage = `Error ${error.status}: ${error.message}`;
        }
      }
      
      // Mostrar notificación al usuario (simplificado)
      console.error('Error HTTP:', errorMessage);
      
      // Registrar error en analytics
      analytics.registrarError(errorMessage, req.url);
      
      return throwError(() => error);
    })
  );
};
