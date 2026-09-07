import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PacienteService } from '../../../core/services/paciente.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule],
  selector: 'app-paciente-formulario',
  styleUrl: './paciente-formulario.css',
  templateUrl: './paciente-formulario.html',
})
export class PacienteFormulario implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly pacienteService = inject(PacienteService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);


  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  private id!: number;

  readonly formulario = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    contrasena: ['', Validators.minLength(8)],
    dni: ['', Validators.required],
    fechaNacimiento: ['', Validators.required],
    telefono: [''],
  });


  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    this.pacienteService.buscarPorId(this.id).subscribe({
      next: (paciente) => {
        this.formulario.patchValue({
          nombre: paciente.usuario.nombre,
          apellido: paciente.usuario.apellido,
          email: paciente.usuario.email,
          dni: paciente.dni,
          fechaNacimiento: paciente.fechaNacimiento.slice(0, 10),
          telefono: paciente.telefono ?? '',
        });
      },
      error: () => this.error.set('No se pudo cargar el paciente'),
    });
  }

  enviar(): void {
    if (this.cargando()) return;
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    const datos = this.formulario.getRawValue();

    this.pacienteService
      .actualizar(this.id, {
        nombre: datos.nombre!,
        apellido: datos.apellido!,
        email: datos.email!,
        contrasena: datos.contrasena || undefined,
        dni: datos.dni!,
        fechaNacimiento: datos.fechaNacimiento!,
        telefono: datos.telefono ?? '',
      })
      .subscribe({
        next: () => this.router.navigate(['/pacientes']),
        error: (err) => {
          this.cargando.set(false);
          this.error.set(err.error?.mensaje ?? 'No se pudo guardar');
        },
      });
  }





}
