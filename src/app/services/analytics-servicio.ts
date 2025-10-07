import { Injectable, signal, computed } from '@angular/core';
import { Jugador } from '../interfaces/jugadores';
import { Equipo } from '../interfaces/equipos';
import { Partido } from '../interfaces/partidos';

export interface MetricasAnalytics {
  totalUsuarios: number;
  totalSesiones: number;
  tiempoPromedioSesion: number;
  paginaMasVisitada: string;
  funcionalidadMasUsada: string;
  dispositivos: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  navegadores: {
    chrome: number;
    firefox: number;
    safari: number;
    edge: number;
  };
}

export interface EventoAnalytics {
  id: string;
  tipo: string;
  accion: string;
  datos: Record<string, any>;
  timestamp: string;
  usuarioId?: string;
  sesionId: string;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsServicio {
  private readonly _eventos = signal<EventoAnalytics[]>([]);
  private readonly _metricas = signal<MetricasAnalytics>({
    totalUsuarios: 0,
    totalSesiones: 0,
    tiempoPromedioSesion: 0,
    paginaMasVisitada: '',
    funcionalidadMasUsada: '',
    dispositivos: { desktop: 0, mobile: 0, tablet: 0 },
    navegadores: { chrome: 0, firefox: 0, safari: 0, edge: 0 }
  });

  readonly eventos = this._eventos.asReadonly();
  readonly metricas = this._metricas.asReadonly();

  readonly eventosPorTipo = computed(() => {
    const eventos = this._eventos();
    const tipos = [...new Set(eventos.map(e => e.tipo))];
    
    return tipos.map(tipo => ({
      tipo,
      cantidad: eventos.filter(e => e.tipo === tipo).length,
      porcentaje: (eventos.filter(e => e.tipo === tipo).length / eventos.length) * 100
    }));
  });

  readonly eventosRecientes = computed(() => 
    this._eventos().slice(-10).reverse()
  );

  readonly actividadPorHora = computed(() => {
    const eventos = this._eventos();
    const horas = Array.from({ length: 24 }, (_, i) => i);
    
    return horas.map(hora => ({
      hora,
      cantidad: eventos.filter(e => 
        new Date(e.timestamp).getHours() === hora
      ).length
    }));
  });

  constructor() {
    this.inicializarAnalytics();
  }

  private inicializarAnalytics(): void {
    // Detectar dispositivo
    const userAgent = navigator.userAgent;
    const esMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const esTablet = /iPad|Android/i.test(userAgent) && !/Mobile/i.test(userAgent);
    
    // Detectar navegador
    const esChrome = /Chrome/i.test(userAgent) && !/Edge/i.test(userAgent);
    const esFirefox = /Firefox/i.test(userAgent);
    const esSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent);
    const esEdge = /Edge/i.test(userAgent);

    // Actualizar métricas de dispositivo
    this._metricas.update(metricas => ({
      ...metricas,
      dispositivos: {
        desktop: esMobile || esTablet ? 0 : 1,
        mobile: esMobile ? 1 : 0,
        tablet: esTablet ? 1 : 0
      },
      navegadores: {
        chrome: esChrome ? 1 : 0,
        firefox: esFirefox ? 1 : 0,
        safari: esSafari ? 1 : 0,
        edge: esEdge ? 1 : 0
      }
    }));
  }

  registrarEvento(
    tipo: string,
    accion: string,
    datos: Record<string, any> = {},
    usuarioId?: string
  ): void {
    const evento: EventoAnalytics = {
      id: this.generarId(),
      tipo,
      accion,
      datos,
      timestamp: new Date().toISOString(),
      usuarioId,
      sesionId: this.obtenerSesionId()
    };

    this._eventos.update(eventos => [...eventos, evento]);
    
    // Actualizar métricas en tiempo real
    this.actualizarMetricas();
  }

  registrarNavegacion(pagina: string): void {
    this.registrarEvento('navegacion', 'cambio_pagina', { pagina });
  }

