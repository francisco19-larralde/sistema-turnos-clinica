import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TurnosLista } from './turnos-lista';

describe('TurnosLista', () => {
  let component: TurnosLista;
  let fixture: ComponentFixture<TurnosLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TurnosLista],
    }).compileComponents();

    fixture = TestBed.createComponent(TurnosLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
