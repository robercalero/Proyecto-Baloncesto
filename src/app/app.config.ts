import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, isDevMode, LOCALE_ID } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules, withInMemoryScrolling, withRouterConfig } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { rutas } from './app.routes';
import { loggingInterceptor } from './interceptors/logging.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { loadingInterceptor } from './interceptors/loading.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Configuración de Angular Core
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    
    // Configuración de Router con optimizaciones
    provideRouter(
      rutas,
      withPreloading(PreloadAllModules),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      }),
      withRouterConfig({
        onSameUrlNavigation: 'reload'
      })
    ),
    
    // Configuración de HTTP Client con interceptores
    provideHttpClient(
      withFetch(),
      withInterceptors([
        loggingInterceptor,
        errorInterceptor,
        loadingInterceptor
      ])
    ),
    
    // Configuración de Service Worker para PWA
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    
    // Configuración de animaciones
    provideAnimationsAsync(),
    
    // Configuración de hidratación del cliente
    provideClientHydration(
      withEventReplay()
    ),
    
    // Configuración de localización
    {
      provide: LOCALE_ID,
      useValue: 'es-ES'
    },
    
    // Configuración de desarrollo
    ...(isDevMode() ? [
      // Solo en modo desarrollo
    ] : [])
  ]
};
