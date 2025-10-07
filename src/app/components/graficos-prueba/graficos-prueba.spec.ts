import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficosPrueba } from './graficos-prueba';

describe('GraficosPrueba', () => {
  let component: GraficosPrueba;
  let fixture: ComponentFixture<GraficosPrueba>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficosPrueba]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficosPrueba);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
