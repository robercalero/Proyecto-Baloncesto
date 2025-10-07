import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadisticaTienda } from '../../services/estadistica-tienda';

interface EstadisticasEquipo {
  ganados: number;
  perdidos: number;
  totalPuntosAFavor: number;
  totalPuntosEnContra: number;
}

@Component({
  selector: 'app-tabla-estadistica-componente',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './tabla-estadistica-componente.html',
  styleUrl: './tabla-estadistica-componente.css'
})
export class TablaEstadisticaComponente {
  // Input signals para recibir datos
  readonly equipoId = input<number>();
  readonly estadisticas = input<EstadisticasEquipo>();
  readonly tienda = input<EstadisticaTienda>();

  // Computed para calcular datos derivados
  readonly porcentajeVictorias = computed(() => {
    const stats = this.estadisticas();
    if (!stats) return 0;
    const totalPartidos = stats.ganados + stats.perdidos;
    if (totalPartidos === 0) return 0;
    return Math.round((stats.ganados / totalPartidos) * 100);
  });

  readonly diferenciaPuntos = computed(() => {
    const stats = this.estadisticas();
    if (!stats) return 0;
    return stats.totalPuntosAFavor - stats.totalPuntosEnContra;
  });

  readonly totalPartidos = computed(() => {
    const stats = this.estadisticas();
    if (!stats) return 0;
    return stats.ganados + stats.perdidos;
  });
}