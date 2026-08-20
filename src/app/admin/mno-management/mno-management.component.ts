
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MnoLogin } from 'src/app/models/admin-models/mno-login.model';
import { MnoManagementService } from 'src/app/service/admin-service/mno-management.service';

declare var $: any;

@Component({
  selector: 'app-mno-management',
  templateUrl: './mno-management.component.html',
  styleUrls: ['./mno-management.component.css']
})
export class MnoManagementComponent implements OnInit {
  mnoLogins: MnoLogin[] = [];
  mnoLoginLength: number = 0;
  newMnoForm!: FormGroup;
  selectedMno: any;
  showConfirmBox: boolean = false;

  constructor(
    private mnoManagementService: MnoManagementService,
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService
  ) {
    
  }

  ngOnInit(): void {
    this.getMnoLoginList();
    this.initForm();
  }

  // Initialize the form group
  initForm(): void {
    this.newMnoForm = this.fb.group({
      telco: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  // Fetch MNO logins from the service
  getMnoLoginList(): void {
    this.mnoManagementService.getMnoLogins().subscribe({
      next: (response: any) => {
        this.mnoLogins = Array.isArray(response.data) ? response.data : [];
        this.mnoLoginLength = this.mnoLogins.length;
      },
      error: (err: any) => {
        console.error('Failed to fetch MNO logins:', err);
        this.mnoLogins = [];
      }
    });
  }

  // Create new MNO login
  createMnoLogin(): void {
    if (this.newMnoForm.invalid) {
      this.newMnoForm.markAllAsTouched();
      return;
    }

    const payload = {
      name: this.newMnoForm.value.name,
      email: this.newMnoForm.value.email,
      username: this.newMnoForm.value.username,
      password: this.newMnoForm.value.password,
      telco: this.newMnoForm.value.telco,
      //role will be mno by default
      role: 'ROLE_MNO'
    };

    //check if username already exists
    const usernameExists = this.mnoLogins.some(mno => mno.username === payload.username);
    const nameExists = this.mnoLogins.some(mno => mno.name === payload.name);
    const emailExists = this.mnoLogins.some(mno => mno.email === payload.email);

    if (nameExists) {
      this.toastr.error('Name already exists. Please choose a different name.');
      return;
    }
    if (usernameExists) {
      this.toastr.error('Username already exists. Please choose a different username.');
      return;
    }
    if (emailExists) {
      this.toastr.error('Email already exists. Please choose a different email.');
      return;
    }




    this.mnoManagementService.createMnoLogin(payload).subscribe({
      next: (response: any) => {
        this.toastr.success('MNO Login created successfully!');
        this.mnoLogins.push(response.data);
        this.newMnoForm.reset();
      },
      error: (err: any) => {
        console.error('Failed to create artist login:', err);

        if (err.status === 409) {
          // Conflict → email already exists
          this.toastr.error('Email ID already exists. Please use another one.', 'Error');
          this.newMnoForm.get('email')?.setErrors({ emailExists: true });
        } else {
          // Other errors
          const errorMsg = err.error?.error || 'Failed to create artist login. Please try again.';
          this.toastr.error(errorMsg, 'Error');
        }
      }
    });
  }

  confirmLogin(cp: any) {
  this.selectedMno = cp;
  this.showConfirmBox = true;
}

  // Login as MNO
 mnoLoginAs(ar: any): void {
  // if (!confirm('Do you want to login as MNO ' + ar.username + '?')) return;

  this.mnoManagementService.loginAsMno(ar.id).subscribe({
    next: (res) => {
      // Open the generic token-login page in new tab
      const newTab = window.open('/token-login', '_blank');
      if (!newTab) return;

      // Listen for "readyForToken" message from new tab
      const listener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data === 'readyForToken') {
          newTab.postMessage(
            {
              accessToken: res.token,
              userRole: 'ROLE_MNO',
              id: res.mno.id,
              userName: ar.username
            },
            window.location.origin
          );

          // Remove listener after sending
          window.removeEventListener('message', listener);
        }
      };

      window.addEventListener('message', listener);
      this.showConfirmBox = false;

    
    },
    error: () => this.toastr.error('Login as ' + ar.username + ' failed')
  });
}


}
