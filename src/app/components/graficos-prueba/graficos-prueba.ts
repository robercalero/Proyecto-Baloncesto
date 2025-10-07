import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { EstadisticaTienda } from '../../services/estadistica-tienda';

@Component({
  selector: 'app-graficos-prueba',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseChartDirective],
  templateUrl: './graficos-prueba.html',
  styleUrl: './graficos-prueba.css'
})
export class GraficosPrueba {
  private readonly tienda = inject(EstadisticaTienda);

  // Signals para datos del gráfico
  private readonly equipos = this.tienda.equipos;
  private readonly partidos = this.tienda.partidos;

  // Computed para generar datos del gráfico dinámicamente
  private readonly _datosGrafico = computed<ChartData<'bar'>>(() => {
    const equiposData = this.equipos();
    const partidosData = this.partidos();
    
    const labels = equiposData.map(equipo => equipo.nombreEquipo);
    const data = equiposData.map(equipo => {
      const stats = this.tienda.estadisticasEquipo(equipo.id);
      return stats.totalPuntosAFavor;
    });

    return {
      labels,
      datasets: [{ 
        data, 
        label: 'Puntos a Favor',
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    };
  });

  // Getter para acceder al valor del computed signal
  get datosGrafico(): ChartData<'bar'> {
    return this._datosGrafico();
  }

  readonly opcionesGrafico: ChartOptions<'bar'> = { 
    responsive: true,
    plugins: {
      legend: {
        display: true
      },
      title: {
        display: true,
        text: 'Estadísticas de Equipos - Puntos a Favor'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
}
