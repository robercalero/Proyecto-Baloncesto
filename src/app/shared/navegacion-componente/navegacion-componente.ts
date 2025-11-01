import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { EstadisticaTienda } from '../../services/estadistica-tienda';
import { AnalyticsServicio } from '../../services/analytics-servicio';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: number;
  children?: MenuItem[];
}

@Component({
  selector: 'app-navegacion-componente',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatBadgeModule, MatMenuModule, MatDividerModule],
  templateUrl: './navegacion-componente.html',
  styleUrl: './navegacion-componente.css'
})
export class NavegacionComponente {
  private readonly router = inject(Router);
  private readonly tienda = inject(EstadisticaTienda);
  private readonly analytics = inject(AnalyticsServicio);

  readonly menuAbierto = signal(false);
  readonly vistaMovil = signal(false);

  readonly notificacionesNoLeidas = this.tienda.notificacionesNoLeidas;
  readonly notificaciones = this.tienda.notificaciones;

  readonly menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      id: 'equipos',
      label: 'Equipos',
      icon: 'groups',
      route: '/equipos'
    },
    {
      id: 'jugadores',
      label: 'Jugadores',
      icon: 'person',
      route: '/jugadores'
    },
    {
      id: 'partidos',
      label: 'Partidos',
      icon: 'sports',
      route: '/partidos'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: 'analytics',
      route: '/analytics'
    },
    {
      id: 'configuracion',
      label: 'Configuración',
      icon: 'settings',
      route: '/configuracion'
    }
  ];

  readonly menuItemsConBadges = computed(() => {
    return this.menuItems.map(item => ({
      ...item,
      badge: item.id === 'notificaciones' ? this.notificacionesNoLeidas().length : undefined
    }));
  });

  readonly rutaActual = computed(() => {
    return this.router.url;
  });

  readonly esRutaActiva = (ruta: string): boolean => {
    return this.rutaActual().startsWith(ruta);
  };

  toggleMenu(): void {
    this.menuAbierto.update(abierto => !abierto);
    this.analytics.registrarEvento('navegacion', 'toggle_menu', {
      abierto: !this.menuAbierto()
    });
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
    this.cerrarMenu();
    
    this.analytics.registrarEvento('navegacion', 'navegar', {
      ruta,
      desde: this.rutaActual()
    });
  }

  toggleVistaMovil(): void {
    this.vistaMovil.update(vista => !vista);
  }

  obtenerClaseActiva(ruta: string): string {
    return this.esRutaActiva(ruta) ? 'activo' : '';
  }

  obtenerIconoMenu(): string {
    return this.menuAbierto() ? 'close' : 'menu';
  }

  marcarTodasComoLeidas(): void {
    // Implementar lógica para marcar todas como leídas
    this.analytics.registrarEvento('notificaciones', 'marcar_todas_leidas', {});
  }

  marcarComoLeida(notificacionId: string): void {
    this.tienda.marcarNotificacionComoLeida(notificacionId);
    this.analytics.registrarEvento('notificaciones', 'marcar_leida', { notificacionId });
  }

  obtenerIconoNotificacion(tipo: string): string {
    const iconos: Record<string, string> = {
      'partido': 'sports',
      'jugador': 'person',
      'equipo': 'groups',
      'sistema': 'settings',
      'info': 'info'
    };
    return iconos[tipo] || 'notifications';
  }

  formatearFecha(fecha: string): string {
    const fechaObj = new Date(fecha);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fechaObj.getTime();
    const diffMinutos = Math.floor(diffMs / (1000 * 60));
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutos < 1) return 'Ahora';
    if (diffMinutos < 60) return `Hace ${diffMinutos}m`;
    if (diffHoras < 24) return `Hace ${diffHoras}h`;
    if (diffDias < 7) return `Hace ${diffDias}d`;
    return fechaObj.toLocaleDateString('es-ES');
  }

  cerrarSesion(): void {
    this.analytics.registrarEvento('usuario', 'cerrar_sesion', {});
    // Aquí implementarías la lógica de cierre de sesión
    console.log('Cerrando sesión...');
  }
}
