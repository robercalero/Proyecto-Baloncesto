import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaEstadisticaComponente } from './tabla-estadistica-componente';

describe('TablaEstadisticaComponente', () => {
  let component: TablaEstadisticaComponente;
  let fixture: ComponentFixture<TablaEstadisticaComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaEstadisticaComponente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablaEstadisticaComponente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
