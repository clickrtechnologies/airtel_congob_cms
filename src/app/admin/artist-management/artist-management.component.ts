import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ArtistLogin } from 'src/app/models/admin-models/artist-login.model';
import { CpLogin } from 'src/app/models/admin-models/cp-login.model';
import { ArtistManagementService } from 'src/app/service/admin-service/artist-management.service';
import { CpManagementService } from 'src/app/service/admin-service/cp-management.service';

declare var $: any;

@Component({
  selector: 'app-artist-management',
  templateUrl: './artist-management.component.html',
  styleUrls: ['./artist-management.component.css']
})
export class ArtistManagementComponent implements OnInit {

  artistLogins: ArtistLogin[] = [];
  newArtistForm!: FormGroup;
  selectedArtist: any;
  showConfirmBox: boolean = false;
  cpLogins: CpLogin[] = [];
  artistLoginLength: number = 0;

  constructor(
    private artistManagementService: ArtistManagementService,
    private cpManagementService: CpManagementService,
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService
  ) {

  }

  ngOnInit(): void {
    this.getCpLoginList();
    this.getArtistLoginList();
    this.initForm();
  }

  // Initialize the form group
  initForm(): void {
    this.newArtistForm = this.fb.group({
      cpName: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  // Fetch artist logins
  getArtistLoginList(): void {
    this.artistManagementService.getArtistLogins().subscribe({
      next: (response: any) => {
        this.artistLogins = Array.isArray(response.data) ? response.data : [];
        this.artistLoginLength = this.artistLogins.length;
      },
      error: (err: any) => {
        this.artistLogins = [];
      }
    });
  }

  // Create new artist login
  createArtistLogin(): void {
    if (this.newArtistForm.invalid) {
      this.newArtistForm.markAllAsTouched();
      return;
    }

    const payload = {
      name: this.newArtistForm.value.name,
      email: this.newArtistForm.value.email,
      username: this.newArtistForm.value.username,
      password: this.newArtistForm.value.password,
      cpName: this.newArtistForm.value.cpName,
      //role will be artist by default
      role: 'ROLE_ARTIST'
    };

    //check if username already exists
    const usernameExists = this.artistLogins.some(artist => artist.username === payload.username);
    const emailExists = this.artistLogins.some(artist => artist.email === payload.email);
    if (usernameExists) {
      this.toastr.error('Username already exists. Please choose a different username.');
      return;
    }
    if (emailExists) {
      this.toastr.error('Email already exists. Please choose a different email.');
      return;
    }
    this.artistManagementService.createArtistLogin(payload).subscribe({
      next: (response: any) => {
        this.toastr.success('Artist Login created successfully!');
        this.artistLogins.push(response.data);
        this.newArtistForm.reset();
      },
      error: (err: any) => {

        if (err.status === 409) {
          // Conflict → email already exists
          this.toastr.error('Email ID already exists. Please use another one.', 'Error');
          this.newArtistForm.get('email')?.setErrors({ emailExists: true });
        } else {
          // Other errors
          const errorMsg = err.error?.error || 'Failed to create artist login. Please try again.';
          this.toastr.error(errorMsg, 'Error');
        }
      }

    });
  }

  confirmLogin(cp: any) {
    this.selectedArtist = cp;
    this.showConfirmBox = true;
  }

  // Login as artist
  artistLoginAs(ar: any): void {
    // if (!confirm('Do you want to login as Artist ' + ar.username + '?')) return;

    this.artistManagementService.loginAsArtist(ar.id).subscribe({
      next: (res) => {
        const newTab = window.open('/token-login', '_blank');
        if (!newTab) return;

        const listener = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          if (event.data === 'readyForToken') {
            newTab.postMessage(
              {
                accessToken: res.token,
                userRole: 'ROLE_ARTIST',
                id: res.artist.id,
                userName: ar.username
              },
              window.location.origin
            );
            window.removeEventListener('message', listener);
          }
          this.showConfirmBox = false;
        };
        window.addEventListener('message', listener);

      },
      error: () => alert('Login as ' + ar.username + ' failed')
    });
  }

  getCpLoginList(): void {
    this.cpManagementService.getCpLogins().subscribe({
      next: (response: any) => {
        this.cpLogins = Array.isArray(response.data) ? response.data : [];
      },
      error: (err: any) => {
        this.cpLogins = [];
      }
    });
  }

}
