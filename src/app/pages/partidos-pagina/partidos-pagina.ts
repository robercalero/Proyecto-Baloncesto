import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstadisticaTienda } from '../../services/estadistica-tienda';
import { Partidos } from '../../interfaces/partidos';
import { Jugadores } from '../../interfaces/jugadores';
import { Equipos } from '../../interfaces/equipos';

@Component({
  selector: 'app-partidos-pagina',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './partidos-pagina.html',
  styleUrl: './partidos-pagina.css'
})
export class PartidosPagina {
  readonly tienda = inject(EstadisticaTienda);

  // Signals para datos de la tienda
  readonly equipos = this.tienda.equipos;
  readonly partidos = this.tienda.partidos;

  // Signals para campos del formulario
  readonly equipoLocalId = signal<number | null>(null);
  readonly equipoVisitanteId = signal<number | null>(null);
  readonly puntosLocal = signal<number | null>(null);
  readonly puntosVisitante = signal<number | null>(null);
  readonly fecha = signal<string>('');

  // Computed para validar si el formulario es válido
  readonly formularioValido = computed(() => {
    return this.equipoLocalId() !== null &&
           this.equipoVisitanteId() !== null &&
           this.puntosLocal() !== null &&
           this.puntosVisitante() !== null &&
           this.fecha().trim() !== '' &&
           this.equipoLocalId() !== this.equipoVisitanteId(); // No puede jugar contra sí mismo
  });

  // Computed para obtener nombres de equipos seleccionados
  readonly nombreEquipoLocal = computed(() => {
    const id = this.equipoLocalId();
    if (id === null) return '';
    const equipo = this.equipos().find(e => e.id === id);
    return equipo?.nombreEquipo || '';
  });

  readonly nombreEquipoVisitante = computed(() => {
    const id = this.equipoVisitanteId();
    if (id === null) return '';
    const equipo = this.equipos().find(e => e.id === id);
    return equipo?.nombreEquipo || '';
  });

  // Computed para partidos con información completa
  readonly partidosCompletos = computed(() => {
    return this.partidos().map(partido => ({
      ...partido,
      nombreEquipoLocal: this.obtenerNombreEquipo(partido.equipoLocalId),
      nombreEquipoVisitante: this.obtenerNombreEquipo(partido.equipoVisitanteId),
      ganador: this.ganador(partido)
    }));
  });

  // ---------------------------
  // Métodos
  // ---------------------------
  agregarPartido(): void {
    if (this.formularioValido()) {
      this.tienda.agregarPartido(
        this.equipoLocalId()!,
        this.equipoVisitanteId()!,
        this.puntosLocal()!,
        this.puntosVisitante()!,
        this.fecha().trim()
      );

      // Limpiar formulario
      this.equipoLocalId.set(null);
      this.equipoVisitanteId.set(null);
      this.puntosLocal.set(null);
      this.puntosVisitante.set(null);
      this.fecha.set('');
    }
  }

  obtenerNombreEquipo(id: number): string {
    const equipo = this.equipos().find(e => e.id === id);
    return equipo ? equipo.nombreEquipo : 'Desconocido';
  }

  ganador(partido: Partidos): string {
    if (partido.puntosLocal > partido.puntosVisitante) return 'Local';
    if (partido.puntosLocal < partido.puntosVisitante) return 'Visitante';
    return 'Empate';
  }

  // Métodos para actualizar los signals del formulario
  actualizarEquipoLocalId(value: number | null): void {
    this.equipoLocalId.set(value);
  }

  actualizarEquipoVisitanteId(value: number | null): void {
    this.equipoVisitanteId.set(value);
  }

  actualizarPuntosLocal(value: number | null): void {
    this.puntosLocal.set(value);
  }

  actualizarPuntosVisitante(value: number | null): void {
    this.puntosVisitante.set(value);
  }

  actualizarFecha(value: string): void {
    this.fecha.set(value);
  }

  // Métodos para manejar eventos del template
  onEquipoLocalChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.actualizarEquipoLocalId(+target.value || null);
  }

  onEquipoVisitanteChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.actualizarEquipoVisitanteId(+target.value || null);
  }
}
