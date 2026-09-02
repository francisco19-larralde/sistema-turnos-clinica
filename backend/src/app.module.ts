import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { EspecialidadModule } from './especialidad/especialidad.module';
import { ProfesionalModule } from './profesional/profesional.module';
import { PacienteModule } from './paciente/paciente.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    EspecialidadModule,
    ProfesionalModule,
    PacienteModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }