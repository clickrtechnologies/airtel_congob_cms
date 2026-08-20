// src/app/service/user-service/user-approval.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserLogin } from 'src/app/models/admin-models/user-login.model';
import { MnoLogin } from 'src/app/models/admin-models/mno-login.model';
import { environment } from 'src/environments/environment';
import { UserApproval } from 'src/app/models/user-models/user-approval.model';

@Injectable({
  providedIn: 'root'
})
export class UserApprovalService {

  private apiUrl = environment.apiUrl + 'usercontroller';
  private apiUrl2 = environment.apiUrl + 'userlogin';

  constructor(private http: HttpClient) { }

  

  // Get song content for respective user
  getUserContent(userId: number): Observable<UserApproval[]> {
    return this.http.get<UserApproval[]>(`${this.apiUrl}/getsongcontentforuser/${userId}`);
  }

    getUserContentPage(
      userId: number,
      page: number,
      size: number,
      search?: string
    ) {
      let url = `${this.apiUrl}/getsongcontentforuserpage/${userId}?page=${page}&size=${size}`;

      if (search && search.trim() !== '') {
        url += `&search=${encodeURIComponent(search)}`;
      }

      return this.http.get(url);
    }

  // Approve a single song
  approveSong(approval: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/approve`, approval);
  }

  // Approve multiple songs in bulk
  approveSongsBulk(requests: { id: number, approvedByUser: boolean }[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/approve/bulk`, requests);
  }

  // Get list of users
  getUserLogins(): Observable<UserLogin[]> {
    return this.http.get<UserLogin[]>(`${this.apiUrl2}/getuserlogins`);
  }

  // Get list of MNOs
  getMnoLogins(): Observable<MnoLogin[]> {
    return this.http.get<MnoLogin[]>(`${this.apiUrl2}/getmnologins`);
  }
}
