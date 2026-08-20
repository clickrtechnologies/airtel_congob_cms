// src/app/services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';



@Injectable({
  providedIn: 'root'
})
export class NotificationService {
    private apiUrl = environment.apiUrl+'api/notifications';

  constructor(private http: HttpClient) {}

  // Fetch unseen notifications
  getNotifications(userId: any): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/getnotifications/${userId}`, {});
  }

  // Mark notification as seen
 markAsSeen(id: any): Observable<void> {
  return this.http.post<void>(`${this.apiUrl}/mark-seen/${id}`, {});
  // return this.http.post(`${this.apiUrl}/getSongContent/${id}`);
}

}
