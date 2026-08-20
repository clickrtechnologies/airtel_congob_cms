// Angular service for OTP-based secure download flow.
// This file encapsulates only backend calls and a small helper to open the file once verified.

import { Injectable } from '@angular/core';                            // Injectable decorator
import { HttpClient } from '@angular/common/http';                     // Http client for API calls
import { Observable } from 'rxjs';                                     // Observable type
import { map } from 'rxjs/operators';                                  // operator to map responses
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })                                    // provide service application-wide
export class SecurityDownloadService {

  // base API endpoint for OTP logic (adjust if your backend uses a different path)
  private apiBase = environment.apiUrl+'api/security';
  // private apiBase = '/api/security';

  // inject HttpClient
  constructor(private http: HttpClient) {}

  // 1) Request OTP — calls backend to generate OTP and email admins
  // payload: fileUrl, fileName, requestedBy, metadata (optional)
  requestOtp(payload: { fileUrl: string; fileName: string; requestedBy?: string; metadata?: any }): Observable<any> {
    return this.http.post(`${this.apiBase}/request-otp`, payload);
  }

  // 2) Verify OTP — calls backend to verify the entered OTP for the given fileName
  verifyOtp(fileName: string, otp: string): Observable<{ verified: boolean; message?: string }> {
    return this.http.post<{ verified: boolean; message?: string }>(`${this.apiBase}/verify-otp`, { fileName, otp });
  }

  // 3) Utility to open the file URL in new tab (download or preview)
  // you can replace this to stream download or use anchor-based download
  openFile(fileUrl: string) {
    window.open(fileUrl, '_blank');
  }
}
