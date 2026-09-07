import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CrearEspecialidadDto } from "./dto/crear-especialidad.dto";
import { ActualizarEspecialidadDto } from "./dto/actualizar-especialidad.dto";


import { PaginacionDto, parametrosPagina } from '../comun/paginacion.dto';
import type { Prisma } from '../generated/prisma/client';

@Injectable()
export class EspecialidadService {
    async buscarPagina(consulta: PaginacionDto) {
      const { pagina, limite, skip, busqueda } = parametrosPagina(consulta);
      const texto = { contains: busqueda, mode: 'insensitive' as const };
      const where: Prisma.EspecialidadWhereInput = busqueda ? { OR: [{ nombre: texto }, { descripcion: texto }] } : {};
      const [datos, total] = await this.prisma.$transaction([
        this.prisma.especialidad.findMany({ where, skip, take: limite, include: undefined, orderBy: [{ nombre: 'asc' }, { id: 'asc' }] }),
        this.prisma.especialidad.count({ where }),
      ], { isolationLevel: 'RepeatableRead' });
      return { datos, total, pagina, limite };
    }

    constructor(private readonly prisma: PrismaService) { }

    crear(datos: CrearEspecialidadDto) {
        return this.prisma.especialidad.create({
            data: datos
        });
    }

    buscarTodas() {
        return this.prisma.especialidad.findMany({
            orderBy: { nombre: 'asc' }
        });
    }

    async buscarPorId(id: number) {
        const especialidad = await this.prisma.especialidad.findUnique({
            where: { id },
        });

        if (!especialidad) {
            throw new NotFoundException(`Especialidad con id ${id} no encontrada`);
        }

        return especialidad;
    }

    async actualizar(id: number, datos: ActualizarEspecialidadDto) {
        await this.buscarPorId(id);

        return this.prisma.especialidad.update({
            where: { id },
            data: datos
        });
    }

    async eliminar(id: number) {
        await this.buscarPorId(id);

        return this.prisma.especialidad.delete({
            where: { id }
        });
    }

}
