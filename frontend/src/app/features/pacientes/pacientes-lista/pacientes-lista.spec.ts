import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PacientesLista } from './pacientes-lista';

describe('PacientesLista', () => {
  let component: PacientesLista;
  let fixture: ComponentFixture<PacientesLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacientesLista],
    }).compileComponents();

    fixture = TestBed.createComponent(PacientesLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
