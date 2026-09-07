import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { AutenticacionGuard } from '../auth/guards/autenticacion.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '../generated/prisma/enums';
import { BloqueoService } from './bloqueo.service';
import { CrearBloqueoDto } from './dto/crear-bloqueo.dto';

@Controller('disponibilidad/profesional/:profesionalId/bloqueos')
@UseGuards(AutenticacionGuard, RolesGuard)
@Roles(Rol.ADMINISTRATIVO)
export class BloqueoController {
  constructor(private readonly servicio: BloqueoService) {}

  @Get()
  listar(@Param('profesionalId', ParseIntPipe) id: number) { return this.servicio.listar(id); }

  @Post()
  crear(@Param('profesionalId', ParseIntPipe) id: number, @Body() datos: CrearBloqueoDto) {
    return this.servicio.crear(id, datos);
  }

  @Delete(':id')
  eliminar(@Param('profesionalId', ParseIntPipe) profesionalId: number, @Param('id', ParseIntPipe) id: number) {
    return this.servicio.eliminar(profesionalId, id);
  }
}
