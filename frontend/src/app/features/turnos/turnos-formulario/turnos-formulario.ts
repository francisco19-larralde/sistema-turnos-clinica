import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { Profesional } from '../../../core/models/profesional.model';
import { ProfesionalService } from '../../../core/services/profesional.service';
import { TurnoService } from '../../../core/services/turno.service';
import { MatrizTurnos } from '../turnos-matriz/turnos';


@Component({
  selector: 'app-turno-formulario',
  imports: [RouterLink, ButtonModule, SelectModule, MatrizTurnos],
  templateUrl: './turnos-formulario.html',
})
export class TurnoFormularioComponent implements OnInit {
  readonly profesionales = signal<Profesional[]>([]);
  readonly profesionalSeleccionadoId = signal<number | null>(null);
  readonly seleccion = signal<{ fecha: string; hora: string } | null>(null);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  constructor(
    private readonly profesionalService: ProfesionalService,
    private readonly turnoService: TurnoService,
    private readonly router: Router,
  ) { }

  ngOnInit(): void {
    this.profesionalService.listar().subscribe({
      next: (datos) => this.profesionales.set(datos),
      error: () => this.error.set('No se pudieron cargar los profesionales'),
    });
  }

  seleccionarProfesional(profesional: Profesional): void {
    this.profesionalSeleccionadoId.set(profesional.id);
    this.seleccion.set(null);
  }

  onHorarioSeleccionado(evento: { fecha: string; hora: string }): void {
    this.seleccion.set(evento);
  }

  confirmarTurno(): void {
    const seleccion = this.seleccion();
    const profesionalId = this.profesionalSeleccionadoId();
    if (!seleccion || !profesionalId) return;

    this.cargando.set(true);
    this.error.set(null);

    this.turnoService
      .crear({ profesionalId, fecha: seleccion.fecha, horaInicio: seleccion.hora })
      .subscribe({
        next: () => this.router.navigate(['/turnos']),
        error: (err) => {
          this.cargando.set(false);
          this.error.set(err.error?.mensaje ?? 'No se pudo crear el turno');
        },
      });
  }
}
