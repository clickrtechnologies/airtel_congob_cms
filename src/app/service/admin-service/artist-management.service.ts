import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ArtistLogin } from 'src/app/models/admin-models/artist-login.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArtistManagementService {
  private apiUrl = environment.apiUrl+'cplogin';
  private apiUrl2 = environment.apiUrl+'userlogin';
           
      constructor(private http: HttpClient) {}

  getArtistLogins(): Observable<ArtistLogin[]> {
    return this.http.get<ArtistLogin[]>(`${this.apiUrl2}/getartistlogins`);
  }

  createArtistLogin(payload: any): Observable<any> {
  return this.http.post(`${this.apiUrl2}/create`, payload);
    }

  

  login(username: string, password: string): Observable<any> {
      const payload = { username, password };
      return this.http.post(`${this.apiUrl}/login`, payload);
    }

    // Admin logs in as Artist
  loginAsArtist(artistId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl2}/admin/login-as-artist/${artistId}`, {});
  }
}
