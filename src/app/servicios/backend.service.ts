import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(
    private http: HttpClient
  ) { }

  crearServer(): Observable<string> {
    return this.http.get<string>("https://localhost:7064/api/server/start");
  }
}
