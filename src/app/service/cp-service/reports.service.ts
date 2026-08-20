import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GeoInfo } from 'src/app/models/cp-models/geo-info.model';
import { Reports } from 'src/app/models/cp-models/report.model';
import { environment } from 'src/environments/environment';
 
 
@Injectable({
  providedIn: 'root'
})
export class ReportService {
 
  private apiUrl = environment.apiUrl + 'contentuploadcontroller';
 
  constructor(private http: HttpClient) { }
 
 
  // getReports(): Observable<Reports[]> {
  //     return this.http.get<Reports[]>(`${this.apiUrl}/getlist`);
  //   }
 
  // getGeoList(): Observable<GeoInfo[]> {
  //   return this.http.get<GeoInfo[]>(`${this.apiUrl}/geoinfo/getlist`);
  // }
 
  // Dummy Geo + MNO + Year → Months mapping
  private geoList: GeoInfo[] = [
    {
      geoName: 'India',
      mnoList: [
        { mnoName: 'Jio', years: { '2024': ['January', 'February', 'March'], '2025': ['January', 'February'] } },
        { mnoName: 'Airtel', years: { '2024': ['January', 'March'], '2025': ['February', 'March'] } },
        { mnoName: 'Vi', years: { '2024': ['February', 'April'], '2025': ['January', 'May'] } }
      ]
    },
    {
      geoName: 'USA',
      mnoList: [
        { mnoName: 'Verizon', years: { '2024': ['January', 'February'], '2025': ['March', 'April'] } },
        { mnoName: 'AT&T', years: { '2024': ['March', 'April'], '2025': ['January', 'May'] } }
      ]
    },
    {
      geoName: 'UK',
      mnoList: [
        { mnoName: 'Vodafone', years: { '2024': ['January', 'February'], '2025': ['March'] } },
        { mnoName: 'O2', years: { '2024': ['February', 'March'], '2025': ['January', 'April'] } }
      ]
    }
  ];
 
  // Dummy Reports (same as before, matching your Reports interface)
  
 
  getGeoList(): Observable<GeoInfo[]> {
    return of(this.geoList);
  }
 
  // getReports(): Observable<Reports[]> {
  //   return this.http.get<Reports[]>(`${this.apiUrl}/report`);
  // }
 
  getReports(country?: string, mno?: string, year?: any, month?: any, cpId?: any): Observable<any> {
    const params: any = {};

    if (country) params.country = country;
    if (mno) params.mno = mno;
    if (year !== undefined && year !== null && year !== '') params.year = year;
    if (month !== undefined && month !== null && month !== '') params.month = month;
    if (cpId !== undefined && cpId !== null && cpId !== '') params.cpId = cpId;

    return this.http.get<any>(`${this.apiUrl}/reports`, { params });
  }
 

getCountries(cpId: number) {
  return this.http.get(`${this.apiUrl}/countries/${cpId}`);
}

getOperators(cpId: number) {
  return this.http.get(`${this.apiUrl}/operator/${cpId}`);
}
 
getAllCountries() {
  return this.http.get(`${environment.apiUrl}userlogin/countries`);
}

getAllOperators() {
  return this.http.get(`${environment.apiUrl}userlogin/operator`);
}
}