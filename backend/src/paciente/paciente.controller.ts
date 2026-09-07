import { Controller, Get, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { PacienteService } from './paciente.service';
import { Query } from '@nestjs/common';
import { PaginacionDto } from '../comun/paginacion.dto';
import { ActualizarPacienteDto } from './dto/actualizar-paciente.dto';
import { UseGuards } from '@nestjs/common';
import { AutenticacionGuard } from '../auth/guards/autenticacion.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '../generated/prisma/enums';

@Controller('pacientes')
@UseGuards(AutenticacionGuard, RolesGuard)
@Roles(Rol.ADMINISTRATIVO)
export class PacienteController {
    constructor(private readonly pacienteService: PacienteService) { }

    @Get()
    buscarTodos() {
        return this.pacienteService.buscarTodos();
    }

    @Get('pagina')
    buscarPagina(@Query() consulta: PaginacionDto) {
        return this.pacienteService.buscarPagina(consulta);
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
