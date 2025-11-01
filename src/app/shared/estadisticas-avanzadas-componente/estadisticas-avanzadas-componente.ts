import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { EstadisticaTienda } from '../../services/estadistica-tienda';
import { AnalyticsServicio } from '../../services/analytics-servicio';

@Component({
  selector: 'app-estadisticas-avanzadas-componente',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './estadisticas-avanzadas-componente.html',
  styleUrl: './estadisticas-avanzadas-componente.css'
})
export class EstadisticasAvanzadasComponente {
  private readonly tienda = inject(EstadisticaTienda);
  private readonly analytics = inject(AnalyticsServicio);

  // Signals para datos
  readonly estadisticasGenerales = this.tienda.estadisticasGenerales;
  readonly rankingEquipos = this.tienda.rankingEquipos;
  readonly rankingJugadores = this.tienda.rankingJugadores;
  readonly jugadores = this.tienda.jugadores;
  readonly equipos = this.tienda.equipos;
  readonly partidos = this.tienda.partidos;

  // Computed para estadísticas calculadas
  readonly estadisticasCalculadas = computed(() => {
    const jugadores = this.jugadores();
    const equipos = this.equipos();
    const partidos = this.partidos();

    return {
      totalJugadores: jugadores.length,
      totalEquipos: equipos.length,
      totalPartidos: partidos.length,
      jugadoresActivos: jugadores.filter(j => j.activo).length,
      partidosFinalizados: partidos.filter(p => p.estado === 'Finalizado').length,
      partidosProgramados: partidos.filter(p => p.estado === 'Programado').length,
      promedioEdad: this.calcularPromedioEdad(jugadores),
      distribucionPosiciones: this.calcularDistribucionPosiciones(jugadores),
      equiposPorConferencia: this.calcularEquiposPorConferencia(equipos)
    };
  });

  readonly metricasRendimiento = computed(() => {
    const partidos = this.partidos();
    const partidosFinalizados = partidos.filter(p => p.estado === 'Finalizado');
    
    if (partidosFinalizados.length === 0) {
      return {
        promedioPuntos: 0,
        partidoMasAlto: 0,
        partidoMasBajo: 0,
        totalPuntos: 0
      };
    }

    const totalPuntos = partidosFinalizados.reduce((sum, p) => sum + p.puntosLocal + p.puntosVisitante, 0);
    const promedioPuntos = totalPuntos / partidosFinalizados.length;
    const puntosPorPartido = partidosFinalizados.map(p => p.puntosLocal + p.puntosVisitante);
    const partidoMasAlto = Math.max(...puntosPorPartido);
    const partidoMasBajo = Math.min(...puntosPorPartido);

    return {
      promedioPuntos: Math.round(promedioPuntos * 10) / 10,
      partidoMasAlto,
      partidoMasBajo,
      totalPuntos
    };
  });

  constructor() {
    this.analytics.registrarEvento('estadisticas', 'cargar_avanzadas', {});
  }

  private calcularPromedioEdad(jugadores: any[]): number {
    if (jugadores.length === 0) return 0;
    
    const edades = jugadores.map(j => {
      const fechaNacimiento = new Date(j.fechaNacimiento);
      const hoy = new Date();
      return hoy.getFullYear() - fechaNacimiento.getFullYear();
    });
    
    const sumaEdades = edades.reduce((sum, edad) => sum + edad, 0);
    return Math.round(sumaEdades / edades.length);
  }

  private calcularDistribucionPosiciones(jugadores: any[]): Record<string, number> {
    const distribucion: Record<string, number> = {};
    
    jugadores.forEach(jugador => {
      const posicion = jugador.posicion || 'Sin posición';
      distribucion[posicion] = (distribucion[posicion] || 0) + 1;
    });
    
    return distribucion;
  }

  private calcularEquiposPorConferencia(equipos: any[]): Record<string, number> {
    const distribucion: Record<string, number> = {};
    
    equipos.forEach(equipo => {
      const conferencia = equipo.conferencia || 'Sin conferencia';
      distribucion[conferencia] = (distribucion[conferencia] || 0) + 1;
    });
    
    return distribucion;
  }

  obtenerColorPosicion(posicion: string): string {
    const colores: Record<string, string> = {
      'Base': '#2196f3',
      'Escolta': '#4caf50',
      'Alero': '#ff9800',
      'Ala-Pívot': '#9c27b0',
      'Pívot': '#f44336'
    };
    return colores[posicion] || '#757575';
  }

  obtenerColorEstado(estado: string): string {
    const colores: Record<string, string> = {
      'Programado': '#ff9800',
      'EnCurso': '#2196f3',
      'Finalizado': '#4caf50',
      'Cancelado': '#f44336',
      'Suspendido': '#9e9e9e'
    };
    return colores[estado] || '#757575';
  }

  formatearNumero(numero: number): string {
    return numero.toLocaleString('es-ES');
  }

  formatearPorcentaje(valor: number, total: number): string {
    if (total === 0) return '0%';
    const porcentaje = (valor / total) * 100;
    return `${Math.round(porcentaje * 10) / 10}%`;
  }

  // Helper methods for template
  readonly Object = Object;
  readonly Math = Math;
}
