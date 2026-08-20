import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ThumbnailUploadService {

  private apiUrl = environment.apiUrl + 'userlogin';

  constructor(private http: HttpClient) {}

  uploadThumbnailZip(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(
      `${this.apiUrl}/upload-thumbnail`,
      formData,
      {
        responseType: 'text'
      }
    );
  }
}