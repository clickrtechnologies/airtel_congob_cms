import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Operator {
  id: number;
  operatorName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  companyLogo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OperatorService {

  private apiUrl = 'http://163.223.186.221:8085/rbt/api/operator';
  private token = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ1c2VyNUBnbWFpbC5jb20iLCJpYXQiOjE3NTk3NDk2MjIsImV4cCI6MTc2MjM0MTYyMn0.obl5C_UbxUU2sOj2yOSKrqraCdTKaSoHdqJU9ei3BB1Y0Yrz-wUFsektg2erEmajxRNHxGY3psHlvMPJ_bQAgw';

  constructor(private http: HttpClient) {}

  getOperators(): Observable<Operator[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<{ operators: Operator[], status: string }>(`${this.apiUrl}/list`, { headers })
      .pipe(map(res => res.operators || []));
  }

  addOperator(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/register`, data, { headers });
  }

  uploadCompanyLogo(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    return this.http.post(`${this.apiUrl}/upload`, formData, { headers });
  }

  updateOperator(id: number, data: Partial<Operator>): Observable<any> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.token}`, 'Content-Type': 'application/json' });
    return this.http.put(`${this.apiUrl}/update/${id}`, data, { headers });
  }

  deleteOperator(id: number): Observable<any> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.token}` });
    return this.http.delete(`${this.apiUrl}/delete/${id}`, { headers });
  }

  suspendOperator(id: number): Observable<any> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.token}` });
    return this.http.put(`${this.apiUrl}/suspend/${id}`, {}, { headers });
  }
}
