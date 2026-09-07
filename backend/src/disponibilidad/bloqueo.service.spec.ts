import { BloqueoService } from './bloqueo.service';
import { PrismaService } from '../prisma/prisma.service';
jest.mock('../prisma/prisma.service', () => ({ PrismaService: class PrismaService {} }));

describe('Bloqueos por fecha', () => {
  const tx = {
    $queryRaw: jest.fn(),
    bloqueoDisponibilidad: { findUnique: jest.fn(), create: jest.fn(), deleteMany: jest.fn() },
    turno: { findMany: jest.fn() },
  };
  const prisma = { ...tx, $transaction: (callback: (cliente: typeof tx) => unknown) => callback(tx) };
  const servicio = new BloqueoService(prisma as unknown as PrismaService);
  const datos = { fecha: '2099-09-11', motivo: 'Vacaciones' };

  beforeEach(() => {
    jest.resetAllMocks();
    tx.$queryRaw.mockResolvedValue([{ id: 1 }]);
    tx.bloqueoDisponibilidad.findUnique.mockResolvedValue(null);
    tx.turno.findMany.mockResolvedValue([]);
    tx.bloqueoDisponibilidad.create.mockResolvedValue({ id: 1 });
  });

  it('crea un bloqueo sin modificar turnos existentes', async () => {
    expect(await servicio.crear(1, datos)).toEqual({ id: 1 });
    expect(tx.bloqueoDisponibilidad.create).toHaveBeenCalled();
  });

  it('rechaza un bloqueo si hay reservas activas e identifica los conflictos', async () => {
    tx.turno.findMany.mockResolvedValue([{ id: 4, horaInicio: '09:00' }]);
    await expect(servicio.crear(1, datos)).rejects.toThrow('#4 (09:00)');
    expect(tx.bloqueoDisponibilidad.create).not.toHaveBeenCalled();
  });

  it('rechaza fechas duplicadas y pasadas', async () => {
    tx.bloqueoDisponibilidad.findUnique.mockResolvedValue({ id: 2 });
    await expect(servicio.crear(1, datos)).rejects.toThrow('ya está bloqueada');
    await expect(servicio.crear(1, { ...datos, fecha: '2000-01-01' })).rejects.toThrow('desde hoy');
  });

  it('no permite quitar un bloqueo ajeno al profesional', async () => {
    tx.bloqueoDisponibilidad.deleteMany.mockResolvedValue({ count: 0 });
    await expect(servicio.eliminar(2, 1)).rejects.toThrow('Bloqueo no encontrado');
    expect(tx.bloqueoDisponibilidad.deleteMany).toHaveBeenCalledWith({ where: { id: 1, profesionalId: 2 } });
  });
});
