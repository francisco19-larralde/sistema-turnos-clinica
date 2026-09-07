import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { PrismaService } from "../prisma/prisma.service";
import { RegistrarPacienteDto } from "./dto/registrar-paciente.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtService } from "@nestjs/jwt";
import { compararContrasena, hashearContrasena } from "./hash.util";
import { Rol } from "../generated/prisma/enums";


@Injectable()
export class AuthService {
    private readonly seleccionPerfil = {
        id: true, nombre: true, apellido: true, email: true, rol: true,
        paciente: { select: { id: true, dni: true, fechaNacimiento: true, telefono: true } },
        profesional: { select: { id: true, matricula: true, telefono: true, especialidadId: true,
            especialidad: { select: { id: true, nombre: true } } } },
    } as const;

    async perfil(id: number) {
        const usuario = await this.prisma.usuario.findUnique({ where: { id }, select: this.seleccionPerfil });
        if (!usuario) throw new NotFoundException('Usuario no encontrado.');
        return usuario;
    }

    async actualizarPerfil(id: number, datos: ActualizarPerfilDto) {
        return this.prisma.$transaction(async tx => {
            await tx.$queryRaw`SELECT id FROM "Usuario" WHERE id = ${id} FOR UPDATE`;
            const usuario = await tx.usuario.findUnique({ where: { id } });
            if (!usuario) throw new NotFoundException('Usuario no encontrado.');
            let contrasenaHash: string | undefined;
            if (datos.nuevaContrasena) {
                if (!datos.contrasenaActual || !await compararContrasena(datos.contrasenaActual, usuario.contrasenaHash)) {
                    throw new BadRequestException('La contraseña actual no es correcta.');
                }
                contrasenaHash = await hashearContrasena(datos.nuevaContrasena);
            }
            if (datos.fechaNacimiento && new Date(datos.fechaNacimiento + 'T00:00:00Z') > new Date()) {
                throw new BadRequestException('La fecha de nacimiento no puede ser futura.');
            }
            if (usuario.rol === Rol.PACIENTE) {
                await tx.paciente.update({
                    where: { usuarioId: id },
                    data: {
                        dni: datos.dni?.trim(),
                        fechaNacimiento: datos.fechaNacimiento ? new Date(datos.fechaNacimiento + 'T00:00:00Z') : undefined,
                        telefono: datos.telefono?.trim(),
                    },
                });
            } else if (usuario.rol === Rol.PROFESIONAL) {
                if (datos.especialidadId && !await tx.especialidad.findUnique({ where: { id: datos.especialidadId } })) {
                    throw new BadRequestException('La especialidad seleccionada no existe.');
                }
                await tx.profesional.update({
                    where: { usuarioId: id },
                    data: { matricula: datos.matricula?.trim(), telefono: datos.telefono?.trim(), especialidadId: datos.especialidadId },
                });
            }
            return tx.usuario.update({
                where: { id },
                data: { nombre: datos.nombre?.trim(), apellido: datos.apellido?.trim(), email: datos.email, contrasenaHash },
                select: this.seleccionPerfil,
            });
        });
    }
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }


    async registrarPaciente(datos: RegistrarPacienteDto) {
        const emailExistente = await this.prisma.usuario.findUnique({
            where: { email: datos.email },
        });

        if (emailExistente) {
            throw new ConflictException('El email ya está registrado');
        }

        const dniExistente = await this.prisma.paciente.findUnique({
            where: { dni: datos.dni },
        });

        if (dniExistente) {
            throw new ConflictException('El DNI ya está registrado');
        }

        const contrasenaHash = await hashearContrasena(datos.contrasena);

        return this.prisma.$transaction(async (tx) => {
            const usuario = await tx.usuario.create({
                data: {
                    nombre: datos.nombre,
                    apellido: datos.apellido,
                    email: datos.email,
                    contrasenaHash,
                    rol: Rol.PACIENTE,
                },
            });

            return tx.paciente.create({
                data: {
                    dni: datos.dni,
                    fechaNacimiento: new Date(datos.fechaNacimiento),
                    telefono: datos.telefono,
                    usuarioId: usuario.id,
                },
                include: {
                    usuario: {
                        select: { id: true, nombre: true, apellido: true, email: true, rol: true },
                    },
                },
            });
        });
    }


    async login(datos: LoginDto) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { email: datos.email },
        });

        if (!usuario) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const contrasenaValida = await compararContrasena(datos.contrasena, usuario.contrasenaHash);

        if (!contrasenaValida) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const payload = { sub: usuario.id, email: usuario.email, rol: usuario.rol };
        const accessToken = await this.jwtService.signAsync(payload);

        return {
            accessToken,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                rol: usuario.rol
            },
        };
    }
}
