import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminReportRow } from 'src/app/models/admin-models/admin-report-row.model';
import { EmailMessage } from 'src/app/models/admin-models/email-messages.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {

  private apiUrl = environment.apiUrl + 'userlogin';
  private apiUrl2 = environment.apiUrl + 'mail';

  constructor(private http: HttpClient) { }

  // fetchEmails(page: number, size: number): Observable<EmailMessage[]> {
  //   const url = `${this.apiUrl2}/inbox?page=${page}&size=${size}`;
  //   return this.http.get<EmailMessage[]>(url);
  // }


  getAdminDashboardPage(page: number, size: number, search?: string) {
  let url = `${this.apiUrl}/getadmindashboardpaginated?page=${page}&size=${size}`;

  if (search && search.trim() !== '') {
    url += `&search=${encodeURIComponent(search)}`;
  }

  return this.http.get(url);
}
  getAdminReports(): AdminReportRow[] {
    return [
      {
        sno: 1,
        artistName: 'Artist 1',
        albumName: 'Album A',
        songName: 'Song X',
        songCode: 'SC001',
        qrCode: 'QR001',
        genre: 'Pop',
        cpName: 'CP Alpha',
        licensedCountry: 'Country 1',
        licensedMno: 'MNO 1',
        contractPdf: 'assets/contracts/contract1.pdf',
        contractExpiry: '2025-12-31',
        audioFile: 'assets/audio/audio1.mp3',
        approvalArtist: true,
        approvalMno: false
      },
      {
        sno: 2,
        artistName: 'Artist 2',
        albumName: 'Album B',
        songName: 'Song Y',
        songCode: 'SC002',
        qrCode: 'QR002',
        genre: 'Rock',
        cpName: 'CP Beta',
        licensedCountry: 'Country 2',
        licensedMno: 'MNO 2',
        contractPdf: 'assets/contracts/contract2.pdf',
        contractExpiry: '2026-01-15',
        audioFile: 'assets/audio/audio2.mp3',
        approvalArtist: false,
        approvalMno: true
      }
    ];
  }
  fetchEmails(page: number, size: number): Observable<any> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get(`${this.apiUrl2}/inbox`, { params });
  }

  getEmail(folder: string, id: number) {
    return this.http.get(`${this.apiUrl2}/email/${folder}/${id}`);
  }



  fetchSent(page: number, size: number): Observable<any> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get(`${this.apiUrl2}/sent`, { params });
  }

  fetchTrash(page: number, size: number): Observable<any> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get(`${this.apiUrl2}/trash`, { params });
  }

  /************************************
   *            POLLING
   ************************************/
  pollNew(page: number, size: number): Observable<any> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get(`${this.apiUrl2}/poll`, { params });
  }

  /************************************
   *            DRAFTS
   ************************************/
  // getDrafts(page: number, size: number): Observable<any> {
  //   const params = new HttpParams().set('page', page).set('size', size);
  //   return this.http.get(`${this.apiUrl2}/drafts`, { params });
  // }

  saveDraft(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl2}/draft/save`, data);
  }

  deleteDraft(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl2}/draft/${id}`);
  }

  /************************************
   *            SEND MAIL
   ************************************/
  sendEmail(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl2}/send`, formData);
  }

  /************************************
   *               REPLY
   ************************************/
  replyEmail(messageId: number, payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl2}/reply/${messageId}`, payload);
  }

  replyAllEmail(messageId: number, payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl2}/reply-all/${messageId}`, payload);
  }

  forwardEmail(messageId: number, payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl2}/forward/${messageId}`, payload);
  }

  /************************************
   *             ACTIONS
   ************************************/
  deleteEmail(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl2}/delete/${id}`);
  }

  archiveEmail(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl2}/archive/${id}`, {});
  }

  moveToTrash(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl2}/trash/${id}`, {});
  }

  restoreEmail(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl2}/restore/${id}`, {});
  }


  markAsRead(id: number) {
    return this.http.post(`${this.apiUrl2}/mark-read/${id}`, {});
  }


  markAsUnread(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl2}/unread/${id}`, {});
  }

  setStar(id: number, starred: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl2}/star/${id}`, { starred });
  }

  /************************************
   *           BULK ACTIONS
   ************************************/
  bulkDelete(ids: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl2}/bulk/delete`, { ids });
  }

  bulkArchive(ids: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl2}/bulk/archive`, { ids });
  }

  /************************************
   *             SEARCH
   ************************************/
  searchEmails(query: string, page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page)
      .set('size', size);

    return this.http.get(`${this.apiUrl2}/search`, { params });
  }

  getDrafts(page: number, size: number) {
    return this.http.get(`${this.apiUrl2}/drafts?page=${page}&size=${size}`);
  }

  getDraftById(id: number) {
    return this.http.get(`/mail/draft/${id}`);
  }

  updateDraft(id: number, payload: any) {
    return this.http.put(`/mail/draft/${id}`, payload);
  }

  sendDraft(id: number, formData: FormData) {
    return this.http.post(`/mail/sendDraft/${id}`, formData);
  }
}
