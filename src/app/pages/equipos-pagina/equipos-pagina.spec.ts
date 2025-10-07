import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquiposPagina } from './equipos-pagina';

describe('EquiposPagina', () => {
  let component: EquiposPagina;
  let fixture: ComponentFixture<EquiposPagina>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquiposPagina]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquiposPagina);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
