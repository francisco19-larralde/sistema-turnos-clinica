import { PartialType } from '@nestjs/mapped-types';
import { CrearEspecialidadDto } from './crear-especialidad.dto';

export class ActualizarEspecialidadDto extends PartialType(CrearEspecialidadDto) { }