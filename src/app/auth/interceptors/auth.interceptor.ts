import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private defaultToken =
    'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ1c2VyNUBnbWFpbC5jb20iLCJpYXQiOjE3NTk3NDk2MjIsImV4cCI6MTc2MjM0MTYyMn0.obl5C_UbxUU2sOj2yOSKrqraCdTKaSoHdqJU9ei3BB1Y0Yrz-wUFsektg2erEmajxRNHxGY3psHlvMPJ_bQAgw';
  constructor(private router: Router, private toastr: ToastrService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip token for operator backend (port 8085)
    if (req.url.includes('163.223.186.221:8085/rbt/api/operator')) {
      return next.handle(req);
    }

    // Skip auth for frontend logs endpoint
    if (req.url.includes('api/frontend-logs')) {
      return next.handle(req);
    }

    let token = sessionStorage.getItem('accessToken');
    if (!token) {
      token = this.defaultToken;
    }

    const clonedReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });

    return next.handle(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {

        if (error.status === 401) {
          // Token expired / invalid — show toastr
          this.toastr.error('Session expired. Login again.', 'Session Timeout');

          // Remove token
          sessionStorage.removeItem('accessToken');

          // Redirect to login page
          this.router.navigate(['/login']);
        }

        return throwError(() => error);
      })
    );
  }

}
