import { Injectable } from "@angular/core";    
import { HttpClient } from "@angular/common/http";
import { toSignal } from '@angular/core/rxjs-interop'

@Injectable ({ providedIn: 'root' })

export class ApiServicio {
    jugadores;
    equipos;
    partidos;

    constructor( private http: HttpClient ) {
        this.jugadores = toSignal(this.http.get<any[]> ('/api/jugadores'), { initialValue: [] } );
        this.equipos = toSignal(this.http.get<any[]> ('/api/equipos'), { initialValue: [] } );
        this.partidos = toSignal(this.http.get<any[]> ('/api/partidos'), { initialValue: [] } );
    }
}