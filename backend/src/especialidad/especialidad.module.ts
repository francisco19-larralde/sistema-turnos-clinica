import { Module } from '@nestjs/common';
import { EspecialidadController } from './especialidad.controller';
import { EspecialidadService } from './especialidad.service';

@Module({
    controllers: [EspecialidadController],
    providers: [EspecialidadService],
})
export class EspecialidadModule { }