import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { ProfesionalService } from "./profesional.service";
import { CrearProfesionalDto } from "./dto/crear-profesional.dto";
import { ActualizarProfesionalDto } from "./dto/actualizar-profesional.dto";


@Controller('profesionales')
export class ProfesionalController {
    constructor(private readonly profesionalService: ProfesionalService) { }


    @Post()
    crear(@Body() datos: CrearProfesionalDto) {
        return this.profesionalService.crear(datos);
    }

    @Get()
    buscarTodos() {
        return this.profesionalService.buscarTodos();
    }

    @Get(':id')
    buscarPorId(@Param('id', ParseIntPipe) id: number) {
        return this.profesionalService.buscarPorId(id);
    }

    @Patch(':id')
    actualizar(@Param('id', ParseIntPipe) id: number, @Body() datos: ActualizarProfesionalDto) {
        return this.profesionalService.actualizar(id, datos);
    }

    @Delete(':id')
    eliminar(@Param('id', ParseIntPipe) id: number) {
        return this.profesionalService.eliminar(id);
    }




}