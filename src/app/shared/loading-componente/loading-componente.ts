import { Component, signal, computed, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-componente',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './loading-componente.html',
  styleUrl: './loading-componente.css'
})
export class LoadingComponente {
  readonly mensaje = input('Cargando...');
  readonly tipo = input<'spinner' | 'dots' | 'pulse'>('spinner');
  readonly tamaño = input<'small' | 'medium' | 'large'>('medium');
  readonly color = input<'primary' | 'accent' | 'warn'>('primary');

  readonly clasesLoading = computed(() => ({
    [`loading-${this.tipo()}`]: true,
    [`loading-${this.tamaño()}`]: true,
    [`loading-${this.color()}`]: true
  }));

  readonly textoVisible = computed(() => this.mensaje().trim() !== '');

  obtenerDiametro(): number {
    switch (this.tamaño()) {
      case 'small': return 24;
      case 'medium': return 40;
      case 'large': return 56;
      default: return 40;
    }
  }
}
