import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import type { StringValue } from 'ms';
import { AuthService } from './auth.service';
import { AutenticacionGuard } from './guards/autenticacion.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: config.get<string>('JWT_EXPIRES_IN', '1d') as StringValue,
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, AutenticacionGuard, RolesGuard],
    exports: [AutenticacionGuard, RolesGuard, JwtModule],
})
export class AuthModule { }