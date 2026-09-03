import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ActualizarPacienteDto } from "./dto/actualizar-paciente.dto";

const SELECCION_USUARIO = {
    select: { id: true, nombre: true, apellido: true, email: true },
} as const;


@Injectable()
export class PacienteService {
    constructor(private readonly prisma: PrismaService) { }


    buscarTodos() {
        return this.prisma.paciente.findMany({
            include: { usuario: SELECCION_USUARIO },
            orderBy: { creadoEn: 'desc' },
        })
    }

    async buscarPorId(id: number) {
        const paciente = await this.prisma.paciente.findUnique({
            where: { id },
            include: { usuario: SELECCION_USUARIO },
        });

        if (!paciente) {
            throw new NotFoundException(`No existe un paciente con id ${id}`);
        }

        return paciente;
    }

    async actualizar(id: number, datos: ActualizarPacienteDto) {
        await this.buscarPorId(id);
        return this.prisma.paciente.update({
            where: { id },
            data: datos,
            include: { usuario: SELECCION_USUARIO },
        });
    }

    async eliminar(id: number) {
        await this.buscarPorId(id);
        return this.prisma.paciente.delete({ where: { id } });
    }

}