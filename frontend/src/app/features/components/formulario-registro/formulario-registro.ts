import { Component, DestroyRef, inject, Input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-formulario-registro',
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, RouterLink],
  templateUrl: './formulario-registro.html',
})
export class FormularioRegistro {
  @Input() prefijo = 'registro';
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly mostrarClave = signal(false);
  readonly hoy = new Date().toLocaleDateString('en-CA');
  readonly formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    apellido: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(8)]],
    dni: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(20)]],
    fechaNacimiento: ['', Validators.required],
    telefono: ['', Validators.maxLength(30)],
  });

  invalido(campo: keyof typeof this.formulario.controls): boolean {
    const control = this.formulario.controls[campo];
    return control.touched && control.invalid;
  }

  enviar(): void {
    if (this.cargando()) return;
    this.error.set(null);
    if (this.formulario.invalid || this.formulario.controls.fechaNacimiento.value > this.hoy) {
      this.formulario.markAllAsTouched();
      this.error.set(this.formulario.controls.fechaNacimiento.value > this.hoy
        ? 'La fecha de nacimiento no puede ser futura.'
        : 'Revisá los campos indicados para continuar.');
      return;
    }
    const datos = this.formulario.getRawValue();
    this.cargando.set(true);
    this.servicio.registro({
      ...datos, nombre: datos.nombre.trim(), apellido: datos.apellido.trim(),
      email: datos.email.trim(), dni: datos.dni.trim(), telefono: datos.telefono.trim(),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.cargando.set(false); this.router.navigate(['/login'], { queryParams: { registro: 'ok' } }); },
      error: err => {
        this.cargando.set(false);
        const mensaje = err.error?.mensaje;
        this.error.set(Array.isArray(mensaje) ? mensaje.join('. ') : mensaje ?? 'No pudimos crear tu cuenta. Intentá nuevamente.');
      },
    });
  }
}
