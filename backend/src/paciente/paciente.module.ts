import { Module } from '@nestjs/common';
import { PacienteController } from './paciente.controller';
import { PacienteService } from './paciente.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [AuthModule],
    controllers: [PacienteController],
    providers: [PacienteService],
})
export class PacienteModule { }
