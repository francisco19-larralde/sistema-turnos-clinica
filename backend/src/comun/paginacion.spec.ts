import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PaginacionDto, parametrosPagina } from './paginacion.dto';
import { TurnoService } from '../turno/turno.service';
import { Rol } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
jest.mock('../prisma/prisma.service', () => ({ PrismaService: class PrismaService {} }));

describe('Paginación del servidor', () => {
  it('valida límites y calcula el desplazamiento', async () => {
    const consulta = plainToInstance(PaginacionDto, { pagina: '2', limite: '25' });
    expect(await validate(consulta)).toHaveLength(0);
    expect(parametrosPagina(consulta).skip).toBe(25);
    expect((await validate(plainToInstance(PaginacionDto, { pagina: 0, limite: 101 }))).length).toBeGreaterThan(0);
  });

  it('filtra datos y conteo por el paciente autenticado y limita la consulta', async () => {
    const prisma = {
      paciente: { findUnique: jest.fn().mockResolvedValue({ id: 7 }) },
      turno: { findMany: jest.fn().mockResolvedValue([{ id: 1 }]), count: jest.fn().mockResolvedValue(32) },
      $transaction: jest.fn((queries: Promise<unknown>[]) => Promise.all(queries)),
    };
    const servicio = new TurnoService(prisma as unknown as PrismaService);
    const resultado = await servicio.buscarPagina({ sub: 4, email: 'test@test.com', rol: Rol.PACIENTE },
      { pagina: 2, limite: 10, fecha: '2026-09-18', busqueda: 'Ana' });
    const consulta = prisma.turno.findMany.mock.calls[0][0];
    expect(consulta.skip).toBe(10);
    expect(consulta.take).toBe(10);
    expect(consulta.where.pacienteId).toBe(7);
    expect(consulta.where.fecha.toISOString()).toBe('2026-09-18T00:00:00.000Z');
    expect(prisma.turno.count).toHaveBeenCalledWith({ where: consulta.where });
    expect(resultado.total).toBe(32);
  });
});
