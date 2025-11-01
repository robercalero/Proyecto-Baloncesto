import { Component, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { AnalyticsServicio } from '../../services/analytics-servicio';

interface MetricRendimiento {
  nombre: string;
  valor: number;
  unidad: string;
  tendencia: 'up' | 'down' | 'stable';
  color: string;
  icono: string;
}

@Component({
  selector: 'app-optimizacion-rendimiento',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressBarModule, MatChipsModule],
  templateUrl: './optimizacion-rendimiento.html',
  styleUrl: './optimizacion-rendimiento.css'
})
export class OptimizacionRendimiento {
  private readonly analytics = inject(AnalyticsServicio);

  readonly metricasRendimiento = signal<MetricRendimiento[]>([
    {
      nombre: 'Tiempo de Carga',
      valor: 1.2,
      unidad: 's',
      tendencia: 'down',
      color: 'success',
      icono: 'speed'
    },
    {
      nombre: 'Memoria Usada',
      valor: 45,
      unidad: 'MB',
      tendencia: 'stable',
      color: 'primary',
      icono: 'memory'
    },
    {
      nombre: 'Componentes Renderizados',
      valor: 12,
      unidad: '',
      tendencia: 'up',
      color: 'accent',
      icono: 'widgets'
    },
    {
      nombre: 'Requests HTTP',
      valor: 8,
      unidad: '',
      tendencia: 'down',
      color: 'warn',
      icono: 'http'
    }
  ]);

  readonly optimizacionesAplicadas = signal<string[]>([
    'OnPush Change Detection',
    'Signals para Reactividad',
    'Lazy Loading de Módulos',
    'Tree Shaking Optimizado',
    'Service Worker Activo',
    'Compresión Gzip',
    'Cache de Assets',
    'Preloading de Rutas'
  ]);

  readonly optimizacionesPendientes = signal<string[]>([
    'Implementar Virtual Scrolling',
    'Añadir Web Workers',
    'Optimizar Bundle Size',
    'Implementar Code Splitting',
    'Añadir Prefetch de Datos'
  ]);

  readonly porcentajeOptimizacion = computed(() => {
    const aplicadas = this.optimizacionesAplicadas().length;
    const total = aplicadas + this.optimizacionesPendientes().length;
    return Math.round((aplicadas / total) * 100);
  });

  readonly estadoRendimiento = computed(() => {
    const porcentaje = this.porcentajeOptimizacion();
    if (porcentaje >= 80) return 'excelente';
    if (porcentaje >= 60) return 'bueno';
    if (porcentaje >= 40) return 'regular';
    return 'necesita-mejora';
  });

  readonly colorEstado = computed(() => {
    const estado = this.estadoRendimiento();
    switch (estado) {
      case 'excelente': return 'var(--color-success)';
      case 'bueno': return 'var(--color-primary)';
      case 'regular': return 'var(--color-warn)';
      default: return 'var(--color-error)';
    }
  });

  readonly iconoEstado = computed(() => {
    const estado = this.estadoRendimiento();
    switch (estado) {
      case 'excelente': return 'check_circle';
      case 'bueno': return 'thumb_up';
      case 'regular': return 'warning';
      default: return 'error';
    }
  });

  constructor() {
    this.analytics.registrarEvento('rendimiento', 'cargar_metricas', {});
  }

  aplicarOptimizacion(optimizacion: string): void {
    this.optimizacionesPendientes.update(pendientes => 
      pendientes.filter(opt => opt !== optimizacion)
    );
    this.optimizacionesAplicadas.update(aplicadas => [...aplicadas, optimizacion]);
    
    this.analytics.registrarEvento('rendimiento', 'aplicar_optimizacion', { optimizacion });
  }

  obtenerColorTendencia(tendencia: 'up' | 'down' | 'stable'): string {
    switch (tendencia) {
      case 'up': return 'var(--color-success)';
      case 'down': return 'var(--color-error)';
      default: return 'var(--color-text-secondary)';
    }
  }

  obtenerIconoTendencia(tendencia: 'up' | 'down' | 'stable'): string {
    switch (tendencia) {
      case 'up': return 'trending_up';
      case 'down': return 'trending_down';
      default: return 'trending_flat';
    }
  }

  formatearValor(valor: number, unidad: string): string {
    if (unidad === '') return valor.toString();
    return `${valor}${unidad}`;
  }

  ejecutarAnalisisRendimiento(): void {
    this.analytics.registrarEvento('rendimiento', 'ejecutar_analisis', {});
    // Aquí implementarías la lógica de análisis de rendimiento
    console.log('Ejecutando análisis de rendimiento...');
  }

  exportarReporte(): void {
    this.analytics.registrarEvento('rendimiento', 'exportar_reporte', {});
    // Aquí implementarías la lógica de exportación
    console.log('Exportando reporte de rendimiento...');
  }
}
