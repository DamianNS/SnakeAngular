import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  private urlBack = environment.urlBack;

  constructor(
    private http: HttpClient
  ) { }

  crearServer(name:string): Observable<string> {
    return this.http.get<string>(`${this.urlBack}/api/server/start/${name}`);
  }
}
