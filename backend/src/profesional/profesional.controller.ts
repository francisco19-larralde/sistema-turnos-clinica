import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { ProfesionalService } from './profesional.service';
import { Query } from '@nestjs/common';
import { PaginacionDto } from '../comun/paginacion.dto';
import { CrearProfesionalDto } from "./dto/crear-profesional.dto";
import { ActualizarProfesionalDto } from "./dto/actualizar-profesional.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { AutenticacionGuard } from "../auth/guards/autenticacion.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Rol } from "../generated/prisma/enums";


@Controller('profesionales')
export class ProfesionalController {
    constructor(private readonly profesionalService: ProfesionalService) { }


    @UseGuards(AutenticacionGuard, RolesGuard)
    @Roles(Rol.ADMINISTRATIVO)
    @Post()
    crear(@Body() datos: CrearProfesionalDto) {
        return this.profesionalService.crear(datos);
    }

    @Get()
    buscarTodos() {
        return this.profesionalService.buscarTodos();
    }

    @Get('pagina')
    buscarPagina(@Query() consulta: PaginacionDto) {
        return this.profesionalService.buscarPagina(consulta);
    }

    @Get(':id')
    buscarPorId(@Param('id', ParseIntPipe) id: number) {
        return this.profesionalService.buscarPorId(id);
    }

    @UseGuards(AutenticacionGuard, RolesGuard)
    @Roles(Rol.ADMINISTRATIVO)
    @Patch(':id')
    actualizar(@Param('id', ParseIntPipe) id: number, @Body() datos: ActualizarProfesionalDto) {
        return this.profesionalService.actualizar(id, datos);
    }

    @UseGuards(AutenticacionGuard, RolesGuard)
    @Roles(Rol.ADMINISTRATIVO)
    @Delete(':id')
    eliminar(@Param('id', ParseIntPipe) id: number) {
        return this.profesionalService.eliminar(id);
    }




}
