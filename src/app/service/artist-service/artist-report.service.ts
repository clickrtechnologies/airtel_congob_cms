import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ArtistReport } from 'src/app/models/artist-models/artist-report.model';
import { GeoInfo } from 'src/app/models/cp-models/geo-info.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArtistReportService {
  private apiUrl = environment.apiUrl;
       
  constructor(private http: HttpClient) {}

  getArtistReports(): Observable<ArtistReport[]> {
    return this.http.get<ArtistReport[]>(`${this.apiUrl}artistreport/getlist`);
  }

  getGeoList(): Observable<GeoInfo[]> {
    return this.http.get<GeoInfo[]>(`${this.apiUrl}cpreport/geoinfo/getlist`);
  }
}
