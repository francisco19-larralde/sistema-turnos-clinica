import { Module } from '@nestjs/common';
import { EstadoController } from './estado/estado.controller';
import { EstadoService } from './estado/estado.service';


@Module({
  imports: [],
  controllers: [EstadoController],
  providers: [EstadoService],
})
export class AppModule { }
