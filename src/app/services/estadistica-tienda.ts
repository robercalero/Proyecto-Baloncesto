import { Injectable, signal, computed, effect } from '@angular/core';
import { Jugador, Jugadores, EstadisticasJugador, PosicionJugador } from '../interfaces/jugadores';
import { Equipo, Equipos, EstadisticasEquipo, Conferencia, Division } from '../interfaces/equipos';
import { Partido, Partidos, EstadoPartido } from '../interfaces/partidos';
import { EstadisticasGenerales, RankingEquipos, RankingJugadores, Temporada, Jornada } from '../interfaces/estadisticas';
import { Notificacion, TipoNotificacion, PrioridadNotificacion } from '../interfaces/notificaciones';

@Injectable({ providedIn: 'root' })
export class EstadisticaTienda {
  // Signals para el estado principal
  private readonly _jugadores = signal<Jugador[]>([]);
  private readonly _equipos = signal<Equipo[]>([]);
  private readonly _partidos = signal<Partido[]>([]);
  private readonly _temporadas = signal<Temporada[]>([]);
  private readonly _jornadas = signal<Jornada[]>([]);
  private readonly _notificaciones = signal<Notificacion[]>([]);
  
  // Signals para selecciones y filtros
  private readonly _jugadorSeleccionadoId = signal<string | null>(null);
  private readonly _equipoSeleccionadoId = signal<number | null>(null);
  private readonly _temporadaActiva = signal<string | null>(null);
  private readonly _filtroBusqueda = signal<string>('');
  private readonly _filtroPosicion = signal<PosicionJugador | null>(null);
  private readonly _filtroConferencia = signal<Conferencia | null>(null);

  // Getters públicos para los signals
  readonly jugadores = this._jugadores.asReadonly();
  readonly equipos = this._equipos.asReadonly();
  readonly partidos = this._partidos.asReadonly();
  readonly temporadas = this._temporadas.asReadonly();
  readonly jornadas = this._jornadas.asReadonly();
  readonly notificaciones = this._notificaciones.asReadonly();
  readonly jugadorSeleccionadoId = this._jugadorSeleccionadoId.asReadonly();
  readonly equipoSeleccionadoId = this._equipoSeleccionadoId.asReadonly();
  readonly temporadaActiva = this._temporadaActiva.asReadonly();
  readonly filtroBusqueda = this._filtroBusqueda.asReadonly();
  readonly filtroPosicion = this._filtroPosicion.asReadonly();
  readonly filtroConferencia = this._filtroConferencia.asReadonly();

  // Computed para selecciones
  readonly jugadorSeleccionado = computed(() => {
    const id = this._jugadorSeleccionadoId();
    if (!id) return null;
    return this._jugadores().find(j => j.id === id) || null;
  });

  readonly equipoSeleccionado = computed(() => {
    const id = this._equipoSeleccionadoId();
    if (!id) return null;
    return this._equipos().find(e => e.id === id) || null;
  });

  // Computed para estadísticas generales
  readonly estadisticasGenerales = computed<EstadisticasGenerales>(() => {
    const jugadores = this._jugadores();
    const equipos = this._equipos();
    const partidos = this._partidos();
    const temporada = this._temporadaActiva();

    return {
      totalJugadores: jugadores.length,
      totalEquipos: equipos.length,
      totalPartidos: partidos.length,
      temporadaActual: temporada || 'Sin temporada activa',
      promedioPuntosPorPartido: this.calcularPromedioPuntosPorPartido(),
      liderPuntos: this.obtenerLiderPuntos(),
      liderRebotes: this.obtenerLiderRebotes(),
      liderAsistencias: this.obtenerLiderAsistencias(),
      equipoLider: this.obtenerEquipoLider()
    };
  });

  // Computed para rankings
  readonly rankingEquipos = computed<RankingEquipos[]>(() => {
    return this._equipos().map(equipo => {
      const stats = this.estadisticasEquipo(equipo.id);
      return {
        posicion: 0, // Se calculará después
        equipoId: equipo.id,
        nombreEquipo: equipo.nombreEquipo,
        partidosJugados: stats.partidosJugados,
        partidosGanados: stats.partidosGanados,
        partidosPerdidos: stats.partidosPerdidos,
        porcentajeVictorias: stats.porcentajeVictorias,
        puntosAFavor: stats.puntosAFavor,
        puntosEnContra: stats.puntosEnContra,
        diferenciaPuntos: stats.diferenciaPuntos
      };
    }).sort((a, b) => b.porcentajeVictorias - a.porcentajeVictorias)
      .map((equipo, index) => ({ ...equipo, posicion: index + 1 }));
  });

