import { Controller, Get, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { PacienteService } from './paciente.service';
import { ActualizarPacienteDto } from './dto/actualizar-paciente.dto';

@Controller('pacientes')
export class PacienteController {
    constructor(private readonly pacienteService: PacienteService) { }

    @Get()
    buscarTodos() {
        return this.pacienteService.buscarTodos();
    }

    @Get(':id')
    buscarPorId(@Param('id', ParseIntPipe) id: number) {
        return this.pacienteService.buscarPorId(id);
    }

    @Patch(':id')
    actualizar(
        @Param('id', ParseIntPipe) id: number,
        @Body() datos: ActualizarPacienteDto,
    ) {
        return this.pacienteService.actualizar(id, datos);
    }

    @Delete(':id')
    eliminar(@Param('id', ParseIntPipe) id: number) {
        return this.pacienteService.eliminar(id);
    }
}