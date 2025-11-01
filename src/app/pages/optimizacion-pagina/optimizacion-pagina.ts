import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { OptimizacionServicio } from '../../services/optimizacion-servicio';
import { AnalyticsServicio } from '../../services/analytics-servicio';
import { OptimizacionRendimiento } from '../../shared/optimizacion-rendimiento/optimizacion-rendimiento';

@Component({
  selector: 'app-optimizacion-pagina',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatSelectModule,
    OptimizacionRendimiento
  ],
  templateUrl: './optimizacion-pagina.html',
  styleUrl: './optimizacion-pagina.css'
})
export class OptimizacionPagina {
  private readonly optimizacionServicio = inject(OptimizacionServicio);
  private readonly analytics = inject(AnalyticsServicio);

  // Signals para datos
  readonly metricas = this.optimizacionServicio.metricas;
  readonly optimizaciones = this.optimizacionServicio.optimizaciones;
  readonly configuracion = this.optimizacionServicio.configuracion;
  readonly rendimientoPromedio = this.optimizacionServicio.rendimientoPromedio;
  readonly optimizacionesAplicadas = this.optimizacionServicio.optimizacionesAplicadas;
  readonly optimizacionesPendientes = this.optimizacionServicio.optimizacionesPendientes;
  readonly porcentajeOptimizacion = this.optimizacionServicio.porcentajeOptimizacion;
  readonly estadoRendimiento = this.optimizacionServicio.estadoRendimiento;
  readonly recomendaciones = this.optimizacionServicio.recomendaciones;

  // Signals para UI
  readonly vistaActual = signal<'metricas' | 'optimizaciones' | 'configuracion'>('metricas');
  readonly categoriaFiltro = signal<string>('todas');
  readonly impactoFiltro = signal<string>('todos');

  // Computed para optimizaciones filtradas
  readonly optimizacionesFiltradas = computed(() => {
    let optimizaciones = this.optimizaciones();
    
    if (this.categoriaFiltro() !== 'todas') {
      optimizaciones = optimizaciones.filter(opt => opt.categoria === this.categoriaFiltro());
    }
    
    if (this.impactoFiltro() !== 'todos') {
      optimizaciones = optimizaciones.filter(opt => opt.impacto === this.impactoFiltro());
    }
    
    return optimizaciones;
  });

  // Computed para estadísticas
  readonly estadisticas = computed(() => {
    const optimizaciones = this.optimizaciones();
    const aplicadas = this.optimizacionesAplicadas().length;
    const pendientes = this.optimizacionesPendientes().length;
    
    return {
      total: optimizaciones.length,
      aplicadas,
      pendientes,
      porcentaje: this.porcentajeOptimizacion()
    };
  });

  // Computed para categorías
  readonly categorias = computed(() => {
    const categorias = [...new Set(this.optimizaciones().map(opt => opt.categoria))];
    return categorias.map(cat => ({
      valor: cat,
      etiqueta: cat.charAt(0).toUpperCase() + cat.slice(1)
    }));
  });

  // Computed para impactos
  readonly impactos = computed(() => {
    const impactos = [...new Set(this.optimizaciones().map(opt => opt.impacto))];
    return impactos.map(imp => ({
      valor: imp,
      etiqueta: imp.charAt(0).toUpperCase() + imp.slice(1)
    }));
  });

  constructor() {
    this.analytics.registrarEvento('optimizacion', 'cargar_pagina', {});
  }

  cambiarVista(vista: 'metricas' | 'optimizaciones' | 'configuracion'): void {
    this.vistaActual.set(vista);
    this.analytics.registrarEvento('optimizacion', 'cambiar_vista', { vista });
  }

  aplicarOptimizacion(id: string): void {
    this.optimizacionServicio.aplicarOptimizacion(id);
    this.analytics.registrarEvento('optimizacion', 'aplicar', { id });
  }

  desaplicarOptimizacion(id: string): void {
    this.optimizacionServicio.desaplicarOptimizacion(id);
    this.analytics.registrarEvento('optimizacion', 'desaplicar', { id });
  }

  cambiarCategoriaFiltro(categoria: string): void {
    this.categoriaFiltro.set(categoria);
    this.analytics.registrarEvento('optimizacion', 'filtrar_categoria', { categoria });
  }

  cambiarImpactoFiltro(impacto: string): void {
    this.impactoFiltro.set(impacto);
    this.analytics.registrarEvento('optimizacion', 'filtrar_impacto', { impacto });
  }

  ejecutarAnalisisCompleto(): void {
    this.optimizacionServicio.ejecutarAnalisisCompleto();
    this.analytics.registrarEvento('optimizacion', 'analisis_completo', {});
  }

  exportarReporte(): void {
    this.optimizacionServicio.exportarReporte();
    this.analytics.registrarEvento('optimizacion', 'exportar_reporte', {});
  }

  obtenerColorImpacto(impacto: string): string {
    switch (impacto) {
      case 'alto': return 'var(--color-error)';
      case 'medio': return 'var(--color-warn)';
      case 'bajo': return 'var(--color-success)';
      default: return 'var(--color-text-secondary)';
    }
  }

  obtenerIconoImpacto(impacto: string): string {
    switch (impacto) {
      case 'alto': return 'priority_high';
      case 'medio': return 'remove';
      case 'bajo': return 'low_priority';
      default: return 'help';
    }
  }

  obtenerColorCategoria(categoria: string): string {
    switch (categoria) {
      case 'rendimiento': return 'var(--color-primary)';
      case 'memoria': return 'var(--color-accent)';
      case 'red': return 'var(--color-warn)';
      case 'ui': return 'var(--color-success)';
      default: return 'var(--color-text-secondary)';
    }
  }

  obtenerIconoCategoria(categoria: string): string {
    switch (categoria) {
      case 'rendimiento': return 'speed';
      case 'memoria': return 'memory';
      case 'red': return 'network_check';
      case 'ui': return 'palette';
      default: return 'help';
    }
  }

  formatearValor(valor: number, unidad: string): string {
    if (unidad === '') return valor.toString();
    return `${valor}${unidad}`;
  }

  actualizarConfiguracion(config: any): void {
    this.optimizacionServicio.actualizarConfiguracion(config);
    this.analytics.registrarEvento('optimizacion', 'actualizar_configuracion', config);
  }
}
