import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { ProfesionalService } from '../../../core/services/profesional.service';
import { Especialidad } from '../../../core/models/especialidad.model';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';

@Component({
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, SelectModule, PasswordModule],
  selector: 'app-profesional-formulario',
  styleUrl: './profesional-formulario.css',
  templateUrl: './profesional-formulario.html',
})
export class ProfesionalFormulario implements OnInit {
  private readonly profesionalService = inject(ProfesionalService);
  private readonly fb = inject(FormBuilder);
  private readonly especialidadService = inject(EspecialidadService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly esEdicion = signal(false);
  readonly especialidades = signal<Especialidad[]>([]);

  private idEditando: number | null = null;

  readonly formulario = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(8)]],
    matricula: ['', Validators.required],
    telefono: [''],
    especialidadId: [null as number | null, Validators.required],
  });

  ngOnInit() {
    this.especialidadService.listar().subscribe({
      next: (datos) => {
        this.especialidades.set(datos);
      },
      error: (err) => {
        this.error.set('Error al cargar las especialidades');
      },
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      return;
    }

    this.esEdicion.set(true);
    this.idEditando = Number(idParam);

    this.formulario.controls.contrasena.setValidators([Validators.minLength(8)]);
    this.formulario.controls.contrasena.updateValueAndValidity();

    this.profesionalService.buscarPorId(this.idEditando).subscribe({
      next: (profesional) => {
        this.formulario.patchValue({
          nombre: profesional.usuario.nombre,
          apellido: profesional.usuario.apellido,
          email: profesional.usuario.email,
          matricula: profesional.matricula,
          telefono: profesional.telefono,
          especialidadId: profesional.especialidad.id,
        });
      },
      error: () => this.error.set('Error al cargar los datos del profesional'),
    });
  }

  enviar(): void {
    if (this.cargando()) return;
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.error.set(null);
    const datos = this.formulario.getRawValue();
    const peticion = this.esEdicion()
      ? this.profesionalService.actualizar(this.idEditando!, {
        nombre: datos.nombre!,
        apellido: datos.apellido!,
        email: datos.email!,
        contrasena: datos.contrasena || undefined,
        matricula: datos.matricula!,
        telefono: datos.telefono ?? '',
        especialidadId: datos.especialidadId!,
      })
      : this.profesionalService.crear({
        nombre: datos.nombre!,
        apellido: datos.apellido!,
        email: datos.email!,
        contrasena: datos.contrasena!,
        matricula: datos.matricula!,
        telefono: datos.telefono || undefined,
        especialidadId: datos.especialidadId!,
      });

    peticion.subscribe({
      next: () => this.router.navigate(['/profesionales']),
      error: (err) => {
        this.cargando.set(false);
        this.error.set(
          err.status === 403
            ? 'No tenés permisos para esta acción'
            : (err.error?.mensaje ?? 'Ocurrió un error al guardar'),
        );
      },
    });
  }
}







