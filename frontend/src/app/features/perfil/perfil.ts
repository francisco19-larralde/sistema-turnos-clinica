import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AuthService } from '../../core/services/auth.service';
import { EspecialidadService } from '../../core/services/especialidad.service';
import { PerfilUsuario, ActualizarPerfil } from '../../core/models/usuario.model';
import { Especialidad } from '../../core/models/especialidad.model';

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, SelectModule],
  templateUrl: './perfil.html',
})
export class Perfil implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly especialidadService = inject(EspecialidadService);
  private readonly destroyRef = inject(DestroyRef);
  readonly perfil = signal<PerfilUsuario | null>(null);
  readonly especialidades = signal<Especialidad[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly exito = signal(false);
  readonly hoy = new Date().toLocaleDateString('en-CA');
  readonly formulario = inject(FormBuilder).nonNullable.group({
    nombre: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    apellido: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    dni: [''], fechaNacimiento: [''], telefono: ['', Validators.maxLength(30)],
    matricula: [''], especialidadId: [0],
    contrasenaActual: [''], nuevaContrasena: ['', [Validators.minLength(8), Validators.maxLength(128)]],
    confirmarContrasena: [''],
  });

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.auth.perfil().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: perfil => {
        this.perfil.set(perfil);
        this.formulario.patchValue({ nombre: perfil.nombre, apellido: perfil.apellido, email: perfil.email,
          dni: perfil.paciente?.dni ?? '', fechaNacimiento: perfil.paciente?.fechaNacimiento.slice(0, 10) ?? '',
          telefono: perfil.paciente?.telefono ?? perfil.profesional?.telefono ?? '',
          matricula: perfil.profesional?.matricula ?? '', especialidadId: perfil.profesional?.especialidadId ?? 0 });
        const controles = this.formulario.controls;
        if (perfil.rol === 'PACIENTE') {
          controles.dni.setValidators([Validators.required, Validators.pattern(/\S/), Validators.maxLength(20)]);
          controles.fechaNacimiento.setValidators(Validators.required);
        }
        if (perfil.rol === 'PROFESIONAL') {
          controles.matricula.setValidators([Validators.required, Validators.pattern(/\S/), Validators.maxLength(50)]);
          controles.especialidadId.setValidators([Validators.required, Validators.min(1)]);
          this.especialidadService.listar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: lista => this.especialidades.set(lista),
            error: () => {
              const actual = perfil.profesional?.especialidad;
              if (actual) this.especialidades.set([actual as Especialidad]);
              this.error.set('No se pudieron cargar las especialidades. Podés conservar tu especialidad actual.');
            },
          });
        }
        Object.values(controles).forEach(control => control.updateValueAndValidity());
        this.cargando.set(false);
      },
      error: () => { this.cargando.set(false); this.error.set('No se pudo cargar tu perfil. Intentá nuevamente.'); },
    });
  }

  enviar(): void {
    const perfil = this.perfil();
    if (!perfil || this.guardando()) return;
    this.error.set(''); this.exito.set(false);
    const valor = this.formulario.getRawValue();
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched(); this.error.set('Revisá los datos. Completá los campos obligatorios y usá una contraseña de al menos 8 caracteres.'); return;
    }
    if (perfil.rol === 'PACIENTE' && valor.fechaNacimiento > this.hoy) {
      this.error.set('La fecha de nacimiento no puede ser futura.'); return;
    }
    if (valor.nuevaContrasena && (!valor.contrasenaActual || valor.nuevaContrasena !== valor.confirmarContrasena)) {
      this.error.set('Ingresá tu contraseña actual y repetí correctamente la nueva contraseña.'); return;
    }
    const datos: ActualizarPerfil = { nombre: valor.nombre.trim(), apellido: valor.apellido.trim(), email: valor.email.trim() };
    if (perfil.rol === 'PACIENTE') Object.assign(datos, { dni: valor.dni.trim(), fechaNacimiento: valor.fechaNacimiento, telefono: valor.telefono.trim() });
    if (perfil.rol === 'PROFESIONAL') Object.assign(datos, { matricula: valor.matricula.trim(), especialidadId: valor.especialidadId, telefono: valor.telefono.trim() });
    if (valor.nuevaContrasena) Object.assign(datos, { contrasenaActual: valor.contrasenaActual, nuevaContrasena: valor.nuevaContrasena });
    this.guardando.set(true);
    this.auth.actualizarPerfil(datos).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: actualizado => {
        this.perfil.set(actualizado); this.guardando.set(false); this.exito.set(true);
        this.formulario.patchValue({ contrasenaActual: '', nuevaContrasena: '', confirmarContrasena: '' });
        this.formulario.markAsPristine();
      },
      error: err => {
        this.guardando.set(false);
        const mensaje = err.error?.mensaje ?? err.error?.message;
        this.error.set(Array.isArray(mensaje) ? mensaje.join('. ') : mensaje || 'No se pudieron guardar los cambios.');
      },
    });
  }
}
