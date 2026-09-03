import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AutenticacionGuard } from './autenticacion.guard';
import type { StringValue } from 'ms';

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
    providers: [AuthService, AutenticacionGuard],
    exports: [AutenticacionGuard, JwtModule],
})
export class AuthModule { }