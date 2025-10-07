import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { AnalyticsServicio } from '../../services/analytics-servicio';
import { EstadisticaTienda } from '../../services/estadistica-tienda';

@Component({
  selector: 'app-analytics-pagina',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MaterialModule],
  templateUrl: './analytics-pagina.html',
  styleUrl: './analytics-pagina.css'
})
export class AnalyticsPagina {
  private readonly analytics = inject(AnalyticsServicio);
  private readonly tienda = inject(EstadisticaTienda);

  // Signals para datos
  readonly metricas = this.analytics.metricas;
  readonly eventos = this.analytics.eventos;
  readonly eventosPorTipo = this.analytics.eventosPorTipo;
  readonly eventosRecientes = this.analytics.eventosRecientes;
  readonly actividadPorHora = this.analytics.actividadPorHora;

  // Computed para estadísticas de la aplicación
  readonly estadisticasApp = computed(() => {
    const jugadores = this.tienda.jugadores();
    const equipos = this.tienda.equipos();
    const partidos = this.tienda.partidos();
    
    return {
      totalJugadores: jugadores.length,
      totalEquipos: equipos.length,
      totalPartidos: partidos.length,
      jugadoresActivos: jugadores.filter(j => j.activo).length,
      partidosFinalizados: partidos.filter(p => p.estado === 'Finalizado').length
    };
  });

  // Computed para métricas de rendimiento
  readonly metricasRendimiento = computed(() => {
    const eventos = this.eventos();
    const eventosNavegacion = eventos.filter(e => e.tipo === 'navegacion');
    const eventosError = eventos.filter(e => e.tipo === 'error');
    
    return {
      totalEventos: eventos.length,
      eventosNavegacion: eventosNavegacion.length,
      eventosError: eventosError.length,
      tasaErrores: eventos.length > 0 ? (eventosError.length / eventos.length) * 100 : 0,
      eventosHoy: eventos.filter(e => 
        new Date(e.timestamp).toDateString() === new Date().toDateString()
      ).length
    };
  });

  constructor() {
    this.analytics.registrarNavegacion('analytics');
  }

  exportarDatos(): void {
    const datos = this.analytics.exportarDatos();
    const blob = new Blob([datos], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    this.analytics.registrarEvento('analytics', 'exportar_datos', {});
  }

  limpiarDatos(): void {
    if (confirm('¿Estás seguro de que quieres limpiar todos los datos de analytics?')) {
      this.analytics.limpiarDatos();
      this.analytics.registrarEvento('analytics', 'limpiar_datos', {});
    }
  }

  obtenerEventosPorTipo(tipo: string) {
    return this.analytics.obtenerEventosPorTipo(tipo);
  }

  obtenerIconoTipo(tipo: string): string {
    const iconos: Record<string, string> = {
      'navegacion': 'navigation',
      'jugador': 'person',
      'equipo': 'groups',
      'partido': 'sports',
      'error': 'error',
      'busqueda': 'search',
      'filtro': 'filter_list',
      'vista': 'view_module',
      'app': 'apps',
      'http': 'http',
      'analytics': 'analytics'
    };
    return iconos[tipo] || 'help';
  }

  formatearTimestamp(timestamp: string): string {
    const fecha = new Date(timestamp);
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias}d`;
    
    return fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  obtenerAlturaBarra(cantidad: number): number {
    const maxCantidad = Math.max(...this.actividadPorHora().map(h => h.cantidad));
    if (maxCantidad === 0) return 0;
    return (cantidad / maxCantidad) * 100;
  }

  obtenerNivelActividad(cantidad: number): number {
    if (cantidad === 0) return 0;
    if (cantidad <= 5) return 1;
    if (cantidad <= 15) return 2;
    return 3;
  }
}
