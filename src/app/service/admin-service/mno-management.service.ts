import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MnoLogin } from 'src/app/models/admin-models/mno-login.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MnoManagementService {
 private apiUrl = environment.apiUrl+'mnologin';
  private apiUrl2 = environment.apiUrl+'userlogin';
            
       constructor(private http: HttpClient) {}

  getMnoLogins(): Observable<MnoLogin[]> {
    return this.http.get<MnoLogin[]>(`${this.apiUrl2}/getmnologins`);
  }

  createMnoLogin(payload: any): Observable<any> {
  return this.http.post(`${this.apiUrl2}/create`, payload);
}

  login(username: string, password: string): Observable<any> {
    const payload = { username, password };
    return this.http.post(`${this.apiUrl}/login`, payload);
  }

  loginAsMno(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl2}/admin/login-as-mno/${id}`, {});
  }
}
