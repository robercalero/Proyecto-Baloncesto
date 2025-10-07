import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { AnalyticsServicio } from '../services/analytics-servicio';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const analytics = inject(AnalyticsServicio);
  
  const startTime = Date.now();
  
  // Registrar inicio de petición
  analytics.registrarEvento('http', 'request_start', {
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  return next(req).pipe(
    tap({
      next: (response) => {
        const duration = Date.now() - startTime;
        analytics.registrarEvento('http', 'request_success', {
          url: req.url,
          method: req.method,
          status: (response as any).status || 200,
          duration,
          timestamp: new Date().toISOString()
        });
      },
      error: (error) => {
        const duration = Date.now() - startTime;
        analytics.registrarError(`HTTP Error: ${error.status}`, req.url);
        analytics.registrarEvento('http', 'request_error', {
          url: req.url,
          method: req.method,
          status: error.status,
          duration,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    })
  );
};
