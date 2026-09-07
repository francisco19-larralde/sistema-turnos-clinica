import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearProfesionalDto } from './dto/crear-profesional.dto';
import { ActualizarProfesionalDto } from './dto/actualizar-profesional.dto';
import { hashearContrasena } from '../auth/hash.util';
import { Rol } from '../generated/prisma/client';

const SELECCION_USUARIO = {
    select: { id: true, nombre: true, apellido: true, email: true, rol: true },
} as const;

import { PaginacionDto, parametrosPagina } from '../comun/paginacion.dto';
import type { Prisma } from '../generated/prisma/client';

@Injectable()
export class ProfesionalService {
    async buscarPagina(consulta: PaginacionDto) {
        const { pagina, limite, skip, busqueda } = parametrosPagina(consulta);
        const texto = { contains: busqueda, mode: 'insensitive' as const };
        const where: Prisma.ProfesionalWhereInput = busqueda ? { OR: [{ matricula: texto }, { especialidad: { nombre: texto } }, { usuario: { OR: [{ nombre: texto }, { apellido: texto }, { email: texto }] } }] } : {};
        const [datos, total] = await this.prisma.$transaction([
            this.prisma.profesional.findMany({ where, skip, take: limite, include: { especialidad: true, usuario: SELECCION_USUARIO }, orderBy: [{ creadoEn: 'desc' }, { id: 'desc' }] }),
            this.prisma.profesional.count({ where }),
        ], { isolationLevel: 'RepeatableRead' });
        return { datos, total, pagina, limite };
    }
    constructor(private readonly prisma: PrismaService) { }

    async crear(datos: CrearProfesionalDto) {
        await this.validarEspecialidadExiste(datos.especialidadId);

        const emailExistente = await this.prisma.usuario.findUnique({
            where: { email: datos.email },
        });
        if (emailExistente) {
            throw new ConflictException('Ya existe un usuario registrado con ese email');
        }

        const contrasenaHash = await hashearContrasena(datos.contrasena);

        return this.prisma.$transaction(async (tx) => {
            const usuario = await tx.usuario.create({
                data: {
                    nombre: datos.nombre,
                    apellido: datos.apellido,
                    email: datos.email,
                    contrasenaHash,
                    rol: Rol.PROFESIONAL,
                },
            });

            return tx.profesional.create({
                data: {
                    matricula: datos.matricula,
                    telefono: datos.telefono,
                    especialidadId: datos.especialidadId,
                    usuarioId: usuario.id,
                },
                include: { especialidad: true, usuario: SELECCION_USUARIO },
            });
        });
    }

    buscarTodos() {
        return this.prisma.profesional.findMany({
            include: { especialidad: true, usuario: SELECCION_USUARIO },
            orderBy: { creadoEn: 'desc' },
        });
    }

    async buscarPorId(id: number) {
        const profesional = await this.prisma.profesional.findUnique({
            where: { id },
            include: { especialidad: true, usuario: SELECCION_USUARIO },
        });

        if (!profesional) {
            throw new NotFoundException(`No existe un profesional con id ${id}`);
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
            include: { especialidad: true, usuario: SELECCION_USUARIO },
        });
    }

    async eliminar(id: number) {
        await this.buscarPorId(id);
        return this.prisma.profesional.delete({ where: { id } });
    }

    private async validarEspecialidadExiste(especialidadId: number) {
        const especialidad = await this.prisma.especialidad.findUnique({
            where: { id: especialidadId },
        });

        if (!especialidad) {
            throw new BadRequestException(
                `No existe una especialidad con id ${especialidadId}`,
            );
        }
    }
}
