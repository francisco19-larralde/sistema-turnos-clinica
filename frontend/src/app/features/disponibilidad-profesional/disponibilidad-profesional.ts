import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Disponibilidad, DiaSemana } from '../../core/models/disponibilidad.model';
import { Profesional } from '../../core/models/profesional.model';
import { DisponibilidadService } from '../../core/services/disponibilidad.service';
import { ProfesionalService } from '../../core/services/profesional.service';
import { BloqueosProfesional } from './bloqueos-profesional/bloqueos-profesional';



const FORMATO_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

const validarRangoHorario: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const inicio = control.get('horaInicio')?.value as string;
  const fin = control.get('horaFin')?.value as string;

  if (!FORMATO_HORA.test(inicio) || !FORMATO_HORA.test(fin)) {
    return null;
  }

  return inicio < fin ? null : { rangoHorario: true };
};

@Component({
  selector: 'app-disponibilidad-profesional',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    BloqueosProfesional,
    RouterLink,
    ButtonModule,
    InputTextModule,
    SelectModule,
  ],
  templateUrl: './disponibilidad-profesional.html',
})
export class DisponibilidadProfesional implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly disponibilidadService = inject(DisponibilidadService);
  private readonly profesionalService = inject(ProfesionalService);

  readonly profesional = signal<Profesional | null>(null);
  readonly disponibilidades = signal<Disponibilidad[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly errorCarga = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly exito = signal<string | null>(null);

  readonly dias: { nombre: string; valor: DiaSemana }[] = [
    { nombre: 'Lunes', valor: 'LUNES' },
    { nombre: 'Martes', valor: 'MARTES' },
    { nombre: 'Miércoles', valor: 'MIERCOLES' },
    { nombre: 'Jueves', valor: 'JUEVES' },
    { nombre: 'Viernes', valor: 'VIERNES' },
    { nombre: 'Sábado', valor: 'SABADO' },
    { nombre: 'Domingo', valor: 'DOMINGO' },
  ];

  readonly formulario = this.fb.nonNullable.group(
    {
      diaSemana: ['LUNES' as DiaSemana, Validators.required],
      horaInicio: [
        '',
        [Validators.required, Validators.pattern(FORMATO_HORA)],
      ],
      horaFin: [
        '',
        [Validators.required, Validators.pattern(FORMATO_HORA)],
      ],
    },
    { validators: validarRangoHorario },
  );

  private profesionalId = 0;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isSafeInteger(id) || id <= 0) {
      this.errorCarga.set('El identificador del profesional no es válido.');
      this.cargando.set(false);
      return;
    }

    this.profesionalId = id;
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);

    forkJoin({
      profesional: this.profesionalService.buscarPorId(this.profesionalId),
      disponibilidades: this.disponibilidadService.listarPorProfesional(
        this.profesionalId,
      ),
    })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: ({ profesional, disponibilidades }) => {
          this.profesional.set(profesional);
          this.disponibilidades.set(this.ordenar(disponibilidades));
        },
        error: (err: HttpErrorResponse) => {
          this.errorCarga.set(
            this.mensajeError(err, 'No se pudo cargar la disponibilidad.'),
          );
        },
      });
  }

  enviar(): void {
    if (this.guardando() || this.cargando() || !this.profesional()) {
      return;
    }

    this.error.set(null);
    this.exito.set(null);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const datos = this.formulario.getRawValue();

    const seSuperpone = this.disponibilidades().some(
      (disponibilidad) =>
        disponibilidad.diaSemana === datos.diaSemana &&
        datos.horaInicio < disponibilidad.horaFin &&
        datos.horaFin > disponibilidad.horaInicio,
    );

    if (seSuperpone) {
      this.error.set(
        'La franja se superpone con una disponibilidad existente de ese día.',
      );
      return;
    }

    this.guardando.set(true);

    this.disponibilidadService
      .crear(this.profesionalId, datos)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: (creada) => {
          this.disponibilidades.update((lista) =>
            this.ordenar([...lista, creada]),
          );

          this.formulario.reset({
            diaSemana: datos.diaSemana,
            horaInicio: '',
            horaFin: '',
          });

          this.exito.set('Disponibilidad agregada correctamente.');
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(
            this.mensajeError(err, 'No se pudo guardar la disponibilidad.'),
          );
        },
      });
  }

  nombreDia(dia: DiaSemana): string {
    return this.dias.find((item) => item.valor === dia)?.nombre ?? dia;
  }

  private ordenar(lista: Disponibilidad[]): Disponibilidad[] {
    const ordenDia = (dia: DiaSemana) =>
      this.dias.findIndex((item) => item.valor === dia);

    return [...lista].sort(
      (a, b) =>
        ordenDia(a.diaSemana) - ordenDia(b.diaSemana) ||
        a.horaInicio.localeCompare(b.horaInicio),
    );
  }

  private mensajeError(
    err: HttpErrorResponse,
    mensajeAlternativo: string,
  ): string {
    if (err.status === 403) {
      return 'No tenés permisos para realizar esta acción.';
    }

    if (err.status === 401) {
      return 'Tu sesión venció. Volvé a iniciar sesión.';
    }

    const mensaje = err.error?.mensaje;

    if (Array.isArray(mensaje)) {
      return mensaje.join('. ');
    }

    return typeof mensaje === 'string' ? mensaje : mensajeAlternativo;
  }
}
