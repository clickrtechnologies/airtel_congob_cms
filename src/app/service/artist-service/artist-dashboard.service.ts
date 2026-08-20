import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ArtistSong } from 'src/app/models/artist-models/artist-song.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArtistDashboardService {

  private apiUrl = environment.apiUrl + 'artistdashboard';
       
  constructor(private http: HttpClient) {}

  getArtistDashboardSongs(): Observable<ArtistSong[]> {
    return this.http.get<ArtistSong[]>(`${this.apiUrl}/getlist`);
  }
}
