import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent {
  email: string = '';
  otp: string = '';
  errorMessage: string = '';
  otpSent: boolean = false;

  constructor(private authService: AuthService, private toastr: ToastrService) { }

  // Step 1: Send OTP
  sendOtp() {
    if (!this.email) {
      this.errorMessage = 'Email is required';
      return;
    }

    this.authService.sendOtp(this.email).subscribe({
      next: () => {
        this.otpSent = true;
        this.errorMessage = '';
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.errorMessage || 'Failed to send OTP';
      }
    });
  }

  // Step 2: Verify OTP
  verifyOtp() {
    if (!this.otp) {
      this.errorMessage = 'OTP is required';
      return;
    }

    this.authService.verifyOtp(this.email, this.otp).subscribe({
      next: (res: any) => {
        this.errorMessage = '';
        const role = res.role;
        // Save token & role like normal login
        sessionStorage.setItem('accessToken', res.accessToken);

        sessionStorage.setItem('userRole', role);
        sessionStorage.setItem('id', res.id);
        sessionStorage.setItem('name', res.name);

        if (role === 'ROLE_SP') {
          sessionStorage.setItem('spId', res.id);
        }

        this.authService.navigateToDashboard(role);
        // this.toastr.success('Login successful!');

      },
      error: (err: any) => {
        this.errorMessage = err?.error?.errorMessage || 'OTP verification failed';
        console.error('OTP verification error', err);
        this.toastr.error('OTP verfication failed', this.errorMessage);
      }
    });
  }

  // Optional: resend OTP
  resendOtp() {
    this.sendOtp();
  }
}
