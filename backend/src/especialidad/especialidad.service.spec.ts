import { Test } from "@nestjs/testing";
import { PrismaService } from "../prisma/prisma.service";
import { EspecialidadService } from "./especialidad.service";
import { NotFoundException } from "@nestjs/common";

describe('EspecialidadService', () => {
    let service: EspecialidadService;

    const prismaMock = {
        especialidad: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const moduleRef = await Test.createTestingModule({
            providers: [
                EspecialidadService,
                { provide: PrismaService, useValue: prismaMock },
            ],
        }).compile();

        service = moduleRef.get(EspecialidadService);
    });


    describe('crear', () => {
        it('deberia crear una especialidad y devolverla', async () => {
            const datos = { nombre: 'Cardiologia' };
            const especialidadCreada = { id: 1, ...datos, descripcion: null, creadoEn: new Date() };
            prismaMock.especialidad.create.mockResolvedValue(especialidadCreada);

            const resultado = await service.crear(datos);

            expect(prismaMock.especialidad.create).toHaveBeenCalledWith({ data: datos });
            expect(resultado).toEqual(especialidadCreada);
        });
    });

    describe('buscarPorId', () => {
        it('deberia devolver la especialidad si existe', async () => {
            const especialidad = { id: 1, nombre: 'Pediatria', descripcion: null, creadoEn: new Date() };
            prismaMock.especialidad.findUnique.mockResolvedValue(especialidad);

            const resultado = await service.buscarPorId(1);

            expect(resultado).toEqual(especialidad);
        });

        it('deberia lanzar NotFoundException si no existe', async () => {
            prismaMock.especialidad.findUnique.mockResolvedValue(null);

            await expect(service.buscarPorId(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('actualizar', () => {
        it('debería validar que exista antes de actualizar', async () => {
            prismaMock.especialidad.findUnique.mockResolvedValue(null);

            await expect(
                service.actualizar(999, { nombre: 'Nuevo nombre' }),
            ).rejects.toThrow(NotFoundException);


            expect(prismaMock.especialidad.update).not.toHaveBeenCalled();
        });
    });

});