import { Test } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { TurnoService } from './turno.service';
import { PrismaService } from '../prisma/prisma.service';
import { DiaSemana, EstadoTurno, Rol } from '../generated/prisma/enums';
jest.mock('../prisma/prisma.service', () => ({ PrismaService: class PrismaService {} }));

describe('TurnoService', () => {
    let service: TurnoService;

    const prismaMock = {
        $transaction: jest.fn(),
        $queryRaw: jest.fn(),
        bloqueoDisponibilidad: { findUnique: jest.fn() },
        turno: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
        disponibilidad: { findMany: jest.fn() },
        paciente: { findUnique: jest.fn() },
        profesional: { findUnique: jest.fn() },
    };

    const usuarioPaciente = { sub: 10, email: 'paciente@test.com', rol: Rol.PACIENTE };

    beforeEach(async () => {
        jest.clearAllMocks();
        prismaMock.$transaction.mockImplementation(callback => callback(prismaMock));
        prismaMock.$queryRaw.mockResolvedValue([{ id: 1 }]);
        prismaMock.bloqueoDisponibilidad.findUnique.mockResolvedValue(null);

        const moduleRef = await Test.createTestingModule({
            providers: [TurnoService, { provide: PrismaService, useValue: prismaMock }],
        }).compile();

        service = moduleRef.get(TurnoService);
    });

    describe('crear', () => {
        // Un martes futuro fijo, para que el test no dependa de la fecha en que se ejecute
        const FECHA_MARTES_FUTURO = '2027-03-02'; // asegurate de que caiga martes al momento de leer esto

        beforeEach(() => {
            prismaMock.paciente.findUnique.mockResolvedValue({ id: 5, usuarioId: 10 });
            prismaMock.profesional.findUnique.mockResolvedValue({ id: 1 });
            prismaMock.disponibilidad.findMany.mockResolvedValue([
                { diaSemana: DiaSemana.MARTES, horaInicio: '09:00', horaFin: '13:00' },
            ]);
            prismaMock.turno.findMany.mockResolvedValue([]); // sin turnos previos ese día
        });

        it('debería crear el turno si está dentro de disponibilidad y sin superposición', async () => {
            prismaMock.turno.create.mockResolvedValue({ id: 1, estado: EstadoTurno.PENDIENTE });

            const datos = { profesionalId: 1, fecha: FECHA_MARTES_FUTURO, horaInicio: '10:00' };
            const resultado = await service.crear(datos as any, usuarioPaciente);

            expect(prismaMock.turno.create).toHaveBeenCalled();
            expect(resultado).toEqual({ id: 1, estado: EstadoTurno.PENDIENTE });
        });

        it('debería rechazar un turno fuera del rango de disponibilidad', async () => {
            const datos = { profesionalId: 1, fecha: FECHA_MARTES_FUTURO, horaInicio: '20:00' };

            await expect(service.crear(datos as any, usuarioPaciente)).rejects.toThrow(
                BadRequestException,
            );
            expect(prismaMock.turno.create).not.toHaveBeenCalled();
        });

        it('rechaza reservas en una fecha bloqueada', async () => {
            prismaMock.bloqueoDisponibilidad.findUnique.mockResolvedValue({ id: 1 });
            await expect(service.crear({
                profesionalId: 1, fecha: FECHA_MARTES_FUTURO, horaInicio: '10:00',
            }, usuarioPaciente)).rejects.toThrow('El profesional no atiende');
            expect(prismaMock.turno.create).not.toHaveBeenCalled();
        });

        it('no ofrece horarios en una fecha bloqueada', async () => {
            prismaMock.bloqueoDisponibilidad.findUnique.mockResolvedValue({ id: 1 });
            expect(await service.obtenerHorariosDisponibles(1, FECHA_MARTES_FUTURO)).toEqual([]);
        });

        it('debería rechazar un turno que se superpone con uno existente', async () => {
            prismaMock.turno.findMany.mockResolvedValue([
                { horaInicio: '10:00', horaFin: '10:30' },
            ]);

            const datos = { profesionalId: 1, fecha: FECHA_MARTES_FUTURO, horaInicio: '10:15' };

            await expect(service.crear(datos as any, usuarioPaciente)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('debería rechazar una fecha/hora en el pasado', async () => {
            const datos = { profesionalId: 1, fecha: '2020-01-01', horaInicio: '10:00' };

            await expect(service.crear(datos as any, usuarioPaciente)).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('buscarPorId', () => {
        it('debería denegar el acceso a un paciente que no es dueño del turno', async () => {
            prismaMock.turno.findUnique.mockResolvedValue({
                id: 1,
                paciente: { usuarioId: 999 }, // otro usuario, no el 10 de usuarioPaciente
                profesional: { usuarioId: 1 },
            });

            await expect(service.buscarPorId(1, usuarioPaciente)).rejects.toThrow(
                ForbiddenException,
            );
        });

        it('debería permitir el acceso al paciente dueño del turno', async () => {
            const turno = {
                id: 1,
                paciente: { usuarioId: 10 }, // coincide con usuarioPaciente.sub
                profesional: { usuarioId: 1 },
            };
            prismaMock.turno.findUnique.mockResolvedValue(turno);

            const resultado = await service.buscarPorId(1, usuarioPaciente);

            expect(resultado).toEqual(turno);
        });
    });
});
