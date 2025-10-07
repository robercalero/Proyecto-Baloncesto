export interface Notificacion {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  accion?: {
    tipo: 'navegar' | 'abrirModal' | 'ejecutarFuncion';
    valor: string;
  };
  prioridad: PrioridadNotificacion;
  expira?: string; // fecha de expiración
}

export type TipoNotificacion = 
  | 'partido' 
  | 'jugador' 
  | 'equipo' 
  | 'sistema' 
  | 'estadistica' 
  | 'record';

export type PrioridadNotificacion = 'baja' | 'media' | 'alta' | 'critica';

export interface ConfiguracionNotificaciones {
  partidos: boolean;
  jugadores: boolean;
  equipos: boolean;
  estadisticas: boolean;
  records: boolean;
  email: boolean;
  push: boolean;
  sonido: boolean;
}
