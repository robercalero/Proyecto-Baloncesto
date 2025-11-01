import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { NotificacionesServicio } from '../../services/notificaciones-servicio';
import { AnalyticsServicio } from '../../services/analytics-servicio';
import { EstadisticaTienda } from '../../services/estadistica-tienda';

@Component({
  selector: 'app-configuracion-pagina',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './configuracion-pagina.html',
  styleUrl: './configuracion-pagina.css'
})
export class ConfiguracionPagina {
  private readonly notificacionesServicio = inject(NotificacionesServicio);
  private readonly analytics = inject(AnalyticsServicio);
  private readonly tienda = inject(EstadisticaTienda);

  // Signals para configuración
  readonly temaOscuro = signal(false);
  readonly notificacionesPush = signal(true);
  readonly sonidoNotificaciones = signal(true);
  readonly autoGuardado = signal(true);
  readonly idioma = signal('es');
  readonly animaciones = signal(true);
  readonly compacto = signal(false);

  // Signals para datos de la aplicación
  readonly estadisticasGenerales = this.tienda.estadisticasGenerales;
  readonly totalJugadores = computed(() => this.tienda.jugadores().length);
  readonly totalEquipos = computed(() => this.tienda.equipos().length);
  readonly totalPartidos = computed(() => this.tienda.partidos().length);

  // Opciones de idioma
  readonly idiomas = [
    { codigo: 'es', nombre: 'Español', bandera: '🇪🇸' },
    { codigo: 'en', nombre: 'English', bandera: '🇺🇸' },
    { codigo: 'fr', nombre: 'Français', bandera: '🇫🇷' },
    { codigo: 'de', nombre: 'Deutsch', bandera: '🇩🇪' }
  ];

  // Opciones de tema
  readonly temas = [
    { id: 'claro', nombre: 'Claro', icono: 'light_mode' },
    { id: 'oscuro', nombre: 'Oscuro', icono: 'dark_mode' },
    { id: 'auto', nombre: 'Automático', icono: 'auto_mode' }
  ];

  constructor() {
    this.analytics.registrarNavegacion('configuracion');
    this.cargarConfiguracion();
  }

  private cargarConfiguracion(): void {
    // Cargar configuración desde localStorage
    const temaGuardado = localStorage.getItem('tema-oscuro');
    if (temaGuardado !== null) {
      this.temaOscuro.set(temaGuardado === 'true');
    }

    const notificacionesGuardadas = localStorage.getItem('notificaciones-push');
    if (notificacionesGuardadas !== null) {
      this.notificacionesPush.set(notificacionesGuardadas === 'true');
    }

    const sonidoGuardado = localStorage.getItem('sonido-notificaciones');
    if (sonidoGuardado !== null) {
      this.sonidoNotificaciones.set(sonidoGuardado === 'true');
    }

    const idiomaGuardado = localStorage.getItem('idioma');
    if (idiomaGuardado) {
      this.idioma.set(idiomaGuardado);
    }
  }

  // Métodos para cambiar configuración
  cambiarTemaOscuro(oscuro: boolean): void {
    this.temaOscuro.set(oscuro);
    localStorage.setItem('tema-oscuro', oscuro.toString());
    this.aplicarTema();
    this.analytics.registrarEvento('configuracion', 'cambiar_tema', { oscuro });
  }

  cambiarNotificacionesPush(habilitado: boolean): void {
    this.notificacionesPush.set(habilitado);
    localStorage.setItem('notificaciones-push', habilitado.toString());
    this.analytics.registrarEvento('configuracion', 'cambiar_notificaciones', { habilitado });
  }

  cambiarSonidoNotificaciones(habilitado: boolean): void {
    this.sonidoNotificaciones.set(habilitado);
    localStorage.setItem('sonido-notificaciones', habilitado.toString());
    this.analytics.registrarEvento('configuracion', 'cambiar_sonido', { habilitado });
  }

  cambiarAutoGuardado(habilitado: boolean): void {
    this.autoGuardado.set(habilitado);
    localStorage.setItem('auto-guardado', habilitado.toString());
    this.analytics.registrarEvento('configuracion', 'cambiar_auto_guardado', { habilitado });
  }

  cambiarIdioma(codigo: string): void {
    this.idioma.set(codigo);
    localStorage.setItem('idioma', codigo);
    this.analytics.registrarEvento('configuracion', 'cambiar_idioma', { codigo });
  }

  cambiarAnimaciones(habilitado: boolean): void {
    this.animaciones.set(habilitado);
    localStorage.setItem('animaciones', habilitado.toString());
    this.analytics.registrarEvento('configuracion', 'cambiar_animaciones', { habilitado });
  }

  cambiarCompacto(habilitado: boolean): void {
    this.compacto.set(habilitado);
    localStorage.setItem('compacto', habilitado.toString());
    this.analytics.registrarEvento('configuracion', 'cambiar_compacto', { habilitado });
  }

  private aplicarTema(): void {
    const body = document.body;
    if (this.temaOscuro()) {
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
    }
  }

  // Métodos para gestión de datos
  exportarDatos(): void {
    const datos = {
      jugadores: this.tienda.jugadores(),
      equipos: this.tienda.equipos(),
      partidos: this.tienda.partidos(),
      configuracion: {
        temaOscuro: this.temaOscuro(),
        notificacionesPush: this.notificacionesPush(),
        sonidoNotificaciones: this.sonidoNotificaciones(),
        idioma: this.idioma()
      },
      exportado: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proyecto-baloncesto-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.analytics.registrarEvento('configuracion', 'exportar_datos', {});
  }

  importarDatos(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const datos = JSON.parse(e.target?.result as string);
          
          if (confirm('¿Estás seguro de que quieres importar estos datos? Se sobrescribirán los datos actuales.')) {
            // Importar datos
            if (datos.jugadores) {
              // Aquí se importarían los jugadores
            }
            if (datos.equipos) {
              // Aquí se importarían los equipos
            }
            if (datos.partidos) {
              // Aquí se importarían los partidos
            }
            
            this.analytics.registrarEvento('configuracion', 'importar_datos', {});
          }
        } catch (error) {
          alert('Error al importar el archivo. Verifica que sea un archivo JSON válido.');
          this.analytics.registrarError('Error importando datos', 'configuracion');
        }
      };
      reader.readAsText(file);
    }
  }

  limpiarDatos(): void {
    if (confirm('¿Estás seguro de que quieres limpiar todos los datos? Esta acción no se puede deshacer.')) {
      this.tienda.limpiarDatos();
      this.analytics.limpiarDatos();
      this.analytics.registrarEvento('configuracion', 'limpiar_datos', {});
    }
  }

  resetearConfiguracion(): void {
    if (confirm('¿Estás seguro de que quieres resetear toda la configuración a los valores por defecto?')) {
      localStorage.clear();
      location.reload();
      this.analytics.registrarEvento('configuracion', 'resetear_configuracion', {});
    }
  }

  // Métodos para notificaciones
  probarNotificaciones(): void {
    this.notificacionesServicio.crearNotificacion(
      'sistema',
      'Notificación de prueba',
      'Esta es una notificación de prueba para verificar que el sistema funciona correctamente.',
      'media'
    );
    this.analytics.registrarEvento('configuracion', 'probar_notificaciones', {});
  }

  solicitarPermisosNotificaciones(): void {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.probarNotificaciones();
        } else {
          alert('Los permisos de notificación fueron denegados.');
        }
      });
    } else {
      alert('Tu navegador no soporta notificaciones.');
    }
  }
}
