import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EstadoTurno, Rol } from "../generated/prisma/enums";
import { DURACION_TURNO_MINUTOS, horaAMinutos, minutosAHora, obtenerDiaSemana } from "./turno.constantes";
import { CrearTurnoDto } from "./dto/crear-turno.dto";

const INCLUDE_TURNO = {
    paciente: {
        include: { usuario: { select: { nombre: true, apellido: true, email: true } } },
    },
    profesional: {
        include: {
            usuario: { select: { nombre: true, apellido: true } },
            especialidad: true,
        },
    },
} as const;

interface UsuarioAutenticado {
    sub: number;
    email: string;
    rol: Rol;
}


@Injectable()
export class TurnoService {

    constructor(private readonly prisma: PrismaService) { }


    async crear(datos: CrearTurnoDto, usuarioSolicitante: UsuarioAutenticado) {
        const pacienteId = await this.resolverPacienteId(datos, usuarioSolicitante);

        const profesional = await this.prisma.profesional.findUnique({
            where: { id: datos.profesionalId }
        });

        if (!profesional) {
            throw new NotFoundException(`Profesional con id ${datos.profesionalId} no encontrado`);
        }

        const minutoInicio = horaAMinutos(datos.horaInicio);
        const minutoFin = minutoInicio + DURACION_TURNO_MINUTOS;
        const horaFin = minutosAHora(minutoFin);

        this.validarNoEsPasado(datos.fecha, datos.horaInicio);
        await this.validarDentroDeDisponibilidad(
            datos.profesionalId,
            datos.fecha,
            minutoInicio,
            minutoFin
        );

        await this.validarSinSuperposicion(
            datos.profesionalId,
            datos.fecha,
            minutoInicio,
            minutoFin,
        );

        const fecha = new Date(`${datos.fecha}T00:00:00`);

        return this.prisma.turno.create({
            data: {
                fecha,
                horaInicio: datos.horaInicio,
                horaFin,
                pacienteId,
                profesionalId: datos.profesionalId
            },
            include: INCLUDE_TURNO,
        });
    }

    async buscarTodos(usuarioSolicitante: UsuarioAutenticado) {
        const filtro = await this.construirFiltroPorRol(usuarioSolicitante)

        return this.prisma.turno.findMany({
            where: filtro,
            include: INCLUDE_TURNO,
            orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' },]
        })
    }

    async buscarPorId(id: number, usuarioSolicitante: UsuarioAutenticado) {
        const turno = await this.obtenerTurnoOFallar(id);
        this.validarPuedeVer(turno, usuarioSolicitante);
        return turno;
    }

    async cancelar(id: number, usuarioSolicitante: UsuarioAutenticado) {
        const turno = await this.obtenerTurnoOFallar(id);
        this.validarPuedeVer(turno, usuarioSolicitante);

        if (turno.estado === EstadoTurno.CANCELADO || turno.estado === EstadoTurno.COMPLETADO) {
            throw new BadRequestException(`No se puede cancelar un turno que ya está ${turno.estado}`);
        }

        return this.prisma.turno.update({
            where: { id },
            data: { estado: EstadoTurno.CANCELADO },
            include: INCLUDE_TURNO,
        });
    }

    async confirmar(id: number, usuarioSolicitante: UsuarioAutenticado) {
        const turno = await this.obtenerTurnoOFallar(id);
        this.validarEsProfesionalAsignadoOAdmin(turno, usuarioSolicitante);

        if (turno.estado !== EstadoTurno.PENDIENTE) {
            throw new BadRequestException('Solo se puede confirmar un turno pendiente');
        }

        return this.prisma.turno.update({
            where: { id },
            data: { estado: EstadoTurno.CONFIRMADO },
            include: INCLUDE_TURNO,
        });
    }

    async completar(id: number, usuarioSolicitante: UsuarioAutenticado) {
        const turno = await this.obtenerTurnoOFallar(id);
        this.validarEsProfesionalAsignadoOAdmin(turno, usuarioSolicitante);

        if (turno.estado !== EstadoTurno.CONFIRMADO) {
            throw new BadRequestException('Solo se puede completar un turno confirmado');
        }

        return this.prisma.turno.update({
            where: { id },
            data: { estado: EstadoTurno.COMPLETADO },
            include: INCLUDE_TURNO,
        });
    }

    async obtenerHorariosDisponibles(profesionalId: number, fecha: string) {
        if (!fecha) {
            throw new BadRequestException('Debe indicar el parámetro fecha (YYYY-MM-DD)');
        }

        const profesional = await this.prisma.profesional.findUnique({
            where: { id: profesionalId },
        });

        if (!profesional) {
            throw new NotFoundException(`Profesional con id ${profesionalId} no encontrado`);
        }

        const diaSemana = obtenerDiaSemana(new Date(`${fecha}T00:00:00Z`));

        const disponibilidades = await this.prisma.disponibilidad.findMany({
            where: { profesionalId, diaSemana },
        })

        if (disponibilidades.length === 0) {
            return [];
        }

        const turnosDelDia = await this.prisma.turno.findMany({
            where: { profesionalId, fecha: new Date(fecha), estado: { not: EstadoTurno.CANCELADO } },
        });

        const rangosOcupados = turnosDelDia.map((turno) => ({
            inicio: horaAMinutos(turno.horaInicio),
            fin: horaAMinutos(turno.horaFin),
        }));

        const ahora = Date.now();
        const horariosLibres: string[] = [];

        for (const disponibilidad of disponibilidades) {
            let cursor = horaAMinutos(disponibilidad.horaInicio);
            const finRango = horaAMinutos(disponibilidad.horaFin);
            while (cursor + DURACION_TURNO_MINUTOS <= finRango) {
                const finSlot = cursor + DURACION_TURNO_MINUTOS;
                const horaSlot = minutosAHora(cursor);

                const seSuperpone = rangosOcupados.some(
                    (rango) => cursor < rango.fin && finSlot > rango.inicio,
                );
                const esPasado = new Date(`${fecha}T${horaSlot}:00`).getTime() < ahora;

                if (!seSuperpone && !esPasado) {
                    horariosLibres.push(horaSlot);
                }

                cursor += DURACION_TURNO_MINUTOS;
            }
        }

        return horariosLibres;
    }




