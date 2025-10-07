import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { signal } from '@angular/core';

// Signal global para el estado de carga
const loadingSignal = signal(false);

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo mostrar loading para peticiones que no sean de assets
  if (!req.url.includes('/assets/') && !req.url.includes('ngsw-worker.js')) {
    loadingSignal.set(true);
  }
  
  return next(req).pipe(
    finalize(() => {
      loadingSignal.set(false);
    })
  );
};

// Función para obtener el estado de carga
export const isLoading = () => loadingSignal();
