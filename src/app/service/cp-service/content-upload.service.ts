import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContentUpload } from 'src/app/models/cp-models/content-upload.model';
import { environment } from 'src/environments/environment';
import { ArtistLogin } from 'src/app/models/admin-models/artist-login.model';
import { MnoLogin } from 'src/app/models/admin-models/mno-login.model';
import { CpLogin } from 'src/app/models/admin-models/cp-login.model';
import { Artist } from 'src/app/cp/cp-notifications/cp-notifications.component';

@Injectable({
  providedIn: 'root'
})
export class ContentUploadService {
  private apiUrl = environment.apiUrl + 'contentuploadcontroller';
  private apiUrl2 = environment.apiUrl + 'userlogin';

  constructor(private http: HttpClient) { }

  getUploads(): Observable<ContentUpload[]> {
    return this.http.get<ContentUpload[]>(`${this.apiUrl}/getlist`);
  }

  saveContent(songData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/cpcontentsong`, songData);
  }

  getAllSongContent(id: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/getSongContent/${id}`);
  }

  getAllSongContentPage(cpId: any, page: number, size: number,): Observable<any> {
  return this.http.get(`${this.apiUrl}/getSongContentPage?cpId=${cpId}&page=${page}&size=${size}`);
}

  uploadAudio(formData: FormData) {
    return this.http.post<{ url: string }>(`${this.apiUrl}/audio/upload`, formData);
  }

  uploadThumbnail(formData: FormData) {
    return this.http.post<{ url: string }>(`${this.apiUrl}/uploadthumbnail`, formData);
  }

  uploadVideo(formData: FormData) {
    return this.http.post<{ url: string }>(`${this.apiUrl}/uploadvideo`, formData);
  }

  deleteContentById(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }

  getArtistNames(): Observable<any> {
    return this.http.get<ArtistLogin[]>(`${this.apiUrl2}/getartistlogins`);
  }

  getMnoList(): Observable<any> {
    return this.http.get<MnoLogin[]>(`${this.apiUrl2}/getmnologins`);
  }

  uploadBulk(formData: FormData) {
    return this.http.post<{ url: string }>(`${this.apiUrl}/bulk`, formData,{
    reportProgress: true,
    observe: 'events'
  });
  }

  getSongIds(): Observable<any> {
    return this.http.get<string[]>(`${this.apiUrl}/getSongIds`);
  }

  getCpLogins(): Observable<CpLogin[]> {
    return this.http.get<CpLogin[]>(`${this.apiUrl2}/getcplogins`);
  }

  // ------------------- New Notification APIs -------------------

  /**
   * Save CP emails for a given CP
   * @param cpId CP's UserLogin ID
   * @param emails Array of CP email addresses
   */
  saveCpEmails(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/cp-emails`, payload);
  }


  /**
   * Save or update artist details
   * @param artist ArtistLogin object containing artist info
   */
  saveArtist(artist: Artist): Observable<any> {
    return this.http.post(`${this.apiUrl}/artist`, artist);
  }

  getArtistsByCpId(id: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/getartistforcp/${id}`);
  }

  getArtistsByCpIdPage(cpId: string, page: number, size: number) {
  return this.http.get<any>(`${this.apiUrl}/getartistforcppage?cpId=${cpId}&page=${page}&size=${size}`);
  }


  uploadArtistImage(formData: FormData) {
    return this.http.post<{ url: string }>(`${this.apiUrl}/artistimage/upload`, formData);
  }

  deleteArtist(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteartist/${id}`);
  }

  getCpEmailById(cpId: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/cp/getEmailById/${cpId}`);
}

getAdditionalDoc(id: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/getadditionaldocument/${id}`);
  }
getAllAdditionalDoc(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getalladditionaldocuments`);
  }

  saveBulkArtists(payload: any, cpId:any): Observable<any> {
    return this.http.post(`${this.apiUrl}/artist/bulk/${cpId}`, payload);
  }

  getDashboardStats(cpId: any) {
  return this.http.get<any>(`${this.apiUrl}/getdashboardstats/${cpId}`);
}








}
