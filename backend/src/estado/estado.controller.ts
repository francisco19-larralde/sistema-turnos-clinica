import { Controller, Get } from '@nestjs/common';
import { EstadoService } from './estado.service';

@Controller('estado')
export class EstadoController {

    constructor(private readonly estadoServicio: EstadoService) { }

    @Get()
    obtenerEstado() {
        return this.estadoServicio.obtenerEstado();
    }
}