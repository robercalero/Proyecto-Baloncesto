export interface Jugador {
  id: string;
  nombreJugador: string;
  apellido: string;
  dorsal: number;
  equipoId: number;
  posicion: PosicionJugador;
  altura: number; // en centímetros
  peso: number; // en kilogramos
  fechaNacimiento: string; // ISO date
  nacionalidad: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export type PosicionJugador = 'Base' | 'Escolta' | 'Alero' | 'Ala-Pívot' | 'Pívot';

export interface EstadisticasJugador {
  partidosJugados: number;
  puntosPorPartido: number;
  rebotesPorPartido: number;
  asistenciasPorPartido: number;
  robosPorPartido: number;
  taponesPorPartido: number;
  porcentajeTiros: number;
  porcentajeTriples: number;
  porcentajeTirosLibres: number;
  minutosPorPartido: number;
}

export interface JugadorConEstadisticas extends Jugador {
  estadisticas: EstadisticasJugador;
}

// Alias para mantener compatibilidad
export type Jugadores = Jugador;