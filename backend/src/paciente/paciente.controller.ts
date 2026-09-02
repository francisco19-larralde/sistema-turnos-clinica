import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from "@nestjs/common";
import { PacienteService } from "./paciente.service";
import { CrearPacienteDto } from "./dto/crear-paciente.dto";
import { ActualizarPacienteDto } from "./dto/actualizar-paciente.dto";



@Controller('paciente')
export class PacienteController {

    constructor(private readonly pacienteService: PacienteService) { }


    @Post()
    crear(@Body() datos: CrearPacienteDto) {
        return this.pacienteService.crear(datos);
    }

    @Get()
    buscarTodos() {
        return this.pacienteService.buscarTodos();
    }

    @Get(':id')
    buscarPorId(@Param('id', ParseIntPipe) id: number) {
        return this.pacienteService.buscarPorId(id);
    }

    @Patch(':id')
    actualizar(@Param('id', ParseIntPipe) id: number, @Body() datos: ActualizarPacienteDto) {
        return this.pacienteService.actualizar(id, datos);
    }

    @Delete(':id')
    eliminar(@Param('id', ParseIntPipe) id: number) {
        return this.pacienteService.eliminar(id);
    }


}