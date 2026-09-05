import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

@Component({
  imports: [RouterLink, ReactiveFormsModule, ButtonModule, InputTextModule, TextareaModule],
  selector: 'app-especialidad-formulario',
  styleUrl: './especialidad-formulario.css',
  templateUrl: './especialidad-formulario.html',
})
export class EspecialidadFormulario implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly especialidadService = inject(EspecialidadService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);


  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly esEdicion = signal(false);

  private idEditando: number | null = null;

  readonly formulario = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: ['', [Validators.maxLength(500)]],
  })

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      return;
    }

    this.esEdicion.set(true);
    this.idEditando = Number(idParam);

    this.especialidadService.buscarPorId(this.idEditando).subscribe({
      next: (especialidad) => {
        this.formulario.patchValue({
          nombre: especialidad.nombre,
          descripcion: especialidad.descripcion,
        });
      },
      error: () => {
        this.error.set('No se pudo cargar la especialidad.');
      }
    })
  }

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.error.set(null);
    const datos = this.formulario.getRawValue();

    const peticion = this.esEdicion()
      ? this.especialidadService.actualizar(this.idEditando!, {
        nombre: datos.nombre!,
        descripcion: datos.descripcion || undefined,
      })
      : this.especialidadService.crear({
        nombre: datos.nombre!,
        descripcion: datos.descripcion || undefined,
      });

    peticion.subscribe({
      next: () => {
        this.router.navigate(['/especialidades']);
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(err.error?.message ?? 'Ocurrió un error al guardar.');
      }
    })

  }




}
