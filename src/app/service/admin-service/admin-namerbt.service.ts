import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NameRbt } from 'src/app/models/admin-models/admin-name-rbt.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NameRbtService {
  private apiUrl = environment.apiUrl + 'rbt';
  
    constructor(private http: HttpClient) {}
  
    getNameRbtList(): Observable<NameRbt[]> {
      return this.http.get<NameRbt[]>(`${this.apiUrl}/getlist`);
    }
}
