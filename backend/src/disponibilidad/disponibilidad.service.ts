import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CrearDisponibilidadDto } from "./dto/crear-disponibilidad.dto";
import { horaAMinutos } from "../turno/turno.constantes";


@Injectable()
export class DisponibilidadService {
    constructor(private readonly prisma: PrismaService) { }


    async crear(profesionalId: number, datos: CrearDisponibilidadDto) {
        await this.validarProfesionalExiste(profesionalId);

        if (horaAMinutos(datos.horaInicio) >= horaAMinutos(datos.horaFin)) {
            throw new BadRequestException('horaInicio debe ser anterior a horaFin');
        }

        return this.prisma.disponibilidad.create({
            data: { ...datos, profesionalId },
        });
    }

    async listarPorProfesional(profesionalId: number) {
        await this.validarProfesionalExiste(profesionalId);

        return this.prisma.disponibilidad.findMany({
            where: { profesionalId },
            orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
        });
    }

    async eliminar(id: number) {
        const disponibilidad = await this.prisma.disponibilidad.findUnique({
            where: { id },
        })

        if (!disponibilidad) {
            throw new NotFoundException(`Disponibilidad con id ${id} no encontrada`);
        }
    }

    private async validarProfesionalExiste(profesionalId: number) {
        const profesional = await this.prisma.profesional.findUnique({
            where: { id: profesionalId }
        });

        if (!profesional) {
            throw new NotFoundException(`Profesional con id ${profesionalId} no encontrado`);
        }
    }


}