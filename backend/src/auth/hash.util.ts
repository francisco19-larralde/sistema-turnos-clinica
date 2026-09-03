import * as bcrypt from 'bcryptjs';

const RONDAS_SALT = 10;

export function hashearContrasena(contrasena: string): Promise<string> {
    return bcrypt.hash(contrasena, RONDAS_SALT);
}

export function compararContrasena(
    contrasena: string,
    hash: string,
): Promise<boolean> {
    return bcrypt.compare(contrasena, hash);
}