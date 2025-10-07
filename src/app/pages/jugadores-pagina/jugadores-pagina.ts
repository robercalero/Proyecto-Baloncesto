import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';

import { ApiServicio } from '../../services/api-servicio';
import { EstadisticaTienda } from '../../services/estadistica-tienda';
import { AnalyticsServicio } from '../../services/analytics-servicio';
import { TarjetasJugadorComponente } from '../../shared/tarjetas-jugador-componente/tarjetas-jugador-componente';
import { PosicionJugador } from '../../interfaces/jugadores';

type VistaJugadores = 'grid' | 'lista' | 'tabla';

@Component({
  selector: 'app-jugadores-pagina',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, 
    FormsModule, 
    MaterialModule,
    TarjetasJugadorComponente
  ],
  templateUrl: './jugadores-pagina.html',
  styleUrl: './jugadores-pagina.css'
})
export class JugadoresPagina {
  private readonly api = inject(ApiServicio);
  private readonly tienda = inject(EstadisticaTienda);
  private readonly analytics = inject(AnalyticsServicio);

  // Signals para datos del formulario
  readonly nombreJugador = signal('');
  readonly apellido = signal('');
  readonly dorsal = signal<number | null>(null);
  readonly equipoId = signal<number | null>(null);
  readonly posicionSeleccionada = signal<PosicionJugador>('Base');
  readonly altura = signal<number | null>(null);
  readonly peso = signal<number | null>(null);
  readonly nacionalidad = signal('');

  // Signals para estado de la UI
  readonly mostrarFormulario = signal(false);
  readonly vistaActual = signal<VistaJugadores>('grid');

  // Signals para datos de la tienda
  readonly jugadores = this.tienda.jugadores;
  readonly equipos = this.tienda.equipos;
  readonly jugadoresFiltrados = this.tienda.jugadoresFiltrados;
  readonly filtroBusqueda = this.tienda.filtroBusqueda;
  readonly filtroPosicion = this.tienda.filtroPosicion;
  readonly filtroConferencia = this.tienda.filtroConferencia;

  // Computed para estadísticas
  readonly totalJugadores = computed(() => this.jugadores().length);
  readonly totalEquipos = computed(() => this.equipos().length);

  // Computed para validar si el formulario es válido
  readonly formularioValido = computed(() => {
    return this.nombreJugador().trim() !== '' && 
           this.apellido().trim() !== '' && 
           this.dorsal() !== null && 
           this.equipoId() !== null;
  });

  // Computed para obtener el nombre del equipo seleccionado
  readonly nombreEquipoSeleccionado = computed(() => {
    const id = this.equipoId();
    if (id === null) return '';
    const equipo = this.equipos().find(e => e.id === id);
    return equipo?.nombreEquipo || '';
  });

  // Opciones para formularios
  readonly posiciones: PosicionJugador[] = ['Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot'];
  readonly columnasTabla = ['nombre', 'posicion', 'dorsal', 'equipo', 'altura', 'acciones'];

  constructor() {
    // Registrar navegación
    this.analytics.registrarNavegacion('jugadores');
  }

  // Métodos para manejo de formulario
  abrirModalAgregar(): void {
    this.mostrarFormulario.set(true);
    this.analytics.registrarEvento('jugador', 'abrir_formulario', {});
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.limpiarFormulario();
  }

  limpiarFormulario(): void {
    this.nombreJugador.set('');
    this.apellido.set('');
    this.dorsal.set(null);
    this.equipoId.set(null);
    this.posicionSeleccionada.set('Base');
    this.altura.set(null);
    this.peso.set(null);
    this.nacionalidad.set('');
  }

  agregarJugador(): void {
    if (this.formularioValido()) {
      this.tienda.agregarJugador(
        this.nombreJugador().trim(), 
        this.apellido().trim(), 
        this.dorsal() || 0, 
        this.equipoId()!,
        this.posicionSeleccionada(),
        this.altura() || 180,
        this.peso() || 80,
        this.nacionalidad() || 'Estados Unidos'
      );

      this.analytics.registrarEvento('jugador', 'agregar', {
        nombreJugador: this.nombreJugador(),
        apellido: this.apellido(),
        dorsal: this.dorsal() || 0,
        equipoId: this.equipoId() || 0
      });

      this.cerrarFormulario();
    }
  }

  // Métodos para actualizar los signals del formulario
  actualizarNombreJugador(value: string): void {
    this.nombreJugador.set(value);
  }

  actualizarApellido(value: string): void {
    this.apellido.set(value);
  }

  actualizarDorsal(value: number | null): void {
    this.dorsal.set(value);
  }

  actualizarEquipoId(value: number | null): void {
    this.equipoId.set(value);
  }

  actualizarPosicion(posicion: PosicionJugador): void {
    this.posicionSeleccionada.set(posicion);
  }

  actualizarAltura(value: string): void {
    this.altura.set(+value || null);
  }

  actualizarPeso(value: string): void {
    this.peso.set(+value || null);
  }

  actualizarNacionalidad(value: string): void {
    this.nacionalidad.set(value);
  }

  // Métodos para manejar eventos del template
  onDorsalChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.actualizarDorsal(+target.value || null);
  }

  onEquipoChange(event: any): void {
    this.actualizarEquipoId(event.value);
  }

  // Métodos para filtros
  actualizarFiltroBusqueda(busqueda: string): void {
    this.tienda.actualizarFiltroBusqueda(busqueda);
    this.analytics.registrarBusqueda(busqueda, this.jugadoresFiltrados().length);
  }

  actualizarFiltroPosicion(posicion: PosicionJugador | null): void {
    this.tienda.actualizarFiltroPosicion(posicion);
    this.analytics.registrarFiltro('posicion', posicion || 'todas');
  }

  actualizarFiltroConferencia(conferencia: string | null): void {
    this.tienda.actualizarFiltroConferencia(conferencia as any);
    this.analytics.registrarFiltro('conferencia', conferencia || 'todas');
  }

  limpiarFiltros(): void {
    this.tienda.limpiarFiltros();
    this.analytics.registrarEvento('filtro', 'limpiar', {});
  }

  // Métodos para vista
  cambiarVista(vista: VistaJugadores): void {
    this.vistaActual.set(vista);
    this.analytics.registrarEvento('vista', 'cambiar', { vista });
  }

  // Métodos para acciones de jugadores
  verDetalle(id: string): void {
    this.tienda.seleccionarJugador(id);
    this.analytics.registrarAccionJugador('ver_detalle', this.obtenerJugadorPorId(id)!);
  }

  editarJugador(id: string): void {
    this.analytics.registrarAccionJugador('editar', this.obtenerJugadorPorId(id)!);
    // Aquí se abriría un modal de edición
  }

  eliminarJugador(id: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este jugador?')) {
      this.tienda.eliminarJugador(id);
      this.analytics.registrarAccionJugador('eliminar', this.obtenerJugadorPorId(id)!);
    }
  }

  // Métodos de utilidad
  obtenerNombreEquipo(equipoId: number): string {
    const equipo = this.equipos().find(e => e.id === equipoId);
    return equipo?.nombreEquipo || 'Sin equipo';
  }

  obtenerJugadorPorId(id: string) {
    return this.jugadores().find(j => j.id === id);
  }
}
