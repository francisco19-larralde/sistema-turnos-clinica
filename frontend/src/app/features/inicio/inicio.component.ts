import { Component, inject } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: 'app-inicio',
  imports: [ButtonModule],
  templateUrl: './inicio.component.html',
})
export class InicioComponent {
  readonly authService = inject(AuthService);

  cerrarSesion(): void {
    this.authService.logout();
  }
}
