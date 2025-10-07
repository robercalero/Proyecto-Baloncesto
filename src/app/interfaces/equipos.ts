export interface Equipo {
  id: number;
  nombreEquipo: string;
  ciudad: string;
  conferencia: Conferencia;
  division: Division;
  colorPrimario: string;
  colorSecundario: string;
  logo: string;
  estadio: string;
  capacidadEstadio: number;
  fechaFundacion: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export type Conferencia = 'Este' | 'Oeste';
export type Division = 'Atlántico' | 'Central' | 'Sudeste' | 'Noroeste' | 'Pacífico' | 'Suroeste';

export interface EstadisticasEquipo {
  partidosJugados: number;
  partidosGanados: number;
  partidosPerdidos: number;
  porcentajeVictorias: number;
  puntosAFavor: number;
  puntosEnContra: number;
  diferenciaPuntos: number;
  rachaActual: number;
  rachaTipo: 'Ganando' | 'Perdiendo';
  posicionConferencia: number;
  posicionDivision: number;
  // Propiedades adicionales para compatibilidad
  ganados: number;
  perdidos: number;
  totalPuntosAFavor: number;
  totalPuntosEnContra: number;
}

export interface EquipoConEstadisticas extends Equipo {
  estadisticas: EstadisticasEquipo;
}

// Alias para mantener compatibilidad
export type Equipos = Equipo;