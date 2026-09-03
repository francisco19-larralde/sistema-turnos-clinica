import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { DisponibilidadService } from "./disponibilidad.service";
import { Rol } from "../generated/prisma/enums";
import { Roles } from "../auth/decorators/roles.decorator";
import { AutenticacionGuard } from "../auth/guards/autenticacion.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CrearDisponibilidadDto } from "./dto/crear-disponibilidad.dto";


@Controller('disponibilidad')
export class DisponibilidadController {
    constructor(private readonly disponibilidadService: DisponibilidadService) { }

    @UseGuards(AutenticacionGuard, RolesGuard)
    @Roles(Rol.ADMINISTRATIVO)
    @Post('profesional/:profesionalId/disponibilidades')
    crear(@Param('profesionalId', ParseIntPipe) profesionalId: number, @Body() datos: CrearDisponibilidadDto) {

        return this.disponibilidadService.crear(profesionalId, datos);

    }


    @Get('profesional/:profesionalId/disponibilidades')
    listarPorProfesional(@Param('profesionalId', ParseIntPipe) profesionalId: number) {
        return this.disponibilidadService.listarPorProfesional(profesionalId);
    }

    @UseGuards(AutenticacionGuard, RolesGuard)
    @Roles(Rol.ADMINISTRATIVO)
    @Delete('disponibilidades/:id')
    eliminar(@Param('id', ParseIntPipe) id: number) {
        return this.disponibilidadService.eliminar(id);
    }


}