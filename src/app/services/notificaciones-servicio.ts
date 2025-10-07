import { Injectable, signal, computed } from '@angular/core';
import { Notificacion, TipoNotificacion, PrioridadNotificacion } from '../interfaces/notificaciones';

@Injectable({ providedIn: 'root' })
export class NotificacionesServicio {
  private readonly _notificaciones = signal<Notificacion[]>([]);
  private readonly _configuracion = signal({
    partidos: true,
    jugadores: true,
    equipos: true,
    estadisticas: true,
    records: true,
    email: false,
    push: true,
    sonido: true
  });

  readonly notificaciones = this._notificaciones.asReadonly();
  readonly configuracion = this._configuracion.asReadonly();

  readonly notificacionesNoLeidas = computed(() => 
    this._notificaciones().filter(n => !n.leida)
  );

  readonly notificacionesPorTipo = computed(() => {
    const notificaciones = this._notificaciones();
    return {
      partidos: notificaciones.filter(n => n.tipo === 'partido'),
      jugadores: notificaciones.filter(n => n.tipo === 'jugador'),
      equipos: notificaciones.filter(n => n.tipo === 'equipo'),
      estadisticas: notificaciones.filter(n => n.tipo === 'estadistica'),
      records: notificaciones.filter(n => n.tipo === 'record'),
      sistema: notificaciones.filter(n => n.tipo === 'sistema')
    };
  });

  readonly notificacionesPorPrioridad = computed(() => {
    const notificaciones = this._notificaciones();
    return {
      critica: notificaciones.filter(n => n.prioridad === 'critica'),
      alta: notificaciones.filter(n => n.prioridad === 'alta'),
      media: notificaciones.filter(n => n.prioridad === 'media'),
      baja: notificaciones.filter(n => n.prioridad === 'baja')
    };
  });

  crearNotificacion(
    tipo: TipoNotificacion,
    titulo: string,
    mensaje: string,
    prioridad: PrioridadNotificacion = 'media',
    accion?: { tipo: 'navegar' | 'abrirModal' | 'ejecutarFuncion'; valor: string }
  ): void {
    const notificacion: Notificacion = {
      id: this.generarId(),
      tipo,
      titulo,
      mensaje,
      fecha: new Date().toISOString(),
      leida: false,
      prioridad,
      accion
    };

    this._notificaciones.update(notificaciones => [notificacion, ...notificaciones]);

    // Reproducir sonido si está habilitado
    if (this._configuracion().sonido) {
      this.reproducirSonido(prioridad);
    }

    // Mostrar notificación del sistema si está habilitado
    if (this._configuracion().push && 'Notification' in window) {
      this.mostrarNotificacionSistema(notificacion);
    }
  }

  marcarComoLeida(id: string): void {
    this._notificaciones.update(notificaciones => 
      notificaciones.map(n => 
        n.id === id ? { ...n, leida: true } : n
      )
    );
  }

  marcarTodasComoLeidas(): void {
    this._notificaciones.update(notificaciones => 
      notificaciones.map(n => ({ ...n, leida: true }))
    );
  }

  eliminarNotificacion(id: string): void {
    this._notificaciones.update(notificaciones => 
      notificaciones.filter(n => n.id !== id)
    );
  }

  eliminarNotificacionesLeidas(): void {
    this._notificaciones.update(notificaciones => 
      notificaciones.filter(n => !n.leida)
    );
  }

  eliminarTodasLasNotificaciones(): void {
    this._notificaciones.set([]);
  }

  actualizarConfiguracion(configuracion: Partial<{
    partidos: boolean;
    jugadores: boolean;
    equipos: boolean;
    estadisticas: boolean;
    records: boolean;
    email: boolean;
    push: boolean;
    sonido: boolean;
  }>): void {
    this._configuracion.update(current => ({ ...current, ...configuracion }));
  }

  private generarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private reproducirSonido(prioridad: PrioridadNotificacion): void {
    const audio = new Audio();
    
    switch (prioridad) {
      case 'critica':
        audio.src = '/assets/sounds/critical.mp3';
        break;
      case 'alta':
        audio.src = '/assets/sounds/high.mp3';
        break;
      case 'media':
        audio.src = '/assets/sounds/medium.mp3';
        break;
      case 'baja':
        audio.src = '/assets/sounds/low.mp3';
        break;
    }

    audio.volume = 0.3;
    audio.play().catch(() => {
      // Ignorar errores de reproducción
    });
  }

  private mostrarNotificacionSistema(notificacion: Notificacion): void {
    if (Notification.permission === 'granted') {
      new Notification(notificacion.titulo, {
        body: notificacion.mensaje,
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-72x72.png',
        tag: notificacion.id,
        requireInteraction: notificacion.prioridad === 'critica'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.mostrarNotificacionSistema(notificacion);
        }
      });
    }
  }
}
