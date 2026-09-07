import { Module } from '@nestjs/common';
import { TurnoController } from './turno.controller';
import { TurnoService } from './turno.service';
import { AuthModule } from '../auth/auth.module';
import { HorarioDisponibleController } from './horario-disponible.controller';

@Module({
    imports: [AuthModule],
    controllers: [TurnoController, HorarioDisponibleController],
    providers: [TurnoService],
})
export class TurnoModule { }