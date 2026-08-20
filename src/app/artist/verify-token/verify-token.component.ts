import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-verify-token',
  templateUrl: './verify-token.component.html',
  styleUrls: ['./verify-token.component.css']
})
export class VerifyTokenComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.verifyToken();
  }

  verifyToken(): void {
    const token = this.route.snapshot.paramMap.get('token');

    this.http.get<any>(`${environment.apiUrl}token/verify/${token}`)
    // this.http.get<any>(`http://localhost:8084/token/verify/${token}`)
  .subscribe({
    next: (res) => {
      // Save token in sessionStorage/localStorage
      sessionStorage.setItem("accessToken", res.accessToken);
      sessionStorage.setItem("id", res.id);
      sessionStorage.setItem("userRole", res.role);
      sessionStorage.setItem("name", res.name);

      // Redirect to approval page
      this.router.navigate(['/artist/approvals']);

    },
    error: () => {
        this.toastr.error('Token verification failed. Please try again.');
        
      }
  });
}
}
