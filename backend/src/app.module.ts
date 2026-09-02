import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { EspecialidadModule } from './especialidad/especialidad.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    EspecialidadModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }