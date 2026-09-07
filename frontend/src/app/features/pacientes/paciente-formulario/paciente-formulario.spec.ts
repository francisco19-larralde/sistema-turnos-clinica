import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PacienteFormulario } from './paciente-formulario';

describe('PacienteFormulario', () => {
  let component: PacienteFormulario;
  let fixture: ComponentFixture<PacienteFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacienteFormulario],
    }).compileComponents();

    fixture = TestBed.createComponent(PacienteFormulario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
