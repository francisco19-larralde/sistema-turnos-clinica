import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfesionalFormulario } from './profesional-formulario';

describe('ProfesionalFormulario', () => {
  let component: ProfesionalFormulario;
  let fixture: ComponentFixture<ProfesionalFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfesionalFormulario],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfesionalFormulario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
