import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Rol } from '../../generated/prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const rolesRequeridos = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!rolesRequeridos || rolesRequeridos.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const usuario = request.usuario;

        if (!usuario || !rolesRequeridos.includes(usuario.rol)) {
            throw new ForbiddenException(
                'No tenés permisos suficientes para realizar esta acción',
            );
        }

        return true;
    }
}