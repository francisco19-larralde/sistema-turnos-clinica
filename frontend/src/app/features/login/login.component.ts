import { Component, inject, signal } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { PublicFooter } from '../components/public-footer/public-footer';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../core/services/auth.service';


@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, RouterLink, PublicFooter],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);


  readonly cargando = signal(false);
  readonly mostrarClave = signal(false);
  readonly registroExitoso = inject(ActivatedRoute).snapshot.queryParamMap.get('registro') === 'ok';
  readonly mensajeError = signal<string | null>(null);

  readonly formulario = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(8)]],
  })

  enviar(): void {
    if (this.cargando()) return;
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.mensajeError.set(null);

    const { email, contrasena } = this.formulario.getRawValue();

    this.authService.login({ email: email!, contrasena: contrasena! }).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/inicio']);
      },
      error: () => {
        this.cargando.set(false);
        this.mensajeError.set('Email o contraseña incorrectos');
      },
    });

  }

}
