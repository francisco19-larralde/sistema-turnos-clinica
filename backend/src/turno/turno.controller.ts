import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { TurnoService } from './turno.service';
import { Query } from '@nestjs/common';
import { PaginacionDto } from '../comun/paginacion.dto';
import { CrearTurnoDto } from './dto/crear-turno.dto';
import { ReprogramarTurnoDto } from './dto/reprogramar-turno.dto';
import { AutenticacionGuard } from '../auth/guards/autenticacion.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '../generated/prisma/client';

@Controller('turnos')
@UseGuards(AutenticacionGuard)
export class TurnoController {
    constructor(private readonly turnoService: TurnoService) { }

    @UseGuards(RolesGuard)
    @Roles(Rol.PACIENTE, Rol.ADMINISTRATIVO)
    @Post()
    crear(@Body() datos: CrearTurnoDto, @Req() request: Request) {
        return this.turnoService.crear(datos, (request as any).usuario);
    }

    @Get()
    buscarTodos(@Req() request: Request) {
        return this.turnoService.buscarTodos((request as any).usuario);
    }

    @Get('pagina')
    buscarPagina(@Req() request: Request, @Query() consulta: PaginacionDto) {
        return this.turnoService.buscarPagina((request as any).usuario, consulta);
    }

    @Get(':id')
    buscarPorId(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
        return this.turnoService.buscarPorId(id, (request as any).usuario);
    }

    @Patch(':id/cancelar')
    cancelar(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
        return this.turnoService.cancelar(id, (request as any).usuario);
    }

    @Patch(':id/reprogramar')
    reprogramar(@Param('id', ParseIntPipe) id: number, @Body() datos: ReprogramarTurnoDto, @Req() request: Request) {
        return this.turnoService.reprogramar(id, datos, (request as any).usuario);
    }

    @Get(':id/historial')
    historial(@Param('id', ParseIntPipe) id: number, @Query() consulta: PaginacionDto, @Req() request: Request) {
        return this.turnoService.historial(id, (request as any).usuario, consulta);
    }

    @UseGuards(RolesGuard)
    @Roles(Rol.PROFESIONAL, Rol.ADMINISTRATIVO)
    @Patch(':id/confirmar')
    confirmar(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
        return this.turnoService.confirmar(id, (request as any).usuario);
    }

    @UseGuards(RolesGuard)
    @Roles(Rol.PROFESIONAL, Rol.ADMINISTRATIVO)
    @Patch(':id/completar')
    completar(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
        return this.turnoService.completar(id, (request as any).usuario);
    }
}
