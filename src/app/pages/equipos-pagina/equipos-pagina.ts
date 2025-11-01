import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstadisticaTienda } from '../../services/estadistica-tienda';
import { TarjetasJugadorComponente } from '../../shared/tarjetas-jugador-componente/tarjetas-jugador-componente';

@Component({
  selector: 'app-equipos-pagina',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, TarjetasJugadorComponente],
  templateUrl: './equipos-pagina.html',
  styleUrl: './equipos-pagina.css'
})
export class EquiposPagina {
  private readonly tienda = inject(EstadisticaTienda);

  // Signals para datos de la tienda
  readonly equipos = this.tienda.equipos;
  readonly jugadores = this.tienda.jugadores;
  readonly partidos = this.tienda.partidos;

  // Signal para el equipo seleccionado
  readonly equipoSeleccionado = signal<number | null>(null);

  // Computed para obtener jugadores del equipo seleccionado
  readonly jugadoresDeEquipoSeleccionado = computed(() => {
    const equipoId = this.equipoSeleccionado();
    if (equipoId === null) return [];
    return this.tienda.obtenerJugadoresPorEquipo(equipoId);
  });

  // Computed para obtener estadísticas del equipo seleccionado
  readonly statsEquipoSeleccionado = computed(() => {
    const equipoId = this.equipoSeleccionado();
    if (equipoId === null) return null;
    return this.tienda.estadisticasEquipo(equipoId);
  });

  // Computed para obtener el nombre del equipo seleccionado
  readonly nombreEquipoSeleccionado = computed(() => {
    const equipoId = this.equipoSeleccionado();
    if (equipoId === null) return '';
    const equipo = this.equipos().find(e => e.id === equipoId);
    return equipo?.nombreEquipo || '';
  });

  // Computed para obtener equipos con estadísticas
  readonly equiposConStats = computed(() => {
    return this.equipos().map(equipo => ({
      ...equipo,
      stats: this.tienda.estadisticasEquipo(equipo.id),
      jugadores: this.tienda.obtenerJugadoresPorEquipo(equipo.id)
    }));
  });

  // Métodos para manejar selección de equipo
  seleccionarEquipo(equipoId: number) {
    this.equipoSeleccionado.set(equipoId);
  }

  deseleccionarEquipo() {
    this.equipoSeleccionado.set(null);
  }

  // Ver detalle jugadores
  verDetalleJugador(id: string) {
    console.log('Jugador seleccionado', id);
    this.tienda.seleccionarJugador(id);
  }
}
