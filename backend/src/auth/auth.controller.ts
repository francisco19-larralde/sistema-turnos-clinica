import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AutenticacionGuard } from "./autenticacion.guard";
import { LoginDto } from "./dto/login.dto";
import { RegistrarPacienteDto } from "./dto/registrar-paciente.dto";


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('registro')
    registrarPaciente(@Body() datos: RegistrarPacienteDto) {
        return this.authService.registrarPaciente(datos);
    }

    @Post('login')
    @HttpCode(200)
    login(@Body() datos: LoginDto) {
        return this.authService.login(datos);
    }

    @UseGuards(AutenticacionGuard)
    @Get('perfil')
    perfil(@Req() request: Request) {
        return (request as any).usuario;
    }


}