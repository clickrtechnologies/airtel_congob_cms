import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contract } from 'src/app/models/cp-models/contract.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private apiUrl = environment.apiUrl + 'contract';
  private apiUrl1 = environment.apiUrl + 'contentuploadcontroller';

  constructor(private http: HttpClient) { }


  getContracts(id: any): Observable<any> {
    return this.http.get(`${this.apiUrl1}/getSongContent/${id}`);
  }

  getContractsPage(cpId: any, page: number, size: number): Observable<any> {
    return this.http.get(`${this.apiUrl1}/getSongContentPage?cpId=${cpId}&page=${page}&size=${size}`);
  }


  saveContract(songData: any): Observable<any> {
    return this.http.post(`${this.apiUrl1}/cpcontractdetails`, songData);
  }

  uploadContract(formData: FormData) {
    return this.http.post<{ url: string }>(`${this.apiUrl1}/contract/upload`, formData);
  }

  saveContractsBulk(formData: FormData) {
    return this.http.post<{ url: string }>(`${this.apiUrl}/bulk`, formData);
  }

  uploadBulkContracts(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl1}/cpcontractdetailsbulk`, formData);
  }

  getMainContract(cpId: string): Observable<any> {
    return this.http.get(`${this.apiUrl1}/getMainContract/${cpId}`);
  }

  uploadMainContract(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl1}/uploadMainContract`, formData);
  }


}
