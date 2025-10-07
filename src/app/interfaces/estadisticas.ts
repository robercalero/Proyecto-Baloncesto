export interface EstadisticasGenerales {
  totalJugadores: number;
  totalEquipos: number;
  totalPartidos: number;
  temporadaActual: string;
  promedioPuntosPorPartido: number;
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
  equipoLider: {
    equipoId: number;
    victorias: number;
  };
}

export interface RankingEquipos {
  posicion: number;
  equipoId: number;
  nombreEquipo: string;
  partidosJugados: number;
  partidosGanados: number;
  partidosPerdidos: number;
  porcentajeVictorias: number;
  puntosAFavor: number;
  puntosEnContra: number;
  diferenciaPuntos: number;
}

export interface RankingJugadores {
  posicion: number;
  jugadorId: string;
  nombreJugador: string;
  apellido: string;
  equipoId: number;
  puntosPorPartido: number;
  rebotesPorPartido: number;
  asistenciasPorPartido: number;
  robosPorPartido: number;
  taponesPorPartido: number;
  porcentajeTiros: number;
  minutosPorPartido: number;
}

export interface Temporada {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
  totalJornadas: number;
  totalEquipos: number;
}

export interface Jornada {
  id: string;
  temporadaId: string;
  numero: number;
  fechaInicio: string;
  fechaFin: string;
  partidos: string[]; // IDs de partidos
  completada: boolean;
}
