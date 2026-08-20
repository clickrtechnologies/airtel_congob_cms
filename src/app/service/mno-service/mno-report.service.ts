import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReportData } from 'src/app/models/mno-models/mno-report.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MnoReportService {
   private apiUrl = environment.apiUrl + 'mnoreport';
      
        constructor(private http: HttpClient) {}

  getReportData():Observable<ReportData[]> {
    return  this.http.get<ReportData[]>(`${this.apiUrl}/getlist`);
  }

  
}
