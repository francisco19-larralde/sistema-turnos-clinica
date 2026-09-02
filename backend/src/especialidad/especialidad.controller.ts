import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { EspecialidadService } from "./especialidad.service";
import { CrearEspecialidadDto } from "./dto/crear-especialidad.dto";
import { ActualizarEspecialidadDto } from "./dto/actualizar-especialidad.dto";

@Controller('especialidades')
export class EspecialidadController {
    constructor(private readonly especialidadService: EspecialidadService) { }


    @Post()
    crear(@Body() datos: CrearEspecialidadDto) {
        return this.especialidadService.crear(datos);
    }

    @Get()
    buscarTodas() {
        return this.especialidadService.buscarTodas();
    }

    @Get(':id')
    buscarPorId(@Param('id', ParseIntPipe) id: number) {
        return this.especialidadService.buscarPorId(id);
    }

    @Patch(':id')
    actualizar(@Param('id', ParseIntPipe) id: number, @Body() datos: ActualizarEspecialidadDto,) {
        return this.especialidadService.actualizar(id, datos);
    }

    @Delete(':id')
    eliminar(@Param('id', ParseIntPipe) id: number) {
        return this.especialidadService.eliminar(id);
    }


}