import { Component } from '@angular/core';
import { FormularioRegistro } from '../components/formulario-registro/formulario-registro';
import { PublicFooter } from '../components/public-footer/public-footer';
@Component({
  selector: 'app-registro',
  imports: [FormularioRegistro, PublicFooter],
  templateUrl: './registro.html',
})
export class Registro {}
