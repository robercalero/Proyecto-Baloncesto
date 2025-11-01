import { Injectable, inject } from "@angular/core";    
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, catchError, map, of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop'
import { Jugador } from '../interfaces/jugadores';
import { Equipo } from '../interfaces/equipos';
import { Partido } from '../interfaces/partidos';
import { environment } from '../../environments/environment';

@Injectable ({ providedIn: 'root' })
export class ApiServicio {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;

    // Obtener headers con token si existe
    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        let headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    }

    // Métodos para manejar respuestas de API
    private handleResponse<T>(response: any): T {
        if (response.success && response.data) {
            return response.data;
        }
        return response;
    }

    // Jugadores
    getJugadores(): Observable<Jugador[]> {
        return this.http.get<any>(`${this.baseUrl}/jugadores`, { headers: this.getHeaders() })
            .pipe(
                map(response => this.handleResponse<Jugador[]>(response)),
                catchError(error => {
                    console.error('Error al obtener jugadores:', error);
                    return of([]);
                })
            );
    }

    getJugador(id: string): Observable<Jugador | null> {
        return this.http.get<any>(`${this.baseUrl}/jugadores/${id}`, { headers: this.getHeaders() })
            .pipe(
                map(response => this.handleResponse<Jugador>(response)),
                catchError(error => {
                    console.error('Error al obtener jugador:', error);
                    return of(null);
                })
            );
    }

    createJugador(jugador: Partial<Jugador>): Observable<Jugador | null> {
        return this.http.post<any>(`${this.baseUrl}/jugadores`, jugador, { headers: this.getHeaders() })
            .pipe(
                map(response => this.handleResponse<Jugador>(response)),
                catchError(error => {
                    console.error('Error al crear jugador:', error);
                    return of(null);
                })
            );
    }

    updateJugador(id: string, jugador: Partial<Jugador>): Observable<Jugador | null> {
        return this.http.put<any>(`${this.baseUrl}/jugadores/${id}`, jugador, { headers: this.getHeaders() })
            .pipe(
                map(response => this.handleResponse<Jugador>(response)),
                catchError(error => {
                    console.error('Error al actualizar jugador:', error);
                    return of(null);
                })
            );
    }

    deleteJugador(id: string): Observable<boolean> {
        return this.http.delete<any>(`${this.baseUrl}/jugadores/${id}`, { headers: this.getHeaders() })
            .pipe(
                map(response => response.success === true),
                catchError(error => {
                    console.error('Error al eliminar jugador:', error);
                    return of(false);
                })
            );
    }

    // Equipos
    getEquipos(): Observable<Equipo[]> {
        return this.http.get<any>(`${this.baseUrl}/equipos`, { headers: this.getHeaders() })
            .pipe(
                map(response => this.handleResponse<Equipo[]>(response)),
                catchError(error => {
                    console.error('Error al obtener equipos:', error);
                    return of([]);
                })
            );
    }

    getEquipo(id: number): Observable<Equipo | null> {
        return this.http.get<any>(`${this.baseUrl}/equipos/${id}`, { headers: this.getHeaders() })
            .pipe(
                map(response => this.handleResponse<Equipo>(response)),
                catchError(error => {
                    console.error('Error al obtener equipo:', error);
                    return of(null);
                })
            );
    }

    createEquipo(equipo: Partial<Equipo>): Observable<Equipo | null> {
        return this.http.post<any>(`${this.baseUrl}/equipos`, equipo, { headers: this.getHeaders() })
            .pipe(
                map(response => this.handleResponse<Equipo>(response)),
                catchError(error => {
                    console.error('Error al crear equipo:', error);
                    return of(null);
                })
            );
    }

    updateEquipo(id: number, equipo: Partial<Equipo>): Observable<Equipo | null> {
        return this.http.put<any>(`${this.baseUrl}/equipos/${id}`, equipo, { headers: this.getHeaders() })
            .pipe(
                map(response => this.handleResponse<Equipo>(response)),
                catchError(error => {
                    console.error('Error al actualizar equipo:', error);
                    return of(null);
                })
            );
    }

    deleteEquipo(id: number): Observable<boolean> {
        return this.http.delete<any>(`${this.baseUrl}/equipos/${id}`, { headers: this.getHeaders() })
            .pipe(
                map(response => response.success === true),
                catchError(error => {
                    console.error('Error al eliminar equipo:', error);
                    return of(false);
                })
            );
    }

    // Partidos
    getPartidos(): Observable<Partido[]> {
        return this.http.get<any>(`${this.baseUrl}/partidos`, { headers: this.getHeaders() })
            .pipe(
                map(response => this.handleResponse<Partido[]>(response)),
                catchError(error => {
                    console.error('Error al obtener partidos:', error);
                    return of([]);
                })
            );
    }

    getPartido(id: string): Observable<Partido | null> {
        return this.http.get<any>(`${this.baseUrl}/partidos/${id}`, { headers: this.getHeaders() })
            .pipe(
                map(response => this.handleResponse<Partido>(response)),
                catchError(error => {
                    console.error('Error al obtener partido:', error);
                    return of(null);
                })
            );
    }

    getProximosPartidos(limit: number = 5): Observable<Partido[]> {
        return this.http.get<any>(`${this.baseUrl}/partidos/proximos?limit=${limit}`, { headers: this.getHeaders() })
            .pipe(
                map(response => this.handleResponse<Partido[]>(response)),
                catchError(error => {
                    console.error('Error al obtener próximos partidos:', error);
                    return of([]);
                })
            );
    }

    getPartidosEnCurso(): Observable<Partido[]> {
        return this.http.get<any>(`${this.baseUrl}/partidos/en-curso`, { headers: this.getHeaders() })
            .pipe(
                map(response => this.handleResponse<Partido[]>(response)),
                catchError(error => {
                    console.error('Error al obtener partidos en curso:', error);
                    return of([]);
                })
            );
    }

    createPartido(partido: Partial<Partido>): Observable<Partido | null> {
        return this.http.post<any>(`${this.baseUrl}/partidos`, partido, { headers: this.getHeaders() })
            .pipe(
                map(response => this.handleResponse<Partido>(response)),
                catchError(error => {
                    console.error('Error al crear partido:', error);
                    return of(null);
                })
            );
    }

    updatePartido(id: string, partido: Partial<Partido>): Observable<Partido | null> {
        return this.http.put<any>(`${this.baseUrl}/partidos/${id}`, partido, { headers: this.getHeaders() })
            .pipe(
                map(response => this.handleResponse<Partido>(response)),
                catchError(error => {
                    console.error('Error al actualizar partido:', error);
                    return of(null);
                })
            );
    }

    updateResultado(id: string, puntosLocal: number, puntosVisitante: number): Observable<Partido | null> {
        return this.http.put<any>(
            `${this.baseUrl}/partidos/${id}/resultado`,
            { puntosLocal, puntosVisitante },
            { headers: this.getHeaders() }
        ).pipe(
            map(response => this.handleResponse<Partido>(response)),
            catchError(error => {
                console.error('Error al actualizar resultado:', error);
                return of(null);
            })
        );
    }

    deletePartido(id: string): Observable<boolean> {
        return this.http.delete<any>(`${this.baseUrl}/partidos/${id}`, { headers: this.getHeaders() })
            .pipe(
                map(response => response.success === true),
                catchError(error => {
                    console.error('Error al eliminar partido:', error);
                    return of(false);
                })
            );
    }

    // Estadísticas
    getLideresEstadisticas(categoria: string = 'puntos', limite: number = 10): Observable<any[]> {
        return this.http.get<any>(
            `${this.baseUrl}/estadisticas/lideres?categoria=${categoria}&limite=${limite}`,
            { headers: this.getHeaders() }
        ).pipe(
            map(response => this.handleResponse<any[]>(response)),
            catchError(error => {
                console.error('Error al obtener líderes:', error);
                return of([]);
            })
        );
    }

    getEstadisticasLiga(temporada: string = '2024-2025'): Observable<any> {
        return this.http.get<any>(
            `${this.baseUrl}/estadisticas/liga?temporada=${temporada}`,
            { headers: this.getHeaders() }
        ).pipe(
            map(response => this.handleResponse<any>(response)),
            catchError(error => {
                console.error('Error al obtener estadísticas de liga:', error);
                return of(null);
            })
        );
    }

    // Señales para compatibilidad con código existente
    readonly jugadores = toSignal(this.getJugadores(), { initialValue: [] });
    readonly equipos   = toSignal(this.getEquipos(),   { initialValue: [] });
    readonly partidos  = toSignal(this.getPartidos(), { initialValue: [] });
}