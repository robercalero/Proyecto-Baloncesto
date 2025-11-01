import { Routes } from '@angular/router';
import { JugadoresPagina } from './pages/jugadores-pagina/jugadores-pagina';
import { EquiposPagina } from './pages/equipos-pagina/equipos-pagina';
import { PartidosPagina } from './pages/partidos-pagina/partidos-pagina';
import { DashboardPagina } from './pages/dashboard-pagina/dashboard-pagina';
import { authGuard, roleGuard, guestGuard } from './guards/auth.guard';

export const rutas: Routes = [
  { 
    path: '', 
    redirectTo: '/dashboard', 
    pathMatch: 'full' 
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login-pagina/login-pagina').then(m => m.LoginPagina),
    title: 'Iniciar Sesión - Proyecto Baloncesto',
    canActivate: [guestGuard],
    data: {
      breadcrumb: 'Login',
      icon: 'login',
      description: 'Iniciar sesión en el sistema'
    }
  },
  { 
    path: 'dashboard', 
    component: DashboardPagina,
    title: 'Dashboard - Proyecto Baloncesto',
    canActivate: [authGuard],
    data: { 
      breadcrumb: 'Dashboard',
      icon: 'dashboard',
      description: 'Panel principal con estadísticas y resúmenes'
    }
  },
  { 
    path: 'jugadores', 
    component: JugadoresPagina,
    title: 'Jugadores - Proyecto Baloncesto',
    canActivate: [authGuard],
    data: { 
      breadcrumb: 'Jugadores',
      icon: 'person',
      description: 'Gestión completa de jugadores y sus estadísticas'
    }
  },
  { 
    path: 'equipos', 
    component: EquiposPagina,
    title: 'Equipos - Proyecto Baloncesto',
    canActivate: [authGuard],
    data: { 
      breadcrumb: 'Equipos',
      icon: 'groups',
      description: 'Administración de equipos y sus configuraciones'
    }
  },
  { 
    path: 'partidos', 
    component: PartidosPagina,
    title: 'Partidos - Proyecto Baloncesto',
    canActivate: [authGuard],
    data: { 
      breadcrumb: 'Partidos',
      icon: 'sports',
      description: 'Programación y seguimiento de partidos'
    }
  },
  { 
    path: 'analytics', 
    loadComponent: () => import('./pages/analytics-pagina/analytics-pagina').then(m => m.AnalyticsPagina),
    title: 'Analytics - Proyecto Baloncesto',
    canActivate: [authGuard, roleGuard],
    data: { 
      breadcrumb: 'Analytics',
      icon: 'analytics',
      description: 'Análisis avanzado de datos y métricas',
      roles: ['admin', 'entrenador', 'analista']
    }
  },
  { 
    path: 'configuracion', 
    loadComponent: () => import('./pages/configuracion-pagina/configuracion-pagina').then(m => m.ConfiguracionPagina),
    title: 'Configuración - Proyecto Baloncesto',
    canActivate: [authGuard],
    data: { 
      breadcrumb: 'Configuración',
      icon: 'settings',
      description: 'Configuración de la aplicación y preferencias'
    }
  },
  { 
    path: 'optimizacion', 
    loadComponent: () => import('./pages/optimizacion-pagina/optimizacion-pagina').then(m => m.OptimizacionPagina),
    title: 'Optimización - Proyecto Baloncesto',
    canActivate: [authGuard, roleGuard],
    data: { 
      breadcrumb: 'Optimización',
      icon: 'tune',
      description: 'Optimización de rendimiento y análisis avanzado',
      roles: ['admin', 'entrenador']
    }
  },
  { 
    path: '**', 
    redirectTo: '/dashboard',
    title: 'Página no encontrada'
  }
];