  readonly rankingJugadores = computed<RankingJugadores[]>(() => {
    return this._jugadores().map(jugador => {
      const stats = this.estadisticasJugador(jugador.id);
      return {
        posicion: 0, // Se calculará después
        jugadorId: jugador.id,
        nombreJugador: jugador.nombreJugador,
        apellido: jugador.apellido,
        equipoId: jugador.equipoId,
        puntosPorPartido: stats.puntosPorPartido,
        rebotesPorPartido: stats.rebotesPorPartido,
        asistenciasPorPartido: stats.asistenciasPorPartido,
        robosPorPartido: stats.robosPorPartido,
        taponesPorPartido: stats.taponesPorPartido,
        porcentajeTiros: stats.porcentajeTiros,
        minutosPorPartido: stats.minutosPorPartido
      };
    }).sort((a, b) => b.puntosPorPartido - a.puntosPorPartido)
      .map((jugador, index) => ({ ...jugador, posicion: index + 1 }));
  });

  // Computed para filtros
  readonly jugadoresFiltrados = computed<Jugador[]>(() => {
    let jugadores = this._jugadores();
    const busqueda = this._filtroBusqueda().toLowerCase();
    const posicion = this._filtroPosicion();
    const conferencia = this._filtroConferencia();

    if (busqueda) {
      jugadores = jugadores.filter(j => 
        j.nombreJugador.toLowerCase().includes(busqueda) ||
        j.apellido.toLowerCase().includes(busqueda)
      );
    }

    if (posicion) {
      jugadores = jugadores.filter(j => j.posicion === posicion);
    }

    if (conferencia) {
      jugadores = jugadores.filter(j => {
        const equipo = this._equipos().find(e => e.id === j.equipoId);
        return equipo?.conferencia === conferencia;
      });
    }

    return jugadores;
  });

  readonly equiposFiltrados = computed<Equipo[]>(() => {
    let equipos = this._equipos();
    const busqueda = this._filtroBusqueda().toLowerCase();
    const conferencia = this._filtroConferencia();

    if (busqueda) {
      equipos = equipos.filter(e => 
        e.nombreEquipo.toLowerCase().includes(busqueda) ||
        e.ciudad.toLowerCase().includes(busqueda)
      );
    }

    if (conferencia) {
      equipos = equipos.filter(e => e.conferencia === conferencia);
    }

    return equipos;
  });

  // Computed para notificaciones no leídas
  readonly notificacionesNoLeidas = computed(() => 
    this._notificaciones().filter(n => !n.leida)
  );

  // Últimos IDs
  private ultimoJugadorId = 0;
  private ultimoPartidoId = 0;
  private ultimoTemporadaId = 0;
  private ultimoJornadaId = 0;
  private ultimoNotificacionId = 0;

  constructor() {
    // Inicializar datos de ejemplo
    this.inicializarDatosEjemplo();
    
    // Effect para notificaciones automáticas
    effect(() => {
      const partidos = this._partidos();
      const partidosHoy = partidos.filter(p => 
        new Date(p.fecha).toDateString() === new Date().toDateString()
      );
      
      if (partidosHoy.length > 0) {
        this.crearNotificacion(
          'partido',
          'Partidos de hoy',
          `Tienes ${partidosHoy.length} partido(s) programado(s) para hoy`,
          'media'
        );
      }
    });
  }

