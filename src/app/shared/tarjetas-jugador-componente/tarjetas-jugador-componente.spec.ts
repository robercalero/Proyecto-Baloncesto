import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TarjetasJugadorComponente } from './tarjetas-jugador-componente';

describe('TarjetasJugadorComponente', () => {
  let component: TarjetasJugadorComponente;
  let fixture: ComponentFixture<TarjetasJugadorComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TarjetasJugadorComponente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TarjetasJugadorComponente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
