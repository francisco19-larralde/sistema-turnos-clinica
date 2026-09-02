import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CrearProfesionalDto } from "./dto/crear-profesional.dto";
import { ActualizarProfesionalDto } from "./dto/actualizar-profesional.dto";


@Injectable()
export class ProfesionalService {
    constructor(private readonly prisma: PrismaService) { }


    async crear(datos: CrearProfesionalDto) {
        await this.validarEspecialidadExiste(datos.especialidadId);

        return this.prisma.profesional.create({
            data: datos,
            include: { especialidad: true },
        });
    }

    buscarTodos() {
        return this.prisma.profesional.findMany({
            include: { especialidad: true },
            orderBy: { apellido: 'asc' }
        });
    }

    async buscarPorId(id: number) {
        const profesional = await this.prisma.profesional.findUnique({
            where: { id },
            include: { especialidad: true },
        });

        if (!profesional) {
            throw new NotFoundException(`No se encontró un profesional con el ID ${id}`);
        }

        return profesional;
    }

    async actualizar(id: number, datos: ActualizarProfesionalDto) {
        await this.buscarPorId(id);

        if (datos.especialidadId) {
            await this.validarEspecialidadExiste(datos.especialidadId);
        }

        return this.prisma.profesional.update({
            where: { id },
            data: datos,
            include: { especialidad: true },
        });
    }

    async eliminar(id: number) {
        await this.buscarPorId(id);
        return this.prisma.profesional.delete({
            where: { id },
        });
    }

    private async validarEspecialidadExiste(especialidadId: number) {
        const especialidad = await this.prisma.especialidad.findUnique({
            where: { id: especialidadId },
        });

        if (!especialidad) {
            throw new NotFoundException(`No se encontró una especialidad con el ID ${especialidadId}`);
        }
    }
}