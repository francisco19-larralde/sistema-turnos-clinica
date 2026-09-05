import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EspecialidadesLista } from './especialidades-lista';

describe('EspecialidadesLista', () => {
  let component: EspecialidadesLista;
  let fixture: ComponentFixture<EspecialidadesLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EspecialidadesLista],
    }).compileComponents();

    fixture = TestBed.createComponent(EspecialidadesLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
