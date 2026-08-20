import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
    
    private apiUrl = environment.apiUrl+'api/notifications';
    
      constructor(private http: HttpClient) {}


    //   getNotifications(userType: String): Observable<Notification[]> {
    //       return this.http.get<Notification[]>(`${this.apiUrl}/getnotifications/${userType}`, {});
    //     }
}