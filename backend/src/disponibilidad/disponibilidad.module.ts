import { Module } from '@nestjs/common';
import { DisponibilidadController } from './disponibilidad.controller';
import { DisponibilidadService } from './disponibilidad.service';
import { AuthModule } from '../auth/auth.module';
import { BloqueoController } from './bloqueo.controller';
import { BloqueoService } from './bloqueo.service';

@Module({
    imports: [AuthModule],
    controllers: [DisponibilidadController, BloqueoController],
    providers: [DisponibilidadService, BloqueoService],
})
export class DisponibilidadModule { }
