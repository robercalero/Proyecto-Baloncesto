export interface Partido {
  id: string;
  equipoLocalId: number;
  equipoVisitanteId: number;
  puntosLocal: number;
  puntosVisitante: number;
  fecha: string; // ISO date
  temporada: string;
  jornada: number;
  estado: EstadoPartido;
  arbitroPrincipal: string;
  arbitrosSecundarios: string[];
  estadio: string;
  asistencia: number;
  duracion: number; // en minutos
  prorroga: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export type EstadoPartido = 'Programado' | 'EnCurso' | 'Finalizado' | 'Cancelado' | 'Suspendido';

export interface EstadisticasPartido {
  liderPuntos: {
    jugadorId: string;
    puntos: number;
  };
  liderRebotes: {
    jugadorId: string;
    rebotes: number;
  };
  liderAsistencias: {
    jugadorId: string;
    asistencias: number;
  };
  cuartos: {
    local: number[];
    visitante: number[];
  };
  tiempoExtra: boolean;
  mayorDiferencia: number;
  momentoMayorDiferencia: string;
}

export interface PartidoConEstadisticas extends Partido {
  estadisticas: EstadisticasPartido;
}

// Alias para mantener compatibilidad
export type Partidos = Partido;
