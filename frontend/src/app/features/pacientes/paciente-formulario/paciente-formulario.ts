import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { PacienteService } from '../../../core/services/paciente.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, DatePickerModule],
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
    dni: ['', Validators.required],
    fechaNacimiento: [null as Date | null, Validators.required],
    telefono: [''],
  });


  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    this.pacienteService.buscarPorId(this.id).subscribe({
      next: (paciente) => {
        this.formulario.patchValue({
          dni: paciente.dni,
          fechaNacimiento: new Date(paciente.fechaNacimiento),
          telefono: paciente.telefono ?? '',
        });
      },
      error: () => this.error.set('No se pudo cargar el paciente'),
    });
  }

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    const datos = this.formulario.getRawValue();

    this.pacienteService
      .actualizar(this.id, {
        dni: datos.dni!,
        fechaNacimiento: datos.fechaNacimiento!.toISOString().slice(0, 10),
        telefono: datos.telefono || undefined,
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
