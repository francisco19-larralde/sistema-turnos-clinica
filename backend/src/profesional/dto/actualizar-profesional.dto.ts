import { PartialType } from '@nestjs/mapped-types';
import { CrearProfesionalDto } from './crear-profesional.dto';

export class ActualizarProfesionalDto extends PartialType(CrearProfesionalDto) { }