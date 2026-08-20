import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-verify-token-mno',
  templateUrl: './verify-token-mno.component.html',
  styleUrls: ['./verify-token-mno.component.css']
})
export class VerifyTokenMnoComponent {

  constructor(
      private route: ActivatedRoute,
      private http: HttpClient,
      private router: Router,
      private toastr: ToastrService
    ) {}
  
    ngOnInit(): void {
      this.verifyTokenForMno();
    }


  verifyTokenForMno(): void {
    const token = this.route.snapshot.paramMap.get('token');


   this.http.get<any>(`${environment.apiUrl}token/mno/verify/${token}`)
  .subscribe({
    next: (res) => {
      // Save token in sessionStorage/localStorage
      sessionStorage.setItem("accessToken", res.accessToken);
      sessionStorage.setItem("id", res.id);
      sessionStorage.setItem("userRole", res.role);
      sessionStorage.setItem("name", res.name);

      // Redirect to approval page
      this.router.navigate(['/mno/approvals']);

    },
    error: () => {
        alert('Token verification failed. Please try again.');
        
      }
  });
}

}
