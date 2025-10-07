import { Routes } from '@angular/router';
import { JugadoresPagina } from './pages/jugadores-pagina/jugadores-pagina';
import { EquiposPagina } from './pages/equipos-pagina/equipos-pagina';
import { PartidosPagina } from './pages/partidos-pagina/partidos-pagina';
import { DashboardPagina } from './pages/dashboard-pagina/dashboard-pagina';

export const rutas: Routes = [
  { 
    path: '', 
    redirectTo: '/dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: 'dashboard', 
    component: DashboardPagina,
    title: 'Dashboard - Proyecto Baloncesto',
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
    data: { 
      breadcrumb: 'Analytics',
      icon: 'analytics',
      description: 'Análisis avanzado de datos y métricas'
    }
  },
  { 
    path: 'configuracion', 
    loadComponent: () => import('./pages/configuracion-pagina/configuracion-pagina').then(m => m.ConfiguracionPagina),
    title: 'Configuración - Proyecto Baloncesto',
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
    data: { 
      breadcrumb: 'Optimización',
      icon: 'tune',
      description: 'Optimización de rendimiento y análisis avanzado'
    }
  },
  { 
    path: '**', 
    redirectTo: '/dashboard',
    title: 'Página no encontrada'
  }
];