  // ------------------------
  // Métodos de inicialización
  // ------------------------
  private inicializarDatosEjemplo(): void {
    // Inicializar equipos de ejemplo
    const equiposEjemplo: Equipo[] = [
      {
        id: 1,
        nombreEquipo: 'Lakers',
        ciudad: 'Los Angeles',
        conferencia: 'Oeste',
        division: 'Pacífico',
        colorPrimario: '#552583',
        colorSecundario: '#FDB927',
        logo: '/assets/logos/lakers.png',
        estadio: 'Crypto.com Arena',
        capacidadEstadio: 19068,
        fechaFundacion: '1947-01-01',
        activo: true,
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
      },
      {
        id: 2,
        nombreEquipo: 'Celtics',
        ciudad: 'Boston',
        conferencia: 'Este',
        division: 'Atlántico',
        colorPrimario: '#007A33',
        colorSecundario: '#BA9653',
        logo: '/assets/logos/celtics.png',
        estadio: 'TD Garden',
        capacidadEstadio: 19156,
        fechaFundacion: '1946-01-01',
        activo: true,
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
      },
      {
        id: 3,
        nombreEquipo: 'Warriors',
        ciudad: 'San Francisco',
        conferencia: 'Oeste',
        division: 'Pacífico',
        colorPrimario: '#1D428A',
        colorSecundario: '#FFC72C',
        logo: '/assets/logos/warriors.png',
        estadio: 'Chase Center',
        capacidadEstadio: 18064,
        fechaFundacion: '1946-01-01',
        activo: true,
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
      }
    ];

    this._equipos.set(equiposEjemplo);

    // Inicializar temporada
    const temporadaActual: Temporada = {
      id: '1',
      nombre: 'Temporada 2024-25',
      fechaInicio: '2024-10-01',
      fechaFin: '2025-04-15',
      activa: true,
      totalJornadas: 82,
      totalEquipos: 30
    };

    this._temporadas.set([temporadaActual]);
    this._temporadaActiva.set(temporadaActual.id);
  }

  // ------------------------
  // Métodos para jugadores
  // ------------------------
  agregarJugador(
    nombreJugador: string, 
    apellido: string, 
    dorsal: number, 
    equipoId: number,
    posicion: PosicionJugador = 'Base',
    altura: number = 180,
    peso: number = 80,
    nacionalidad: string = 'Estados Unidos'
  ): void {
    this.ultimoJugadorId++;
    const ahora = new Date().toISOString();
    
    const nuevo: Jugador = {
      id: this.ultimoJugadorId.toString(),
      nombreJugador: nombreJugador.trim(),
      apellido: apellido.trim(),
      dorsal,
      equipoId,
      posicion,
      altura,
      peso,
      fechaNacimiento: '1995-01-01', // Valor por defecto
      nacionalidad,
      activo: true,
      fechaCreacion: ahora,
      fechaActualizacion: ahora
    };

    this._jugadores.update(jugadores => [...jugadores, nuevo]);
    
    this.crearNotificacion(
      'jugador',
      'Nuevo jugador',
      `${nombreJugador} ${apellido} ha sido añadido al equipo`,
      'media'
    );
  }

  actualizarJugador(id: string, datos: Partial<Jugador>): void {
    this._jugadores.update(jugadores => 
      jugadores.map(j => 
        j.id === id 
          ? { ...j, ...datos, fechaActualizacion: new Date().toISOString() }
          : j
      )
    );
  }

  eliminarJugador(id: string): void {
    this._jugadores.update(jugadores => jugadores.filter(j => j.id !== id));
    if (this._jugadorSeleccionadoId() === id) {
      this._jugadorSeleccionadoId.set(null);
    }
  }

  obtenerJugadoresPorEquipo(equipoId: number): Jugador[] {
    return this._jugadores().filter(j => j.equipoId === equipoId);
  }

  seleccionarJugador(id: string): void {
    this._jugadorSeleccionadoId.set(id);
  }

  deseleccionarJugador(): void {
    this._jugadorSeleccionadoId.set(null);
  }

  // ------------------------
  // Métodos para equipos
  // ------------------------
  agregarEquipo(
    nombreEquipo: string,
    ciudad: string,
    conferencia: Conferencia,
    division: Division
  ): void {
    const nuevo: Equipo = {
      id: this._equipos().length + 1,
      nombreEquipo: nombreEquipo.trim(),
      ciudad: ciudad.trim(),
      conferencia,
      division,
      colorPrimario: '#000000',
      colorSecundario: '#FFFFFF',
      logo: '',
      estadio: '',
      capacidadEstadio: 0,
      fechaFundacion: new Date().toISOString(),
      activo: true,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    };

    this._equipos.update(equipos => [...equipos, nuevo]);
    
    this.crearNotificacion(
      'equipo',
      'Nuevo equipo',
      `${nombreEquipo} ha sido añadido a la liga`,
      'media'
    );
  }

