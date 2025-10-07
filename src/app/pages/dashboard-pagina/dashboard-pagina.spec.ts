import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPagina } from './dashboard-pagina';

describe('DashboardPagina', () => {
  let component: DashboardPagina;
  let fixture: ComponentFixture<DashboardPagina>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPagina]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardPagina);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
