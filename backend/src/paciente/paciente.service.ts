import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { hashearContrasena } from '../auth/hash.util';
import { PrismaService } from "../prisma/prisma.service";
import { ActualizarPacienteDto } from "./dto/actualizar-paciente.dto";

const SELECCION_USUARIO = {
    select: { id: true, nombre: true, apellido: true, email: true },
} as const;


import { PaginacionDto, parametrosPagina } from '../comun/paginacion.dto';
import type { Prisma } from '../generated/prisma/client';

@Injectable()
export class PacienteService {
    async buscarPagina(consulta: PaginacionDto) {
        const { pagina, limite, skip, busqueda } = parametrosPagina(consulta);
        const texto = { contains: busqueda, mode: 'insensitive' as const };
        const where: Prisma.PacienteWhereInput = busqueda ? { OR: [{ dni: texto }, { telefono: texto }, { usuario: { OR: [{ nombre: texto }, { apellido: texto }, { email: texto }] } }] } : {};
        const [datos, total] = await this.prisma.$transaction([
            this.prisma.paciente.findMany({ where, skip, take: limite, include: { usuario: SELECCION_USUARIO }, orderBy: [{ creadoEn: 'desc' }, { id: 'desc' }] }),
            this.prisma.paciente.count({ where }),
        ], { isolationLevel: 'RepeatableRead' });
        return { datos, total, pagina, limite };
    }
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
        if (datos.fechaNacimiento && new Date(datos.fechaNacimiento) > new Date()) {
            throw new BadRequestException('La fecha de nacimiento no puede ser futura.');
        }
        const contrasenaHash = datos.contrasena ? await hashearContrasena(datos.contrasena) : undefined;
        return this.prisma.paciente.update({
            where: { id },
            data: {
                dni: datos.dni, telefono: datos.telefono,
                fechaNacimiento: datos.fechaNacimiento ? new Date(datos.fechaNacimiento) : undefined,
                usuario: { update: { nombre: datos.nombre?.trim(), apellido: datos.apellido?.trim(), email: datos.email, contrasenaHash } },
            },
            include: { usuario: SELECCION_USUARIO },
        });
    }

    async eliminar(id: number) {
        await this.buscarPorId(id);
        return this.prisma.paciente.delete({ where: { id } });
    }

}
