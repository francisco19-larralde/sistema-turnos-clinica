import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ExcepcionGlobalFilter } from '../src/comun/filters/excepcion-global.filter';


describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    app.useGlobalFilters(new ExcepcionGlobalFilter());

    await app.init();

    prisma = app.get(PrismaService);
  });

  afterEach(async () => {
    // Limpiamos entre tests para que no se pisen datos (ej: emails duplicados)
    await prisma.paciente.deleteMany();
    await prisma.usuario.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/registro', () => {
    it('debería registrar un paciente nuevo', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/auth/registro')
        .send({
          nombre: 'Laura',
          apellido: 'Díaz',
          email: 'laura.e2e@test.com',
          contrasena: 'laura1234',
          dni: '30111222',
          fechaNacimiento: '1990-05-20',
        })
        .expect(201);

      expect(respuesta.body.dni).toBe('30111222');
      expect(respuesta.body.usuario.email).toBe('laura.e2e@test.com');
      expect(respuesta.body.usuario.contrasenaHash).toBeUndefined(); // nunca debe viajar
    });

    it('debería rechazar un registro con email duplicado', async () => {
      const datos = {
        nombre: 'Laura',
        apellido: 'Díaz',
        email: 'duplicado@test.com',
        contrasena: 'laura1234',
        dni: '30111222',
        fechaNacimiento: '1990-05-20',
      };

      await request(app.getHttpServer()).post('/auth/registro').send(datos).expect(201);

      await request(app.getHttpServer())
        .post('/auth/registro')
        .send({ ...datos, dni: '30999888' }) // distinto DNI, mismo email
        .expect(409); // lo resuelve nuestro ExcepcionGlobalFilter
    });
  });

  describe('POST /auth/login', () => {
    it('debería devolver un token con credenciales válidas', async () => {
      await request(app.getHttpServer()).post('/auth/registro').send({
        nombre: 'Carlos',
        apellido: 'Ruiz',
        email: 'carlos.e2e@test.com',
        contrasena: 'carlos1234',
        dni: '30222333',
        fechaNacimiento: '1985-01-01',
      });

      const respuesta = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'carlos.e2e@test.com', contrasena: 'carlos1234' })
        .expect(200);

      expect(respuesta.body.accessToken).toBeDefined();
    });

    it('debería rechazar credenciales incorrectas', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'no-existe@test.com', contrasena: 'loquesea1' })
        .expect(401);
    });
  });

  describe('GET /auth/perfil', () => {
    it('debería rechazar el acceso sin token', async () => {
      await request(app.getHttpServer()).get('/auth/perfil').expect(401);
    });
  });
});