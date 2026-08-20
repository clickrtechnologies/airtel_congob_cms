// src/app/contract.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ArtistLogin } from 'src/app/models/admin-models/artist-login.model';
import { MnoLogin } from 'src/app/models/admin-models/mno-login.model';
import { ArtistApproval } from 'src/app/models/artist-models/artist-approval.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApprovalService {

  private apiUrl = environment.apiUrl + 'artistapprovalcontroller';
  private apiUrl2 = environment.apiUrl + 'userlogin';

  constructor(private http: HttpClient) { }

  getApprovals(): Observable<ArtistApproval[]> {
    return this.http.get<ArtistApproval[]>(`${this.apiUrl}/getlist`);
  }

  //get song content for respective artist
  getArtistContent(artistId: number): Observable<ArtistApproval[]> {
    return this.http.get<ArtistApproval[]>(`${this.apiUrl}/getartistsongcontent/${artistId}`);
  }

  //to approve song
  approveSong(approval: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/approve`, approval);
  }

  getArtistLogins(): Observable<ArtistLogin[]> {
    return this.http.get<ArtistLogin[]>(`${this.apiUrl2}/getartistlogins`);
  }

  getMnoLogins(): Observable<MnoLogin[]> {
    return this.http.get<MnoLogin[]>(`${this.apiUrl2}/getmnologins`);
  }

  approveSongsBulk(requests: { id: number, approvedByArtist: boolean }[]) {
    return this.http.post(`${this.apiUrl}/approve/bulk`, requests);
  }






}
