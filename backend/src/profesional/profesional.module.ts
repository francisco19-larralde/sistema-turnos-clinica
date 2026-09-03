import { Module } from '@nestjs/common';
import { ProfesionalController } from './profesional.controller';
import { ProfesionalService } from './profesional.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [AuthModule],
    controllers: [ProfesionalController],
    providers: [ProfesionalService],
})
export class ProfesionalModule { }