import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MaterialModule } from './material.module';
import { EstadisticaTienda } from './services/estadistica-tienda';
import { NotificacionesServicio } from './services/notificaciones-servicio';
import { AnalyticsServicio } from './services/analytics-servicio';
import { TipoNotificacion } from './interfaces/notificaciones';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive, 
    MaterialModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly tienda = inject(EstadisticaTienda);
  private readonly notificacionesServicio = inject(NotificacionesServicio);
  private readonly analytics = inject(AnalyticsServicio);

  protected readonly title = signal('Proyecto Baloncesto');
  
  // Signals para notificaciones
  readonly notificacionesNoLeidas = this.tienda.notificacionesNoLeidas;

  constructor() {
    // Registrar evento de inicialización
    this.analytics.registrarEvento('app', 'inicializado', {
      version: '2.0.0',
      timestamp: new Date().toISOString()
    });
  }

  // Métodos para manejo de notificaciones
  marcarComoLeida(id: string): void {
    this.tienda.marcarNotificacionComoLeida(id);
    this.analytics.registrarEvento('notificacion', 'marcar_leida', { id });
  }

  marcarTodasComoLeidas(): void {
    this.notificacionesNoLeidas().forEach(notificacion => {
      this.tienda.marcarNotificacionComoLeida(notificacion.id);
    });
    this.analytics.registrarEvento('notificacion', 'marcar_todas_leidas', {});
  }

  eliminarNotificacion(id: string): void {
    this.tienda.eliminarNotificacion(id);
    this.analytics.registrarEvento('notificacion', 'eliminar', { id });
  }

  obtenerIconoNotificacion(tipo: TipoNotificacion): string {
    const iconos: Record<TipoNotificacion, string> = {
      partido: 'sports',
      jugador: 'person',
      equipo: 'groups',
      estadistica: 'analytics',
      record: 'emoji_events',
      sistema: 'settings'
    };
    return iconos[tipo] || 'notifications';
  }

  formatearFecha(fecha: string): string {
    const fechaObj = new Date(fecha);
    const ahora = new Date();
    const diferencia = ahora.getTime() - fechaObj.getTime();
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias}d`;
    
    return fechaObj.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
