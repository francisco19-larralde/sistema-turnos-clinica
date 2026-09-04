import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, RouterLink],
  selector: 'app-registro',
  styleUrl: './registro.css',
  templateUrl: './registro.html',
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly cargando = signal(false);
  readonly mensajeError = signal<string | null>(null);

  readonly formulario = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(8)]],
    dni: ['', [Validators.required]],
    fechaNacimiento: ['', [Validators.required]],
    telefono: [''],
  })

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.mensajeError.set(null);

    const { nombre, apellido, email, contrasena, dni, fechaNacimiento, telefono } = this.formulario.getRawValue();

    this.authService.registro({ nombre: nombre!, apellido: apellido!, email: email!, contrasena: contrasena!, dni: dni!, fechaNacimiento: fechaNacimiento!, telefono: telefono! }).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/login']);
      },
      error: () => {
        this.cargando.set(false);
        this.mensajeError.set('Error al registrar el usuario');
      },
    });

  }



}
