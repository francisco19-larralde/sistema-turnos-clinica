import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { TurnoService } from './turno.service';
import { AutenticacionGuard } from '../auth/guards/autenticacion.guard';

@Controller()
export class HorarioDisponibleController {
    constructor(private readonly turnoService: TurnoService) { }

    @UseGuards(AutenticacionGuard)
    @Get('profesionales/:profesionalId/horarios-disponibles')
    obtenerHorariosDisponibles(
        @Param('profesionalId', ParseIntPipe) profesionalId: number,
        @Query('fecha') fecha: string,
    ) {
        return this.turnoService.obtenerHorariosDisponibles(profesionalId, fecha);
    }
}