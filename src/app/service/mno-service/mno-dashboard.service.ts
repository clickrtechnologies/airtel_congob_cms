import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MnoSong } from 'src/app/models/mno-models/mno-song.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MnoDashboardService {
  private apiUrl = environment.apiUrl + 'mnodashboard';
    
      constructor(private http: HttpClient) {}

  // getMnoSongs(): Observable<MnoSong[]> {
  //   return this.http.get<MnoSong[]>(`${this.apiUrl}/getlistrecord`);
    
  // }
}
