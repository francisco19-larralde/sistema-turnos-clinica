import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RegistrarPacienteDto } from "./dto/registrar-paciente.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtService } from "@nestjs/jwt";
import { compararContrasena, hashearContrasena } from "./hash.util";
import { Rol } from "../generated/prisma/enums";


@Injectable()
export class AuthService {
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