import 'reflect-metadata';
import { TurnoService } from './turno.service';
import { PrismaService } from '../prisma/prisma.service';
import { Rol, EstadoTurno } from '../generated/prisma/enums';
jest.mock('../prisma/prisma.service', () => ({ PrismaService: class PrismaService {} }));

describe('Reprogramación', () => {
  const usuario = { sub: 10, email: 'test@test.com', rol: Rol.PACIENTE };
  const datos = { fecha: '2099-09-18', horaInicio: '11:00', motivo: 'Cambio de horario', version: 0 };
  const original = {
    id: 1, profesionalId: 2, pacienteId: 3, version: 0,
    fecha: new Date('2099-09-11T00:00:00Z'), horaInicio: '09:00', horaFin: '09:30',
    estado: EstadoTurno.CONFIRMADO, paciente: { usuarioId: 10 }, profesional: { usuarioId: 20 },
  };
  const prisma = {
    $transaction: jest.fn(), $queryRaw: jest.fn(),
    turno: { findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn() },
    disponibilidad: { findMany: jest.fn() },
    bloqueoDisponibilidad: { findUnique: jest.fn() },
    reprogramacionTurno: { create: jest.fn(), findMany: jest.fn(), count: jest.fn() },
  };
  const servicio = new TurnoService(prisma as unknown as PrismaService);

  beforeEach(() => {
    jest.resetAllMocks();
    prisma.$transaction.mockImplementation(callback => typeof callback === 'function' ? callback(prisma) : Promise.all(callback));
    prisma.turno.findUnique.mockResolvedValue(original);
    prisma.turno.findMany.mockResolvedValue([]);
    prisma.turno.update.mockResolvedValue({ ...original, ...datos, version: 1, estado: EstadoTurno.PENDIENTE });
    prisma.disponibilidad.findMany.mockResolvedValue([{ horaInicio: '08:00', horaFin: '14:00' }]);
    prisma.bloqueoDisponibilidad.findUnique.mockResolvedValue(null);
  });

  it('actualiza el turno y registra antes, después y autor en una transacción', async () => {
    const resultado = await servicio.reprogramar(1, datos, usuario);
    expect(resultado.estado).toBe(EstadoTurno.PENDIENTE);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.reprogramacionTurno.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        turnoId: 1, usuarioId: 10, fechaAnterior: original.fecha, horaAnterior: '09:00',
        fechaNueva: new Date('2099-09-18T00:00:00Z'), horaNueva: '11:00', estadoAnterior: 'CONFIRMADO',
      }),
    });
    expect(prisma.turno.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({ id: { not: 1 } }),
    });
  });

  it('no modifica ni registra cambios si el horario se ocupó', async () => {
    prisma.turno.findMany.mockResolvedValue([{ horaInicio: '11:00', horaFin: '11:30' }]);
    await expect(servicio.reprogramar(1, datos, usuario)).rejects.toThrow('ya tiene un turno');
    expect(prisma.turno.update).not.toHaveBeenCalled();
    expect(prisma.reprogramacionTurno.create).not.toHaveBeenCalled();
  });

  it('rechaza días bloqueados', async () => {
    prisma.bloqueoDisponibilidad.findUnique.mockResolvedValue({ id: 1 });
    await expect(servicio.reprogramar(1, datos, usuario)).rejects.toThrow('no atiende');
    expect(prisma.turno.update).not.toHaveBeenCalled();
  });

  it('rechaza cambios hechos desde una versión desactualizada', async () => {
    await expect(servicio.reprogramar(1, { ...datos, version: 1 }, usuario)).rejects.toThrow('El turno cambió');
    expect(prisma.turno.update).not.toHaveBeenCalled();
  });

  it.each([EstadoTurno.CANCELADO, EstadoTurno.COMPLETADO])('rechaza un turno %s', async estado => {
    prisma.turno.findUnique.mockResolvedValue({ ...original, estado });
    await expect(servicio.reprogramar(1, datos, usuario)).rejects.toThrow('pendientes o confirmados');
  });

  it('impide a otro paciente reprogramar y consultar el historial', async () => {
    const otro = { ...usuario, sub: 999 };
    await expect(servicio.reprogramar(1, datos, otro)).rejects.toThrow('No tenés permiso');
    await expect(servicio.historial(1, otro, { pagina: 1, limite: 10 })).rejects.toThrow('No tenés permiso');
    expect(prisma.reprogramacionTurno.findMany).not.toHaveBeenCalled();
  });

  it('rechaza un horario idéntico y fechas pasadas', async () => {
    await expect(servicio.reprogramar(1, { ...datos, fecha: '2099-09-11', horaInicio: '09:00' }, usuario))
      .rejects.toThrow('diferente');
    await expect(servicio.reprogramar(1, { ...datos, fecha: '2000-01-01' }, usuario)).rejects.toThrow('pasada');
  });
});
