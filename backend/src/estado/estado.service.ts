import { Injectable } from '@nestjs/common';

@Injectable()
export class EstadoService {

    obtenerEstado() {
        return {
            estado: 'ok',
            fecha: new Date().toISOString(),
        };
    }
}