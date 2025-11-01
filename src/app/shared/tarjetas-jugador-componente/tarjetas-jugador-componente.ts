import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Jugadores } from '../../interfaces/jugadores';

@Component({
  selector: 'app-tarjetas-jugador-componente',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './tarjetas-jugador-componente.html',
  styleUrl: './tarjetas-jugador-componente.css'
})
export class TarjetasJugadorComponente {
  // Input signal para recibir el jugador
  readonly jugador = input.required<Jugadores>();
  
  // Output signal para emitir eventos
  readonly seleccionar = output<string>();

  // Método para manejar la selección
  onSeleccionar() {
    this.seleccionar.emit(this.jugador().id);
  }
}
