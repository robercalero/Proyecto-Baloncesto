import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { AnalyticsServicio } from './analytics-servicio';

interface MetricRendimiento {
  nombre: string;
  valor: number;
  unidad: string;
  timestamp: number;
  tendencia: 'up' | 'down' | 'stable';
}

interface Optimizacion {
  id: string;
  nombre: string;
  descripcion: string;
  aplicada: boolean;
  impacto: 'alto' | 'medio' | 'bajo';
  categoria: 'rendimiento' | 'memoria' | 'red' | 'ui';
}

type ConfiguracionOptimizacion = {
  monitoreoActivo: boolean;
  intervaloActualizacion: number;
  umbralRendimiento: number;
};

@Injectable({ providedIn: 'root' })
export class OptimizacionServicio {
  private readonly analytics = inject(AnalyticsServicio);

  // Signals para métricas de rendimiento
  private readonly _metricas = signal<MetricRendimiento[]>([]);
  private readonly _optimizaciones = signal<Optimizacion[]>([]);
  private readonly _configuracion = signal<ConfiguracionOptimizacion>({
    monitoreoActivo: true,
    intervaloActualizacion: 5000,
    umbralRendimiento: 80
  });

  // Getters públicos
  readonly metricas = this._metricas.asReadonly();
  readonly optimizaciones = this._optimizaciones.asReadonly();
  readonly configuracion = this._configuracion.asReadonly();

  // Computed para análisis
  readonly rendimientoPromedio = computed(() => {
    const metricas = this._metricas();
    if (metricas.length === 0) return 0;
    
    const suma = metricas.reduce((acc, metrica) => acc + metrica.valor, 0);
    return Math.round(suma / metricas.length);
  });

  readonly optimizacionesAplicadas = computed(() => {
    return this._optimizaciones().filter(opt => opt.aplicada);
  });

  readonly optimizacionesPendientes = computed(() => {
    return this._optimizaciones().filter(opt => !opt.aplicada);
  });

  readonly porcentajeOptimizacion = computed(() => {
    const total = this._optimizaciones().length;
    const aplicadas = this.optimizacionesAplicadas().length;
    return total > 0 ? Math.round((aplicadas / total) * 100) : 0;
  });

  readonly estadoRendimiento = computed(() => {
    const porcentaje = this.porcentajeOptimizacion();
    if (porcentaje >= 80) return 'excelente';
    if (porcentaje >= 60) return 'bueno';
    if (porcentaje >= 40) return 'regular';
    return 'necesita-mejora';
  });

  readonly recomendaciones = computed(() => {
    const optimizaciones = this.optimizacionesPendientes();
    return optimizaciones
      .filter(opt => opt.impacto === 'alto')
      .slice(0, 5)
      .map(opt => ({
        id: opt.id,
        nombre: opt.nombre,
        descripcion: opt.descripcion,
        impacto: opt.impacto
      }));
  });

  constructor() {
    this.inicializarOptimizaciones();
    this.iniciarMonitoreo();
    
    // Effect para monitoreo automático
    effect(() => {
      if (this._configuracion().monitoreoActivo) {
        this.actualizarMetricas();
      }
    });
  }

  private inicializarOptimizaciones(): void {
    const optimizaciones: Optimizacion[] = [
      {
        id: 'onpush-detection',
        nombre: 'OnPush Change Detection',
        descripcion: 'Usar OnPush para reducir ciclos de detección de cambios',
        aplicada: true,
        impacto: 'alto',
        categoria: 'rendimiento'
      },
      {
        id: 'signals',
        nombre: 'Signals para Reactividad',
        descripcion: 'Implementar signals para reactividad eficiente',
        aplicada: true,
        impacto: 'alto',
        categoria: 'rendimiento'
      },
      {
        id: 'lazy-loading',
        nombre: 'Lazy Loading de Módulos',
        descripcion: 'Cargar módulos solo cuando se necesiten',
        aplicada: true,
        impacto: 'medio',
        categoria: 'red'
      },
      {
        id: 'tree-shaking',
        nombre: 'Tree Shaking Optimizado',
        descripcion: 'Eliminar código no utilizado del bundle',
        aplicada: true,
        impacto: 'medio',
        categoria: 'rendimiento'
      },
      {
        id: 'service-worker',
        nombre: 'Service Worker Activo',
        descripcion: 'Cache de assets y funcionalidad offline',
        aplicada: true,
        impacto: 'alto',
        categoria: 'red'
      },
      {
        id: 'virtual-scrolling',
        nombre: 'Virtual Scrolling',
        descripcion: 'Renderizar solo elementos visibles en listas largas',
        aplicada: false,
        impacto: 'alto',
        categoria: 'ui'
      },
      {
        id: 'web-workers',
        nombre: 'Web Workers',
        descripcion: 'Procesar tareas pesadas en hilos separados',
        aplicada: false,
        impacto: 'medio',
        categoria: 'rendimiento'
      },
      {
        id: 'code-splitting',
        nombre: 'Code Splitting Avanzado',
        descripcion: 'Dividir código por funcionalidades',
        aplicada: false,
        impacto: 'medio',
        categoria: 'red'
      },
      {
        id: 'prefetch',
        nombre: 'Prefetch de Datos',
        descripcion: 'Precargar datos críticos',
        aplicada: false,
        impacto: 'bajo',
        categoria: 'red'
      },
      {
        id: 'memoization',
        nombre: 'Memoización de Cálculos',
        descripcion: 'Cachear resultados de cálculos costosos',
        aplicada: false,
        impacto: 'medio',
        categoria: 'memoria'
      }
    ];

    this._optimizaciones.set(optimizaciones);
  }

