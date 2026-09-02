import { Module } from '@nestjs/common';
import { ProfesionalController } from './profesional.controller';
import { ProfesionalService } from './profesional.service';

@Module({
    controllers: [ProfesionalController],
    providers: [ProfesionalService],
})
export class ProfesionalModule { }