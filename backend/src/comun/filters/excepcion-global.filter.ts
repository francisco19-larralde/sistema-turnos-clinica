import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '../../generated/prisma/client';

interface RespuestaError {
    statusCode: number;
    mensaje: string | string[];
    error: string;
    timestamp: string;
    path: string;
}

@Catch()
export class ExcepcionGlobalFilter implements ExceptionFilter {
    private readonly logger = new Logger(ExcepcionGlobalFilter.name);

    catch(excepcion: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const { statusCode, mensaje, error } = this.resolverRespuesta(excepcion);

        if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(excepcion instanceof Error ? excepcion.stack : excepcion);
        }

        const cuerpo: RespuestaError = {
            statusCode,
            mensaje,
            error,
            timestamp: new Date().toISOString(),
            path: request.url,
        };

        response.status(statusCode).json(cuerpo);
    }

    private resolverRespuesta(excepcion: unknown): {
        statusCode: number;
        mensaje: string | string[];
        error: string;
    } {
        if (excepcion instanceof HttpException) {
            const statusCode = excepcion.getStatus();
            const respuesta = excepcion.getResponse();

            const mensaje =
                typeof respuesta === 'string'
                    ? respuesta
                    : (respuesta as any).message ?? excepcion.message;

            return { statusCode, mensaje, error: HttpStatus[statusCode] ?? 'Error' };
        }


        if (excepcion instanceof Prisma.PrismaClientKnownRequestError) {
            return this.resolverErrorPrisma(excepcion);
        }


        return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            mensaje: 'Ocurrió un error interno inesperado',
            error: 'Internal Server Error',
        };
    }

    private resolverErrorPrisma(excepcion: Prisma.PrismaClientKnownRequestError) {
        switch (excepcion.code) {
            case 'P2002': {

                const campo = (excepcion.meta?.target as string[])?.join(', ') ?? 'campo';
                return {
                    statusCode: HttpStatus.CONFLICT,
                    mensaje: `Ya existe un registro con ese valor en: ${campo}`,
                    error: 'Conflict',
                };
            }
            case 'P2003': {

                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    mensaje: 'La operación hace referencia a un registro relacionado que no existe',
                    error: 'Bad Request',
                };
            }
            case 'P2025': {

                return {
                    statusCode: HttpStatus.NOT_FOUND,
                    mensaje: 'El registro solicitado no existe',
                    error: 'Not Found',
                };
            }
            default: {
                this.logger.error(`Error de Prisma no manejado explícitamente: ${excepcion.code}`);
                return {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    mensaje: 'Ocurrió un error interno inesperado',
                    error: 'Internal Server Error',
                };
            }
        }
    }
}