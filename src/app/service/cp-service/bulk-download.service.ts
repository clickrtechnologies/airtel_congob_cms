import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BulkDownloadService {

  private apiUrl = environment.apiUrl + 'contentuploadcontroller';

  constructor(private http: HttpClient) {}

  bulkDownload(
    file?: File,
    cpId?: number,
    artistName?: string,
    genre?: string,
    category?: string,
    language?: string,
    fullMetadata?: boolean
  ): Observable<any> {

    const formData = new FormData();

    if (file) {
      formData.append('file', file);
    }

    let params = new HttpParams();

    if (cpId) {
      params = params.set('cpId', cpId);
    }

    if (artistName) {
      params = params.set('artistName', artistName);
    }

    if (genre) {
      params = params.set('genre', genre);
    }

    if (category) {
      params = params.set('category', category);
    }

    if (language) {
      params = params.set('language', language);
    }

    if (fullMetadata) {
      params = params.set('fullMetadata', fullMetadata);
    }

    return this.http.post(
      `${this.apiUrl}/bulk-download`,
      formData,
      { params }
    );
  }

}