  actualizarEquipo(id: number, datos: Partial<Equipo>): void {
    this._equipos.update(equipos => 
      equipos.map(e => 
        e.id === id 
          ? { ...e, ...datos, fechaActualizacion: new Date().toISOString() }
          : e
      )
    );
  }

  // ------------------------
  // Métodos para partidos
  // ------------------------
  agregarPartido(
    equipoLocalId: number,
    equipoVisitanteId: number,
    puntosLocal: number,
    puntosVisitante: number,
    fecha: string,
    estadio: string = '',
    arbitroPrincipal: string = ''
  ): void {
    this.ultimoPartidoId++;
    const ahora = new Date().toISOString();
    
    const nuevo: Partido = {
      id: this.ultimoPartidoId.toString(),
      equipoLocalId,
      equipoVisitanteId,
      puntosLocal,
      puntosVisitante,
      fecha,
      temporada: this._temporadaActiva() || '1',
      jornada: 1, // Se calculará después
      estado: 'Programado',
      arbitroPrincipal,
      arbitrosSecundarios: [],
      estadio,
      asistencia: 0,
      duracion: 48, // 48 minutos por defecto
      prorroga: false,
      fechaCreacion: ahora,
      fechaActualizacion: ahora
    };

    this._partidos.update(partidos => [...partidos, nuevo]);
    
    this.crearNotificacion(
      'partido',
      'Nuevo partido',
      `Partido programado entre equipos ${equipoLocalId} y ${equipoVisitanteId}`,
      'media'
    );
  }

  actualizarPartido(id: string, datos: Partial<Partido>): void {
    this._partidos.update(partidos => 
      partidos.map(p => 
        p.id === id 
          ? { ...p, ...datos, fechaActualizacion: new Date().toISOString() }
          : p
      )
    );
  }

  obtenerPartidosPorEquipo(equipoId: number): Partido[] {
    return this._partidos().filter(p => 
      p.equipoLocalId === equipoId || p.equipoVisitanteId === equipoId
    );
  }

  // ------------------------
  // Métodos para estadísticas
  // ------------------------
  estadisticasEquipo(equipoId: number): EstadisticasEquipo {
    const partidos = this.obtenerPartidosPorEquipo(equipoId);
    const partidosFinalizados = partidos.filter(p => p.estado === 'Finalizado');
    
    let partidosGanados = 0;
    let partidosPerdidos = 0;
    let puntosAFavor = 0;
    let puntosEnContra = 0;

    partidosFinalizados.forEach(p => {
      const puntosEquipo = (p.equipoLocalId === equipoId) ? p.puntosLocal : p.puntosVisitante;
      const puntosRival = (p.equipoLocalId === equipoId) ? p.puntosVisitante : p.puntosLocal;

      puntosAFavor += puntosEquipo;
      puntosEnContra += puntosRival;

      if (puntosEquipo > puntosRival) partidosGanados++;
      else partidosPerdidos++;
    });

    const partidosJugados = partidosGanados + partidosPerdidos;
    const porcentajeVictorias = partidosJugados > 0 ? (partidosGanados / partidosJugados) * 100 : 0;
    const diferenciaPuntos = puntosAFavor - puntosEnContra;

    return {
      partidosJugados,
      partidosGanados,
      partidosPerdidos,
      porcentajeVictorias,
      puntosAFavor,
      puntosEnContra,
      diferenciaPuntos,
      rachaActual: 0, // Se calcularía con lógica más compleja
      rachaTipo: partidosGanados > partidosPerdidos ? 'Ganando' : 'Perdiendo',
      posicionConferencia: 0, // Se calcularía con el ranking
      posicionDivision: 0,
      // Propiedades adicionales para compatibilidad
      ganados: partidosGanados,
      perdidos: partidosPerdidos,
      totalPuntosAFavor: puntosAFavor,
      totalPuntosEnContra: puntosEnContra
    };
  }

