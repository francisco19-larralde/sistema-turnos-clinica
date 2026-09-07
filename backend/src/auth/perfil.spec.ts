import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { compararContrasena, hashearContrasena } from './hash.util';
jest.mock('../prisma/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('./hash.util', () => ({ compararContrasena: jest.fn(), hashearContrasena: jest.fn() }));

describe('Edición de perfil', () => {
  function preparar(rol = 'PACIENTE') {
    const tx = {
      $queryRaw: jest.fn(), usuario: { findUnique: jest.fn().mockResolvedValue({ id: 7, rol, contrasenaHash: 'hash' }), update: jest.fn().mockResolvedValue({ id: 7 }) },
      paciente: { update: jest.fn() }, profesional: { update: jest.fn() }, especialidad: { findUnique: jest.fn().mockResolvedValue({ id: 2 }) },
    };
    const servicio = new AuthService({ $transaction: (callback: any) => callback(tx) } as any, {} as any);
    return { tx, servicio };
  }
  beforeEach(() => jest.clearAllMocks());
  it('actualiza la cuenta y los datos del paciente sin devolver la contraseña', async () => {
    const { tx, servicio } = preparar();
    await servicio.actualizarPerfil(7, { nombre: ' Ana ', dni: '123', fechaNacimiento: '2000-09-18', telefono: '' });
    expect(tx.paciente.update).toHaveBeenCalledWith(expect.objectContaining({ where: { usuarioId: 7 }, data: expect.objectContaining({ fechaNacimiento: new Date('2000-09-18T00:00:00Z'), telefono: '' }) }));
    expect(tx.usuario.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 7 }, data: expect.objectContaining({ nombre: 'Ana' }) }));
    expect(tx.usuario.update.mock.calls[0][0].select.contrasenaHash).toBeUndefined();
  });
  it('actualiza los campos profesionales con la identidad de la sesión', async () => {
    const { tx, servicio } = preparar('PROFESIONAL');
    await servicio.actualizarPerfil(7, { matricula: 'MAT-1', especialidadId: 2 });
    expect(tx.profesional.update).toHaveBeenCalledWith(expect.objectContaining({ where: { usuarioId: 7 }, data: expect.objectContaining({ matricula: 'MAT-1', especialidadId: 2 }) }));
    expect(tx.paciente.update).not.toHaveBeenCalled();
  });
  it('no modifica nada si la contraseña actual es incorrecta', async () => {
    const { tx, servicio } = preparar();
    (compararContrasena as jest.Mock).mockResolvedValue(false);
    await expect(servicio.actualizarPerfil(7, { contrasenaActual: 'incorrecta', nuevaContrasena: 'nueva1234' })).rejects.toThrow('actual');
    expect(tx.usuario.update).not.toHaveBeenCalled();
    expect(tx.paciente.update).not.toHaveBeenCalled();
  });
  it('guarda el hash al cambiar la contraseña de un administrativo', async () => {
    const { tx, servicio } = preparar('ADMINISTRATIVO');
    (compararContrasena as jest.Mock).mockResolvedValue(true);
    (hashearContrasena as jest.Mock).mockResolvedValue('nuevo-hash');
    await servicio.actualizarPerfil(7, { contrasenaActual: 'actual123', nuevaContrasena: 'nueva1234' });
    expect(tx.usuario.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ contrasenaHash: 'nuevo-hash' }) }));
  });
  it('rechaza intentos de cambiar rol o id y fechas inválidas', async () => {
    const pipe = new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true });
    for (const datos of [{ rol: 'ADMINISTRATIVO' }, { id: 8 }, { fechaNacimiento: '2000-02-31' }]) {
      await expect(pipe.transform(datos, { type: 'body', metatype: ActualizarPerfilDto })).rejects.toThrow();
    }
  });
});
