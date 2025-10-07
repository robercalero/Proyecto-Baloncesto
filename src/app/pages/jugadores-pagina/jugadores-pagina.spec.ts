import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JugadoresPagina } from './jugadores-pagina';

describe('JugadoresPagina', () => {
  let component: JugadoresPagina;
  let fixture: ComponentFixture<JugadoresPagina>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JugadoresPagina]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JugadoresPagina);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
