// src/app/contract.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ArtistContract } from 'src/app/models/artist-models/artist-contract.model';
import { Contract } from 'src/app/models/cp-models/contract.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArtistContractService {

  private apiUrl = environment.apiUrl + 'artistcontract';
   private apiUrl1 = environment.apiUrl + 'artistapprovalcontroller';
         
    constructor(private http: HttpClient) {}

  getContracts(artistId: any): Observable<any[]> {
     return this.http.get<any[]>(`${this.apiUrl1}/getartistsongcontent/${artistId}`);
  }
}
