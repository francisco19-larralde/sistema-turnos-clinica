import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { hashearContrasena } from '../src/auth/hash.util';
import { Rol, DiaSemana } from '../src/generated/prisma/client';
import { ExcepcionGlobalFilter } from '../src/comun/filters/excepcion-global.filter';

describe('Turnos (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let tokenPaciente: string;
    let profesionalId: number;

    // Un martes futuro fijo -- mismo criterio que en el test unitario.
    const FECHA_MARTES_FUTURO = '2027-03-02';

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
        app.useGlobalFilters(new ExcepcionGlobalFilter());
        await app.init();

        prisma = app.get(PrismaService);

        // --- Armado del escenario, directo contra la base (no vía API) ---

        const especialidad = await prisma.especialidad.create({
            data: { nombre: 'Clínica Médica (e2e)' },
        });

        const usuarioProfesional = await prisma.usuario.create({
            data: {
                nombre: 'Ana',
                apellido: 'Gómez',
                email: 'ana.e2e@test.com',
                contrasenaHash: await hashearContrasena('ana12345'),
                rol: Rol.PROFESIONAL,
            },
        });

        const profesional = await prisma.profesional.create({
            data: {
                matricula: 'MP-E2E-001',
                especialidadId: especialidad.id,
                usuarioId: usuarioProfesional.id,
            },
        });
        profesionalId = profesional.id;

        await prisma.disponibilidad.create({
            data: {
                profesionalId: profesional.id,
                diaSemana: DiaSemana.MARTES,
                horaInicio: '09:00',
                horaFin: '13:00',
            },
        });

        // Registramos un paciente vía la API real (así probamos ese flujo también)
        await request(app.getHttpServer()).post('/auth/registro').send({
            nombre: 'Laura',
            apellido: 'Díaz',
            email: 'laura.turnos.e2e@test.com',
            contrasena: 'laura1234',
            dni: '30333444',
            fechaNacimiento: '1990-05-20',
        });

        const login = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'laura.turnos.e2e@test.com', contrasena: 'laura1234' });

        tokenPaciente = login.body.accessToken;
    });

    afterEach(async () => {
        await prisma.turno.deleteMany();
    });

    afterAll(async () => {
        await prisma.disponibilidad.deleteMany();
        await prisma.profesional.deleteMany();
        await prisma.paciente.deleteMany();
        await prisma.usuario.deleteMany();
        await prisma.especialidad.deleteMany();
        await app.close();
    });

    it('debería crear un turno dentro de la disponibilidad', async () => {
        const respuesta = await request(app.getHttpServer())
            .post('/turnos')
            .set('Authorization', `Bearer ${tokenPaciente}`)
            .send({ profesionalId, fecha: FECHA_MARTES_FUTURO, horaInicio: '10:00' })
            .expect(201);

        expect(respuesta.body.estado).toBe('PENDIENTE');
    });

    it('debería rechazar un turno superpuesto', async () => {
        await request(app.getHttpServer())
            .post('/turnos')
            .set('Authorization', `Bearer ${tokenPaciente}`)
            .send({ profesionalId, fecha: FECHA_MARTES_FUTURO, horaInicio: '10:00' })
            .expect(201);

        await request(app.getHttpServer())
            .post('/turnos')
            .set('Authorization', `Bearer ${tokenPaciente}`)
            .send({ profesionalId, fecha: FECHA_MARTES_FUTURO, horaInicio: '10:15' })
            .expect(400);
    });

    it('debería rechazar la creación de turnos sin autenticación', async () => {
        await request(app.getHttpServer())
            .post('/turnos')
            .send({ profesionalId, fecha: FECHA_MARTES_FUTURO, horaInicio: '11:00' })
            .expect(401);
    });
});