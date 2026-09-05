import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EspecialidadFormulario } from './especialidad-formulario';

describe('EspecialidadFormulario', () => {
  let component: EspecialidadFormulario;
  let fixture: ComponentFixture<EspecialidadFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EspecialidadFormulario],
    }).compileComponents();

    fixture = TestBed.createComponent(EspecialidadFormulario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
