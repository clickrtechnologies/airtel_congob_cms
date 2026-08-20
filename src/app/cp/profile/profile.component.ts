import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContentUploadService } from 'src/app/service/cp-service/content-upload.service';
import { CpManagementService } from 'src/app/service/admin-service/cp-management.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  cp: any = {};
  cpId!: number;
  editMode = false;

  constructor(
    private router: Router,
    private contentUploadService: ContentUploadService,
    private cpManagementService: CpManagementService
  ) {}

  ngOnInit(): void {
    this.cpId = Number(sessionStorage.getItem('id'));

    if (!this.cpId) {
      this.router.navigate(['/cp/login']);
      return;
    }

    this.loadProfile();
  }

  loadProfile(): void {
  this.contentUploadService.getCpLogins().subscribe({
    next: (res: any) => {

      const cpData = res?.data?.find(
        (cp: any) => cp.id === this.cpId
      );

      if (cpData) {
        this.cp = {
          id: cpData.id,
          cpName: cpData.name || '',
          cpEmail: cpData.email || '',
          username: cpData.username || '',
          password: cpData.password || '',

          mobile: cpData.mobile || '',
          countryName: cpData.countryName || '',
          address: cpData.address || ''
        };
      }
    },
    error: (err: any) => {
      console.error(err);
    }
  });
}

 saveChanges(): void {

  this.cpManagementService
    .updateCpDetails(this.cp)
    .subscribe({
      next: (res: any) => {

        this.editMode = false;

        this.loadProfile();

        alert('Profile updated successfully');
      },
      error: (err: any) => {
        console.error(err);
        alert('Failed to update profile');
      }
    });
}
}