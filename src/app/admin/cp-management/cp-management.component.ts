import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CpLogin } from 'src/app/models/admin-models/cp-login.model';
import { CpManagementService } from 'src/app/service/admin-service/cp-management.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

declare var $: any;

@Component({
  selector: 'app-cp-management',
  templateUrl: './cp-management.component.html',
  styleUrls: ['./cp-management.component.css']
})
export class CpManagementComponent implements OnInit {

  cpLogins: CpLogin[] = [];
  cpLoginsLength: number = 0;
  newCpForm!: FormGroup;
  selectedCp: any;
  showConfirmBox = false;
  uploads: any[] = []; // your uploaded songs list
  cpSongCountMap: any = {};



  constructor(
    private cpManagementService: CpManagementService,
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.getCpLoginList();
    this.initForm();
  }

  editCp(cp: any) {
  cp.isEditing = true;
  cp.tempEmail = cp.email;
}
saveCp(cp: any) {

  if (!cp.tempEmail) {
    this.toastr.error('Email is required');
    return;
  }

  this.cpManagementService
    .updateCpEmail(cp.id, cp.tempEmail)
    .subscribe({
      next: () => {
        cp.email = cp.tempEmail;
        cp.isEditing = false;
        this.toastr.success('Email updated successfully');
      },
      error: () => {
        this.toastr.error('Failed to update email');
      }
    });
}


  ngOnInit(): void {
    this.getCpLoginList();
    this.initForm();
    this.loadCpSongCounts();
  }

  // Initialize form controls
  initForm(): void {
    this.newCpForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  // Fetch existing CP login list
  getCpLoginList(): void {
    this.cpManagementService.getCpLogins().subscribe({
      next: (response: any) => {
        this.cpLogins = Array.isArray(response.data) ? response.data : [];
        this.cpLoginsLength = this.cpLogins.length;


      },
      error: (err: any) => {
        console.error('Failed to fetch CP login list:', err);
        this.cpLogins = [];
      }
    });
  }


  loadCpSongCounts() {
    this.cpManagementService.getCpSongCounts().subscribe({
      next: (response: any[]) => {
        this.cpSongCountMap = {};

        response.forEach(cp => {
          this.cpSongCountMap[cp.cpName] = cp.totalSongs;
        });
        console.log("CP Song Counts:", this.cpSongCountMap);
      },
      error: err => {
        console.error("Failed to load CP song counts", err);
      }
    });
  }






  // Create new CP login
  createCpLogin(): void {
    if (this.newCpForm.invalid) {
      this.newCpForm.markAllAsTouched();
      return;
    }

    const payload = {
      name: this.newCpForm.value.name,
      email: this.newCpForm.value.email,
      username: this.newCpForm.value.username,
      password: this.newCpForm.value.password,
      //role will be cp by default
      role: 'ROLE_CP'
    };

    //check if username already exists
    const usernameExists = this.cpLogins.some(cp => cp.username === payload.username);
    const emailExists = this.cpLogins.some(cp => cp.email === payload.email);
    const nameExists = this.cpLogins.some(cp => cp.name === payload.name);
    if (emailExists) {
      this.toastr.error('Email already exists. Please choose a different email.');
      return;
    }
    if (usernameExists) {
      this.toastr.error('Username already exists. Please choose a different username.');
      return;
    }
    if (nameExists) {
      this.toastr.error('Name already exists. Please choose a different name.');
      return;
    }

    this.cpManagementService.createCpLogin(payload).subscribe({
      next: (response: any) => {
        this.toastr.success('CP Login created successfully!');
        this.cpLogins.push(response.data); // add to UI
        this.newCpForm.reset(); // reset form
      },
      error: (err: any) => {
        console.error('Failed to create artist login:', err);

        if (err.status === 409) {
          // Conflict → email already exists
          this.toastr.error('Email ID already exists. Please use another one.', 'Error');
          this.newCpForm.get('email')?.setErrors({ emailExists: true });
        } else {
          // Other errors
          const errorMsg = err.error?.error || 'Failed to create CP login. Please try again.';
          this.toastr.error(errorMsg, 'Error');
        }
      }
    });
  }

  confirmLogin(cp: any) {
    this.selectedCp = cp;
    this.showConfirmBox = true;
  }

  cpLoginAs(ar: any): void {

    this.cpManagementService.loginAscp(ar.id).subscribe({
      next: (res) => {
        const newTab = window.open('/token-login', '_blank');
        if (!newTab) return;

        const listener = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          if (event.data === 'readyForToken') {
            newTab.postMessage(
              {
                userName: ar.username,
                accessToken: res.token,
                userRole: 'ROLE_CP',
                id: res.cp.id
              },
              window.location.origin
            );
            window.removeEventListener('message', listener);
            this.showConfirmBox = false;
          }
        };
        window.addEventListener('message', listener);

      },
      error: () => this.toastr.error('Login as ' + ar.username + ' failed')
    });
  }

}
