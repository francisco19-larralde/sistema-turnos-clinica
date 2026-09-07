import { HttpClient } from "@angular/common/http";
import { Injectable, signal, computed } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, tap } from "rxjs";
import { environment } from "../../../environments/environment.development";
import { UsuarioAutenticado, CredencialesLogin, RespuestaLogin, CredencialesRegistro } from "../models/usuario.model";
import { PerfilUsuario, ActualizarPerfil } from '../models/usuario.model';


const CLAVE_TOKEN = 'turnos_clinica_token';
const CLAVE_USUARIO = 'turnos_clinica_usuario';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenSignal = signal<string | null>(localStorage.getItem(CLAVE_TOKEN));
  private readonly usuarioSignal = signal<UsuarioAutenticado | null>(this.leerUsuarioGuardado());


  readonly usuarioActual = this.usuarioSignal.asReadonly();
  readonly estaAutenticado = computed(() => this.tokenSignal() !== null);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) { }

  login(credenciales: CredencialesLogin): Observable<RespuestaLogin> {
    return this.http.post<RespuestaLogin>(`${environment.apiUrl}/auth/login`, credenciales).pipe(
      tap((respuesta) => this.guardarSesion(respuesta))
    );
  }

  registro(credenciales: CredencialesRegistro) {
    return this.http.post(`${environment.apiUrl}/auth/registro`, credenciales);
  }

  perfil(): Observable<PerfilUsuario> {
    return this.http.get<PerfilUsuario>(`${environment.apiUrl}/auth/perfil`);
  }

  actualizarPerfil(datos: ActualizarPerfil): Observable<PerfilUsuario> {
    return this.http.patch<PerfilUsuario>(`${environment.apiUrl}/auth/perfil`, datos).pipe(tap(perfil => {
      const usuario: UsuarioAutenticado = {
        id: perfil.id, nombre: perfil.nombre, apellido: perfil.apellido, email: perfil.email, rol: perfil.rol,
      };
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
      this.usuarioSignal.set(usuario);
    }));
  }



  logout(): void {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
    this.tokenSignal.set(null);
    this.usuarioSignal.set(null);
    this.router.navigate(['/login']);
  }

  obtenerToken(): string | null {
    return this.tokenSignal();
  }

  private guardarSesion(respuesta: RespuestaLogin): void {
    localStorage.setItem(CLAVE_TOKEN, respuesta.accessToken);
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(respuesta.usuario));
    this.tokenSignal.set(respuesta.accessToken);
    this.usuarioSignal.set(respuesta.usuario);
  }

  private leerUsuarioGuardado(): UsuarioAutenticado | null {
    const guardado = localStorage.getItem(CLAVE_USUARIO);
    return guardado ? JSON.parse(guardado) : null;
  }







}