    // ---------- Helpers privados ----------

    private async resolverPacienteId(
        datos: CrearTurnoDto,
        usuarioSolicitante: UsuarioAutenticado,
    ): Promise<number> {
        if (usuarioSolicitante.rol === Rol.PACIENTE) {
            const paciente = await this.prisma.paciente.findUnique({
                where: { usuarioId: usuarioSolicitante.sub },
            });
            if (!paciente) {
                throw new BadRequestException('El usuario autenticado no tiene un perfil de paciente');
            }
            return paciente.id;
        }

        if (usuarioSolicitante.rol === Rol.ADMINISTRATIVO) {
            if (!datos.pacienteId) {
                throw new BadRequestException('Un administrativo debe indicar el pacienteId');
            }
            return datos.pacienteId;
        }

        throw new ForbiddenException('Tu rol no puede crear turnos');
    }

    private validarNoEsPasado(fecha: string, horaInicio: string) {
        const fechaHoraTurno = new Date(`${fecha}T${horaInicio}:00`);
        if (fechaHoraTurno.getTime() < Date.now()) {
            throw new BadRequestException('No se puede reservar un turno en una fecha/hora pasada');
        }
    }

    private async validarDentroDeDisponibilidad(
        profesionalId: number,
        fecha: string,
        minutoInicio: number,
        minutoFin: number,
    ) {
        const diaSemana = obtenerDiaSemana(new Date(`${fecha}T00:00:00Z`));

        const disponibilidades = await this.prisma.disponibilidad.findMany({
            where: { profesionalId, diaSemana },
        });

        const cabeEnAlgunRango = disponibilidades.some(
            (d) => horaAMinutos(d.horaInicio) <= minutoInicio && horaAMinutos(d.horaFin) >= minutoFin,
        );

        if (!cabeEnAlgunRango) {
            throw new BadRequestException(
                'El profesional no atiende en el día/horario solicitado',
            );
        }
    }

    private async validarSinSuperposicion(
        profesionalId: number,
        fecha: string,
        minutoInicio: number,
        minutoFin: number,
    ) {
        const fechaDate = new Date(`${fecha}T00:00:00`);

        const turnosDelDia = await this.prisma.turno.findMany({
            where: {
                profesionalId,
                fecha: fechaDate,
                estado: { not: EstadoTurno.CANCELADO },
            },
        });

        const haySuperposicion = turnosDelDia.some((turno) => {
            const inicioExistente = horaAMinutos(turno.horaInicio);
            const finExistente = horaAMinutos(turno.horaFin);

            return minutoInicio < finExistente && minutoFin > inicioExistente;
        });

        if (haySuperposicion) {
            throw new BadRequestException(
                'El profesional ya tiene un turno en ese horario'
            );
        }
    }

    private async construirFiltroPorRol(usuarioSolicitante: UsuarioAutenticado) {
        if (usuarioSolicitante.rol === Rol.ADMINISTRATIVO) {
            return {};
        }

        if (usuarioSolicitante.rol === Rol.PACIENTE) {
            const paciente = await this.prisma.paciente.findUnique({
                where: { usuarioId: usuarioSolicitante.sub },
            });
            return { pacienteId: paciente?.id ?? -1 };
        }


        const profesional = await this.prisma.profesional.findUnique({
            where: { usuarioId: usuarioSolicitante.sub },
        });
        return { profesionalId: profesional?.id ?? -1 };
    }

    private async obtenerTurnoOFallar(id: number) {
        const turno = await this.prisma.turno.findUnique({
            where: { id },
            include: INCLUDE_TURNO,
        });

        if (!turno) {
            throw new NotFoundException(`No existe un turno con id ${id}`);
        }

        return turno;
    }

    private validarPuedeVer(turno: any, usuarioSolicitante: UsuarioAutenticado) {
        if (usuarioSolicitante.rol === Rol.ADMINISTRATIVO) return;

        const esPacienteDueno =
            usuarioSolicitante.rol === Rol.PACIENTE &&
            turno.paciente.usuarioId === usuarioSolicitante.sub;

        const esProfesionalAsignado =
            usuarioSolicitante.rol === Rol.PROFESIONAL &&
            turno.profesional.usuarioId === usuarioSolicitante.sub;

        if (!esPacienteDueno && !esProfesionalAsignado) {
            throw new ForbiddenException('No tenés permiso para acceder a este turno');
        }
    }

    private validarEsProfesionalAsignadoOAdmin(
        turno: any,
        usuarioSolicitante: UsuarioAutenticado,
    ) {
        if (usuarioSolicitante.rol === Rol.ADMINISTRATIVO) return;

        const esProfesionalAsignado =
            usuarioSolicitante.rol === Rol.PROFESIONAL &&
            turno.profesional.usuarioId === usuarioSolicitante.sub;

        if (!esProfesionalAsignado) {
            throw new ForbiddenException('Solo el profesional asignado o un administrativo pueden hacer esto');
        }
    }



}