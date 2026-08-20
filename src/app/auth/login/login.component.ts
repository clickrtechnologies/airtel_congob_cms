import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { ToastrService } from 'ngx-toastr';
import { FcmService } from 'src/app/service/fcm.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  showPassword: boolean = false;
  loading: boolean = false; // Add this property

  constructor(private authService: AuthService,
    private toastr: ToastrService,
     private fcmService: FcmService
  ) {}

  // login() {
  //   if (!this.email || !this.password) {
  //     this.errorMessage = 'Email and password are required';
  //     return;
  //   }

  //   this.authService.login(this.email, this.password).subscribe({
  //     next: (res) => {
  //       this.errorMessage = '';
  //       // success redirect logic handled inside auth service

        
  //     },
  //     error: (err) => {
  //       this.errorMessage = err?.error?.errorMessage || 'Login failed';
  //     }
  //   });
  // }

  async login() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Email and password are required';
      return;
    }

    this.loading = true; // Set loading to true when login starts

    try {
      // Step 1: generate FCM token
      const fcmToken = await this.fcmService.generateToken();

      // Step 2: call backend login API with fcmToken
      this.authService.login(this.email, this.password, fcmToken || '').subscribe({
        next: (res) => {
          this.errorMessage = '';
          // this.toastr.success('Login successful');
          // console.log('success login response:', res);
          this.loading = false; // Set loading to false on success
        },
        error: (err) => {
          this.errorMessage = err?.error?.errorMessage || 'Login failed';
          this.loading = false; // Set loading to false on error
        },
        complete: () => {
          this.loading = false; // Set loading to false when login completes
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      this.errorMessage = 'Unexpected error during login';
      this.loading = false; // Ensure loading is false in case of error
    }
  }
}
