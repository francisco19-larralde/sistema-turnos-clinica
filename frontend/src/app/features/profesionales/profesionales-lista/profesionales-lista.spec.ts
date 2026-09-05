import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfesionalesLista } from './profesionales-lista';

describe('ProfesionalesLista', () => {
  let component: ProfesionalesLista;
  let fixture: ComponentFixture<ProfesionalesLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfesionalesLista],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfesionalesLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
