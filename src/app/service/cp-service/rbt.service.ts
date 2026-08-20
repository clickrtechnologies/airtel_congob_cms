import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rbt } from 'src/app/models/cp-models/rbt.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RbtService {
  private apiUrl = environment.apiUrl + 'rbt';

  constructor(private http: HttpClient) {}

  getRbtList(): Observable<Rbt[]> {
    return this.http.get<Rbt[]>(`${this.apiUrl}/getlist`);
  }
}