  private iniciarMonitoreo(): void {
    // Simular métricas de rendimiento
    setInterval(() => {
      if (this._configuracion().monitoreoActivo) {
        this.actualizarMetricas();
      }
    }, this._configuracion().intervaloActualizacion);
  }

  private actualizarMetricas(): void {
    const nuevasMetricas: MetricRendimiento[] = [
      {
        nombre: 'Tiempo de Carga',
        valor: Math.random() * 2 + 0.5,
        unidad: 's',
        timestamp: Date.now(),
        tendencia: 'down'
      },
      {
        nombre: 'Memoria Usada',
        valor: Math.random() * 50 + 20,
        unidad: 'MB',
        timestamp: Date.now(),
        tendencia: 'stable'
      },
      {
        nombre: 'Componentes Renderizados',
        valor: Math.floor(Math.random() * 20) + 5,
        unidad: '',
        timestamp: Date.now(),
        tendencia: 'up'
      },
      {
        nombre: 'Requests HTTP',
        valor: Math.floor(Math.random() * 15) + 3,
        unidad: '',
        timestamp: Date.now(),
        tendencia: 'down'
      }
    ];

    this._metricas.set(nuevasMetricas);
    this.analytics.registrarEvento('optimizacion', 'actualizar_metricas', {
      cantidad: nuevasMetricas.length
    });
  }

  aplicarOptimizacion(id: string): void {
    this._optimizaciones.update(optimizaciones => 
      optimizaciones.map(opt => 
        opt.id === id ? { ...opt, aplicada: true } : opt
      )
    );

    this.analytics.registrarEvento('optimizacion', 'aplicar', { id });
  }

  desaplicarOptimizacion(id: string): void {
    this._optimizaciones.update(optimizaciones => 
      optimizaciones.map(opt => 
        opt.id === id ? { ...opt, aplicada: false } : opt
      )
    );

    this.analytics.registrarEvento('optimizacion', 'desaplicar', { id });
  }

  actualizarConfiguracion(config: Partial<ConfiguracionOptimizacion>): void {
    this._configuracion.update(current => ({ ...current, ...config }));
    this.analytics.registrarEvento('optimizacion', 'actualizar_configuracion', config);
  }

  ejecutarAnalisisCompleto(): void {
    this.analytics.registrarEvento('optimizacion', 'analisis_completo', {
      metricas: this._metricas().length,
      optimizaciones: this._optimizaciones().length
    });
  }

  exportarReporte(): void {
    const reporte = {
      timestamp: new Date().toISOString(),
      metricas: this._metricas(),
      optimizaciones: this._optimizaciones(),
      rendimiento: this.rendimientoPromedio(),
      estado: this.estadoRendimiento()
    };

    this.analytics.registrarEvento('optimizacion', 'exportar_reporte', {
      tamaño: JSON.stringify(reporte).length
    });

    // Aquí implementarías la lógica de exportación real
    console.log('Reporte de optimización:', reporte);
  }

  obtenerOptimizacionesPorCategoria(categoria: string): Optimizacion[] {
    return this._optimizaciones().filter(opt => opt.categoria === categoria);
  }

  obtenerOptimizacionesPorImpacto(impacto: string): Optimizacion[] {
    return this._optimizaciones().filter(opt => opt.impacto === impacto);
  }
}
