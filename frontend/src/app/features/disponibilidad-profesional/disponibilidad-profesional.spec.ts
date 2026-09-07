import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DisponibilidadProfesional } from './disponibilidad-profesional';

describe('DisponibilidadProfesional', () => {
  let component: DisponibilidadProfesional;
  let fixture: ComponentFixture<DisponibilidadProfesional>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisponibilidadProfesional],
    }).compileComponents();

    fixture = TestBed.createComponent(DisponibilidadProfesional);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
