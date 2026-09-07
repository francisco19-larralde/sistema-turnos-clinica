import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FormularioRegistro } from '../components/formulario-registro/formulario-registro';
import { PublicFooter } from '../components/public-footer/public-footer';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ButtonModule, FormularioRegistro, PublicFooter],
  templateUrl: './home.html',
})
export class Home {
  readonly pasos = [
    { numero: '01', icono: 'pi pi-user-plus', titulo: 'Creá tu cuenta', texto: 'Completá tus datos una sola vez y accedé a tu espacio personal.' },
    { numero: '02', icono: 'pi pi-calendar', titulo: 'Elegí tu turno', texto: 'Encontrá a tu profesional y consultá los días y horarios disponibles.' },
    { numero: '03', icono: 'pi pi-check', titulo: 'Listo, te esperamos', texto: 'Reservá tu horario y seguí el estado de tu turno desde tu cuenta.' },
  ];
  readonly preguntas = [
    { titulo: '¿Qué necesito para reservar un turno?', respuesta: 'Creá una cuenta con tus datos personales e iniciá sesión. Después elegí un profesional y seleccioná uno de sus horarios disponibles.' },
    { titulo: '¿Puedo cambiar el día o la hora?', respuesta: 'Sí. Desde la sección Turnos podés abrir el detalle y reprogramar un turno pendiente o confirmado que aún no haya pasado. El nuevo horario queda pendiente de confirmación.' },
    { titulo: '¿Dónde veo si mi turno está confirmado?', respuesta: 'En tu cuenta, dentro de Turnos, podés consultar la fecha, el profesional y el estado de cada reserva.' },
    { titulo: '¿Qué pasa si no puedo asistir?', respuesta: 'Podés cancelar un turno pendiente o confirmado desde tu cuenta. Así el horario vuelve a quedar disponible para otra persona.' },
  ];
}