  estadisticasJugador(jugadorId: string): EstadisticasJugador {
    // Por ahora retornamos estadísticas de ejemplo
    // En una implementación real, se calcularían basándose en los partidos
    return {
      partidosJugados: 10,
      puntosPorPartido: 15.5,
      rebotesPorPartido: 8.2,
      asistenciasPorPartido: 4.1,
      robosPorPartido: 1.2,
      taponesPorPartido: 0.8,
      porcentajeTiros: 45.2,
      porcentajeTriples: 38.5,
      porcentajeTirosLibres: 82.1,
      minutosPorPartido: 32.5
    };
  }

  // ------------------------
  // Métodos para filtros
  // ------------------------
  actualizarFiltroBusqueda(busqueda: string): void {
    this._filtroBusqueda.set(busqueda);
  }

  actualizarFiltroPosicion(posicion: PosicionJugador | null): void {
    this._filtroPosicion.set(posicion);
  }

  actualizarFiltroConferencia(conferencia: Conferencia | null): void {
    this._filtroConferencia.set(conferencia);
  }

  limpiarFiltros(): void {
    this._filtroBusqueda.set('');
    this._filtroPosicion.set(null);
    this._filtroConferencia.set(null);
  }

  // ------------------------
  // Métodos para notificaciones
  // ------------------------
  crearNotificacion(
    tipo: TipoNotificacion,
    titulo: string,
    mensaje: string,
    prioridad: PrioridadNotificacion = 'media'
  ): void {
    this.ultimoNotificacionId++;
    
    const notificacion: Notificacion = {
      id: this.ultimoNotificacionId.toString(),
      tipo,
      titulo,
      mensaje,
      fecha: new Date().toISOString(),
      leida: false,
      prioridad
    };

    this._notificaciones.update(notificaciones => [...notificaciones, notificacion]);
  }

  marcarNotificacionComoLeida(id: string): void {
    this._notificaciones.update(notificaciones => 
      notificaciones.map(n => 
        n.id === id ? { ...n, leida: true } : n
      )
    );
  }

  eliminarNotificacion(id: string): void {
    this._notificaciones.update(notificaciones => 
      notificaciones.filter(n => n.id !== id)
    );
  }

  // ------------------------
  // Métodos de utilidad
  // ------------------------
  private obtenerLiderPuntos() {
    const jugadores = this._jugadores();
    if (jugadores.length === 0) return { jugadorId: '', puntos: 0 };
    
    // Lógica simplificada - en realidad se calcularía con estadísticas reales
    return { jugadorId: jugadores[0].id, puntos: 25.5 };
  }

  private obtenerLiderRebotes() {
    const jugadores = this._jugadores();
    if (jugadores.length === 0) return { jugadorId: '', rebotes: 0 };
    
    return { jugadorId: jugadores[0].id, rebotes: 12.3 };
  }

  private obtenerLiderAsistencias() {
    const jugadores = this._jugadores();
    if (jugadores.length === 0) return { jugadorId: '', asistencias: 0 };
    
    return { jugadorId: jugadores[0].id, asistencias: 8.7 };
  }

  private obtenerEquipoLider() {
    const equipos = this._equipos();
    if (equipos.length === 0) return { equipoId: 0, victorias: 0 };
    
    return { equipoId: equipos[0].id, victorias: 15 };
  }

  private calcularPromedioPuntosPorPartido(): number {
    const partidos = this._partidos();
    if (partidos.length === 0) return 0;

    const totalPuntos = partidos.reduce((sum, partido) => 
      sum + partido.puntosLocal + partido.puntosVisitante, 0
    );

    return Math.round((totalPuntos / partidos.length) * 10) / 10;
  }

  obtenerEquipoPorId(id: number): Equipo | undefined {
    return this._equipos().find(e => e.id === id);
  }

  obtenerJugadorPorId(id: string): Jugador | undefined {
    return this._jugadores().find(j => j.id === id);
  }

  limpiarDatos(): void {
    this._jugadores.set([]);
    this._partidos.set([]);
    this._jugadorSeleccionadoId.set(null);
    this._equipoSeleccionadoId.set(null);
    this._notificaciones.set([]);
  }
}
