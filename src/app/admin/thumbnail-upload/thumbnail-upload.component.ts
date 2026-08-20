import { Component } from '@angular/core';
import { ThumbnailUploadService } from 'src/app/service/admin-service/thumbnail-upload.service';

@Component({
  selector: 'app-thumbnail-upload',
  templateUrl: './thumbnail-upload.component.html',
  styleUrls: ['./thumbnail-upload.component.css']
})
export class ThumbnailUploadComponent {

  selectedFile: File | null = null;
  successMessage = '';
  errorMessage = '';
  isUploading = false;

  constructor(private thumbnailService: ThumbnailUploadService) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];

    if (file && file.name.endsWith('.zip')) {
      this.selectedFile = file;
      this.successMessage = '';
      this.errorMessage = '';
    } else {
      this.selectedFile = null;
      this.errorMessage = 'Please select a valid ZIP file';
    }
  }

  uploadZip(): void {
    if (!this.selectedFile) {
      return;
    }

    this.isUploading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.thumbnailService.uploadThumbnailZip(this.selectedFile)
      .subscribe({
        next: (response: any) => {
          this.successMessage = response;
          this.isUploading = false;
          this.selectedFile = null;
        },
        error: (error) => {
  if (typeof error.error === 'string') {
    this.errorMessage = error.error;
  } else if (error.error?.message) {
    this.errorMessage = error.error.message;
  } else {
    this.errorMessage = 'Failed to upload ZIP file';
  }

  this.isUploading = false;
}
      });
  }
}