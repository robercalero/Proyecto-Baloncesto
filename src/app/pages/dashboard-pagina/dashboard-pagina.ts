import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { EstadisticaTienda } from '../../services/estadistica-tienda';
import { AnalyticsServicio } from '../../services/analytics-servicio';
import { EstadisticasAvanzadasComponente } from '../../shared/estadisticas-avanzadas-componente/estadisticas-avanzadas-componente';
import { LoadingComponente } from '../../shared/loading-componente/loading-componente';

interface MetricCard {
  titulo: string;
  valor: number;
  icono: string;
  color: string;
  tendencia?: 'up' | 'down' | 'neutral';
  cambio?: number;
}

interface QuickAction {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
  ruta: string;
  color: string;
}

@Component({
  selector: 'dashboard-pagina',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatTabsModule, EstadisticasAvanzadasComponente, LoadingComponente],
  templateUrl: './dashboard-pagina.html',
  styleUrl: './dashboard-pagina.css',
})
export class DashboardPagina {
  private readonly tienda = inject(EstadisticaTienda);
  private readonly analytics = inject(AnalyticsServicio);

  // Signals para datos
  readonly jugadores = this.tienda.jugadores;
  readonly equipos = this.tienda.equipos;
  readonly partidos = this.tienda.partidos;
  readonly estadisticasGenerales = this.tienda.estadisticasGenerales;
  readonly rankingEquipos = this.tienda.rankingEquipos;
  readonly rankingJugadores = this.tienda.rankingJugadores;

  // Signals para UI
  readonly vistaActual = signal<'resumen' | 'estadisticas' | 'ranking'>('resumen');
  readonly cargando = signal(false);

  // Computed para métricas principales
  readonly metricasPrincipales = computed<MetricCard[]>(() => {
    const jugadores = this.jugadores();
    const equipos = this.equipos();
    const partidos = this.partidos();
    const estadisticas = this.estadisticasGenerales();

    return [
      {
        titulo: 'Total Jugadores',
        valor: jugadores.length,
        icono: 'person',
        color: 'primary',
        tendencia: 'up'
      },
      {
        titulo: 'Total Equipos',
        valor: equipos.length,
        icono: 'groups',
        color: 'accent',
        tendencia: 'neutral'
      },
      {
        titulo: 'Partidos Jugados',
        valor: partidos.filter(p => p.estado === 'Finalizado').length,
        icono: 'sports',
        color: 'warn',
        tendencia: 'up'
      },
      {
        titulo: 'Promedio Puntos',
        valor: Math.round(estadisticas.promedioPuntosPorPartido * 10) / 10,
        icono: 'analytics',
        color: 'primary',
        tendencia: 'up'
      }
    ];
  });

  // Computed para acciones rápidas
  readonly accionesRapidas = computed<QuickAction[]>(() => [
    {
      id: 'nuevo-jugador',
      titulo: 'Nuevo Jugador',
      descripcion: 'Añadir un nuevo jugador al sistema',
      icono: 'person_add',
      ruta: '/jugadores',
      color: 'primary'
    },
    {
      id: 'nuevo-equipo',
      titulo: 'Nuevo Equipo',
      descripcion: 'Registrar un nuevo equipo',
      icono: 'group_add',
      ruta: '/equipos',
      color: 'accent'
    },
    {
      id: 'nuevo-partido',
      titulo: 'Nuevo Partido',
      descripcion: 'Programar un nuevo partido',
      icono: 'event',
      ruta: '/partidos',
      color: 'warn'
    },
    {
      id: 'ver-analytics',
      titulo: 'Analytics',
      descripcion: 'Ver estadísticas detalladas',
      icono: 'analytics',
      ruta: '/analytics',
      color: 'primary'
    }
  ]);

  // Computed para partidos recientes
  readonly partidosRecientes = computed(() => {
    return this.partidos()
      .filter(p => p.estado === 'Finalizado')
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 5);
  });

  // Computed para jugadores destacados
  readonly jugadoresDestacados = computed(() => {
    return this.rankingJugadores().slice(0, 3);
  });

  // Computed para equipos líderes
  readonly equiposLideres = computed(() => {
    return this.rankingEquipos().slice(0, 3);
  });

  constructor() {
    this.analytics.registrarEvento('dashboard', 'cargar', {});
  }

  cambiarVista(vista: 'resumen' | 'estadisticas' | 'ranking'): void {
    this.vistaActual.set(vista);
    this.analytics.registrarEvento('dashboard', 'cambiar_vista', { vista });
  }

  navegarA(ruta: string): void {
    this.analytics.registrarEvento('dashboard', 'navegar', { ruta });
    // La navegación se manejará por el router
  }

  obtenerColorTendencia(tendencia?: 'up' | 'down' | 'neutral'): string {
    switch (tendencia) {
      case 'up': return 'var(--color-success)';
      case 'down': return 'var(--color-error)';
      default: return 'var(--color-text-secondary)';
    }
  }

  obtenerIconoTendencia(tendencia?: 'up' | 'down' | 'neutral'): string {
    switch (tendencia) {
      case 'up': return 'trending_up';
      case 'down': return 'trending_down';
      default: return 'trending_flat';
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  obtenerNombreEquipo(equipoId: string | number): string {
    const equipo = this.equipos().find(e => e.id === Number(equipoId));
    return equipo?.nombreEquipo || 'Equipo desconocido';
  }

  obtenerNombreJugador(jugadorId: string): string {
    const jugador = this.jugadores().find(j => j.id === jugadorId);
    return jugador ? `${jugador.nombreJugador} ${jugador.apellido}` : 'Jugador desconocido';
  }

  obtenerColorEstado(estado: string): string {
    const colores: Record<string, string> = {
      'Finalizado': 'var(--color-success)',
      'EnCurso': 'var(--color-primary)',
      'Programado': 'var(--color-warn)',
      'Cancelado': 'var(--color-error)',
      'Suspendido': 'var(--color-text-secondary)'
    };
    return colores[estado] || 'var(--color-text-secondary)';
  }

  // Helper methods for template
  readonly Math = Math;
}