  registrarAccionJugador(accion: string, jugador: Jugador): void {
    this.registrarEvento('jugador', accion, {
      jugadorId: jugador.id,
      nombre: `${jugador.nombreJugador} ${jugador.apellido}`,
      equipo: jugador.equipoId,
      posicion: jugador.posicion
    });
  }

  registrarAccionEquipo(accion: string, equipo: Equipo): void {
    this.registrarEvento('equipo', accion, {
      equipoId: equipo.id,
      nombre: equipo.nombreEquipo,
      ciudad: equipo.ciudad,
      conferencia: equipo.conferencia
    });
  }

  registrarAccionPartido(accion: string, partido: Partido): void {
    this.registrarEvento('partido', accion, {
      partidoId: partido.id,
      equipos: `${partido.equipoLocalId} vs ${partido.equipoVisitanteId}`,
      fecha: partido.fecha,
      estado: partido.estado
    });
  }

  registrarBusqueda(termino: string, resultados: number): void {
    this.registrarEvento('busqueda', 'buscar', {
      termino,
      resultados,
      longitud: termino.length
    });
  }

  registrarFiltro(tipo: string, valor: string): void {
    this.registrarEvento('filtro', 'aplicar_filtro', {
      tipo,
      valor
    });
  }

  registrarError(error: string, contexto: string): void {
    this.registrarEvento('error', 'error_ocurrido', {
      error,
      contexto,
      url: window.location.href
    });
  }

  obtenerEventosPorTipo(tipo: string): EventoAnalytics[] {
    return this._eventos().filter(e => e.tipo === tipo);
  }

  obtenerEventosPorUsuario(usuarioId: string): EventoAnalytics[] {
    return this._eventos().filter(e => e.usuarioId === usuarioId);
  }

  obtenerEventosPorSesion(sesionId: string): EventoAnalytics[] {
    return this._eventos().filter(e => e.sesionId === sesionId);
  }

  exportarDatos(): string {
    const datos = {
      eventos: this._eventos(),
      metricas: this._metricas(),
      exportado: new Date().toISOString()
    };
    
    return JSON.stringify(datos, null, 2);
  }

  limpiarDatos(): void {
    this._eventos.set([]);
    this._metricas.set({
      totalUsuarios: 0,
      totalSesiones: 0,
      tiempoPromedioSesion: 0,
      paginaMasVisitada: '',
      funcionalidadMasUsada: '',
      dispositivos: { desktop: 0, mobile: 0, tablet: 0 },
      navegadores: { chrome: 0, firefox: 0, safari: 0, edge: 0 }
    });
  }

  private actualizarMetricas(): void {
    const eventos = this._eventos();
    const sesiones = [...new Set(eventos.map(e => e.sesionId))];
    
    // Calcular página más visitada
    const navegaciones = eventos.filter(e => e.tipo === 'navegacion');
    const paginas = navegaciones.map(e => e.datos['pagina']);
    const paginaMasVisitada = this.obtenerMasFrecuente(paginas);

    // Calcular funcionalidad más usada
    const funcionalidades = eventos.map(e => e.tipo);
    const funcionalidadMasUsada = this.obtenerMasFrecuente(funcionalidades);

    this._metricas.update(metricas => ({
      ...metricas,
      totalSesiones: sesiones.length,
      paginaMasVisitada: paginaMasVisitada || '',
      funcionalidadMasUsada: funcionalidadMasUsada || ''
    }));
  }

  private obtenerMasFrecuente(array: string[]): string | null {
    if (array.length === 0) return null;
    
    const frecuencia: Record<string, number> = {};
    array.forEach(item => {
      frecuencia[item] = (frecuencia[item] || 0) + 1;
    });
    
    return Object.keys(frecuencia).reduce((a, b) => 
      frecuencia[a] > frecuencia[b] ? a : b
    );
  }

  private generarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private obtenerSesionId(): string {
    let sesionId = sessionStorage.getItem('analytics_sesion_id');
    if (!sesionId) {
      sesionId = this.generarId();
      sessionStorage.setItem('analytics_sesion_id', sesionId);
    }
    return sesionId;
  }
}
