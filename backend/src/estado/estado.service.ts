import { Injectable } from '@nestjs/common';

@Injectable()
export class EstadoService {

    obtenerEstado() {
        return {
            estado: 'prueba correcta',
            fecha: new Date().toISOString(),
        };
    }
}