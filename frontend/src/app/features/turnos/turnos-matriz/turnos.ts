import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { DisponibilidadService } from '../../../core/services/disponibilidad.service';
import { TurnoService } from '../../../core/services/turno.service';
import { DiaSemana, Disponibilidad } from '../../../core/models/disponibilidad.model';


const DURACION_TURNO_MINUTOS = 30;

const DIAS_SEMANA: DiaSemana[] = [
  'DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO',
];
const ETIQUETAS_DIA = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

interface Celda {
  fecha: string;
  hora: string;
  estado: 'disponible' | 'ocupado' | 'no-aplica';
}

interface Columna {
  fecha: string;
  etiqueta: string;
}

@Component({
  imports: [],
  selector: 'app-matriz-turnos',
  styleUrl: './turnos.css',
  templateUrl: './turnos.html',
})
export class MatrizTurnos implements OnChanges {

  @Input({ required: true }) profesionalId!: number;
  @Output() horarioSeleccionado = new EventEmitter<{ fecha: string; hora: string }>();

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly columnas = signal<Columna[]>([]);
  readonly filasHorarios = signal<string[]>([]);
  private celdas = new Map<string, Celda>();

  constructor(
    private readonly disponibilidadService: DisponibilidadService,
    private readonly turnoService: TurnoService,
  ) { }

  ngOnChanges(cambios: SimpleChanges): void {
    if (cambios['profesionalId']) {
      this.cargarMatriz();
    }
  }

  obtenerCelda(fecha: string, hora: string): Celda {
    return this.celdas.get(`${fecha}_${hora}`) ?? { fecha, hora, estado: 'no-aplica' };
  }

  seleccionar(celda: Celda): void {
    if (celda.estado !== 'disponible') return;
    this.horarioSeleccionado.emit({ fecha: celda.fecha, hora: celda.hora });
  }

  private cargarMatriz(): void {
    this.cargando.set(true);
    this.error.set(null);

    const fechas = this.generarProximosDias(7);

    this.disponibilidadService.listarPorProfesional(this.profesionalId).subscribe({
      next: (disponibilidades) => {
        const fechasConDisponibilidad = fechas.filter((fecha) =>
          disponibilidades.some((d) => d.diaSemana === this.obtenerDiaSemana(fecha)),
        );

        if (fechasConDisponibilidad.length === 0) {
          this.columnas.set([]);
          this.filasHorarios.set([]);
          this.cargando.set(false);
          return;
        }

        forkJoin(
          fechasConDisponibilidad.map((fecha) =>
            this.turnoService.obtenerHorariosDisponibles(this.profesionalId, fecha),
          ),
        ).subscribe({
          next: (listasDisponibles) => {
            this.construirGrilla(fechasConDisponibilidad, disponibilidades, listasDisponibles);
            this.cargando.set(false);
          },
          error: () => {
            this.error.set('No se pudieron cargar los horarios disponibles');
            this.cargando.set(false);
          },
        });
      },
      error: () => {
        this.error.set('No se pudo cargar la disponibilidad del profesional');
        this.cargando.set(false);
      },
    });
  }

  private construirGrilla(
    fechas: string[],
    disponibilidades: Disponibilidad[],
    listasDisponibles: string[][],
  ): void {
    const todosLosHorarios = new Set<string>();
    const posiblesPorFecha = new Map<string, Set<string>>();
    const disponiblesPorFecha = new Map<string, Set<string>>();

    fechas.forEach((fecha, indice) => {
      const diaSemana = this.obtenerDiaSemana(fecha);
      const rangosDelDia = disponibilidades.filter((d) => d.diaSemana === diaSemana);
      const posibles = new Set<string>();

      for (const rango of rangosDelDia) {
        let cursor = this.horaAMinutos(rango.horaInicio);
        const fin = this.horaAMinutos(rango.horaFin);
        while (cursor + DURACION_TURNO_MINUTOS <= fin) {
          posibles.add(this.minutosAHora(cursor));
          cursor += DURACION_TURNO_MINUTOS;
        }
      }

      posiblesPorFecha.set(fecha, posibles);
      disponiblesPorFecha.set(fecha, new Set(listasDisponibles[indice]));
      posibles.forEach((hora) => todosLosHorarios.add(hora));
    });

    const horariosOrdenados = Array.from(todosLosHorarios).sort();
    const celdas = new Map<string, Celda>();

    fechas.forEach((fecha) => {
      const posibles = posiblesPorFecha.get(fecha)!;
      const disponibles = disponiblesPorFecha.get(fecha)!;

      horariosOrdenados.forEach((hora) => {
        let estado: Celda['estado'] = 'no-aplica';
        if (posibles.has(hora)) {
          estado = disponibles.has(hora) ? 'disponible' : 'ocupado';
        }
        celdas.set(`${fecha}_${hora}`, { fecha, hora, estado });
      });
    });

    this.columnas.set(fechas.map((fecha) => ({ fecha, etiqueta: this.formatearEtiqueta(fecha) })));
    this.filasHorarios.set(horariosOrdenados);
    this.celdas = celdas;
  }

  private generarProximosDias(cantidad: number): string[] {
    const fechas: string[] = [];
    const hoy = new Date();
    for (let i = 0; i < cantidad; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      fechas.push(this.formatearFecha(fecha));
    }
    return fechas;
  }

  private formatearFecha(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  private formatearEtiqueta(fecha: string): string {
    const [, mes, dia] = fecha.split('-');
    const nombreDia = ETIQUETAS_DIA[new Date(`${fecha}T00:00:00Z`).getUTCDay()];
    return `${nombreDia} ${dia}/${mes}`;
  }

  private obtenerDiaSemana(fecha: string): DiaSemana {
    return DIAS_SEMANA[new Date(`${fecha}T00:00:00Z`).getUTCDay()];
  }

  private horaAMinutos(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  }

  private minutosAHora(totalMinutos: number): string {
    const h = Math.floor(totalMinutos / 60).toString().padStart(2, '0');
    const m = (totalMinutos % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }
}
