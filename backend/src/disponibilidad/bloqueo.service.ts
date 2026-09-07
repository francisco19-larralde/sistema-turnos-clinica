import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearBloqueoDto } from './dto/crear-bloqueo.dto';

@Injectable()
export class BloqueoService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(profesionalId: number) {
    return this.prisma.bloqueoDisponibilidad.findMany({
      where: { profesionalId }, orderBy: { fecha: 'asc' },
    });
  }

  async crear(profesionalId: number, datos: CrearBloqueoDto) {
    const fecha = new Date(datos.fecha + 'T00:00:00Z');
    const hoy = new Date();
    const fechaHoy = new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()));
    if (Number.isNaN(fecha.getTime()) || fecha < fechaHoy) {
      throw new BadRequestException('Elegí una fecha válida desde hoy.');
    }
    return this.prisma.$transaction(async tx => {
      // La reserva de turnos usa el mismo bloqueo de fila.
      const profesional = await tx.$queryRaw<Array<{ id: number }>>`SELECT id FROM "Profesional" WHERE id = ${profesionalId} FOR UPDATE`;
      if (!profesional.length) throw new NotFoundException('Profesional no encontrado.');
      const existente = await tx.bloqueoDisponibilidad.findUnique({
        where: { profesionalId_fecha: { profesionalId, fecha } },
      });
      if (existente) throw new ConflictException('Esta fecha ya está bloqueada.');
      const turnos = await tx.turno.findMany({
        where: { profesionalId, fecha, estado: { in: ['PENDIENTE', 'CONFIRMADO'] } },
        select: { id: true, horaInicio: true }, orderBy: { horaInicio: 'asc' },
      });
      if (turnos.length) {
        throw new ConflictException('No se creó el bloqueo. Hay turnos pendientes o confirmados: ' +
          turnos.map(t => '#' + t.id + ' (' + t.horaInicio + ')').join(', ') +
          '. Gestioná esos turnos antes de bloquear la fecha.');
      }
      return tx.bloqueoDisponibilidad.create({ data: { profesionalId, fecha, motivo: datos.motivo } });
    });
  }

  async eliminar(profesionalId: number, id: number) {
    const resultado = await this.prisma.bloqueoDisponibilidad.deleteMany({ where: { id, profesionalId } });
    if (!resultado.count) throw new NotFoundException('Bloqueo no encontrado.');
    return { eliminado: true };
  }
}
