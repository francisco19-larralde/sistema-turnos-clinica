import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CrearPacienteDto } from "./dto/crear-paciente.dto";
import { ActualizarPacienteDto } from "./dto/actualizar-paciente.dto";


@Injectable()
export class PacienteService {
    constructor(private readonly prisma: PrismaService) { }

    crear(datos: CrearPacienteDto) {
        return this.prisma.paciente.create({
            data: datos
        })
    }

    buscarTodos() {
        return this.prisma.paciente.findMany({
            orderBy: { apellido: 'asc' }
        })
    }

    async buscarPorId(id: number) {
        const paciente = await this.prisma.paciente.findUnique({
            where: { id }
        })

        if (!paciente) {
            throw new NotFoundException(`Paciente con id ${id} no encontrado`)
        }

        return paciente;
    }

    async actualizar(id: number, datos: ActualizarPacienteDto) {
        await this.buscarPorId(id);

        return this.prisma.paciente.update({
            where: { id },
            data: datos
        });
    }

    async eliminar(id: number) {
        await this.buscarPorId(id);

        return this.prisma.paciente.delete({
            where: { id }
        });
    }

}