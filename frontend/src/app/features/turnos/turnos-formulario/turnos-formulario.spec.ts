import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TurnosFormulario } from './turnos-formulario';

describe('TurnosFormulario', () => {
  let component: TurnosFormulario;
  let fixture: ComponentFixture<TurnosFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TurnosFormulario],
    }).compileComponents();

    fixture = TestBed.createComponent(TurnosFormulario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
