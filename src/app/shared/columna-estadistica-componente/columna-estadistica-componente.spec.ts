import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnaEstadisticaComponente } from './columna-estadistica-componente';

describe('ColumnaEstadisticaComponente', () => {
  let component: ColumnaEstadisticaComponente;
  let fixture: ComponentFixture<ColumnaEstadisticaComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnaEstadisticaComponente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColumnaEstadisticaComponente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
