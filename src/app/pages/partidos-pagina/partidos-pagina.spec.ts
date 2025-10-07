import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartidosPagina } from './partidos-pagina';

describe('PartidosPagina', () => {
  let component: PartidosPagina;
  let fixture: ComponentFixture<PartidosPagina>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartidosPagina]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartidosPagina);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
