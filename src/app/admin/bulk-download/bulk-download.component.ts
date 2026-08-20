import { Component, OnInit } from '@angular/core';
import { BulkDownloadService } from 'src/app/service/admin-service/bulk-download.service';

@Component({
  selector: 'app-bulk-download',
  templateUrl: './bulk-download.component.html',
  styleUrls: ['./bulk-download.component.css']
})
export class BulkDownloadComponent implements OnInit {

  selectedFile!: File | null;

  isLoading = false;
  errorMsg = '';
  successMsg = '';

  metadataUrl = '';
  contentZipUrl = '';
  contractZipUrl = '';

  selectedType: string = '';

  selectedCp: number | null = null;
  selectedArtist: string = '';
  selectedCategory: string = '';
  selectedGenre: string = '';
  selectedLanguage: string = '';
cpList: any[] = [];
artistList: any[] = [];
ngOnInit(): void {
  this.loadCpList();
}
loadCpList() {
  this.bulkDownloadService.getcplogins()
    .subscribe((res: any) => {
      this.cpList = res.data;
    });
}
  constructor(private bulkDownloadService: BulkDownloadService) {}


  onTypeChange(): void {
    this.resetMessages();
    this.selectedFile = null;
    this.selectedCp = null;
    this.selectedArtist = '';
    this.selectedCategory = '';
    this.selectedGenre = '';
    this.selectedLanguage = '';
    if (this.selectedType === 'artist') {
}
}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    this.resetMessages();
  }

  submitBulkDownload(): void {

    this.resetMessages();
    this.isLoading = true;

    let apiCall;

    if (this.selectedType === 'songId') {

      if (!this.selectedFile) {
        this.errorMsg = 'Please select a text file with song codes';
        this.isLoading = false;
        return;
      }

      apiCall = this.bulkDownloadService.bulkDownload(this.selectedFile);

    }

    else if (this.selectedType === 'cpId') {

      if (!this.selectedCp) {
        this.errorMsg = 'Please enter CP ID';
        this.isLoading = false;
        return;
      }

      apiCall = this.bulkDownloadService.bulkDownload(
        undefined,
        this.selectedCp
      );
    }

    else if (this.selectedType === 'artist') {

      if (!this.selectedArtist) {
        this.errorMsg = 'Please enter artist name';
        this.isLoading = false;
        return;
      }

      apiCall = this.bulkDownloadService.bulkDownload(
        undefined,
        undefined,
        this.selectedArtist
      );
    }

    else if (this.selectedType === 'genre') {

      if (!this.selectedGenre) {
        this.errorMsg = 'Please enter genre';
        this.isLoading = false;
        return;
      }

      apiCall = this.bulkDownloadService.bulkDownload(
        undefined,
        undefined,
        undefined,
        this.selectedGenre
      );
    }

    else if (this.selectedType === 'category') {

      if (!this.selectedCategory) {
        this.errorMsg = 'Please enter category';
        this.isLoading = false;
        return;
      }

      apiCall = this.bulkDownloadService.bulkDownload(
        undefined,
        undefined,
        undefined,
        undefined,
        this.selectedCategory
      );
    }
    else if (this.selectedType === 'language') {

      if (!this.selectedLanguage) {
        this.errorMsg = 'Please enter language';
        this.isLoading = false;
        return;
      }

      apiCall = this.bulkDownloadService.bulkDownload(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        this.selectedLanguage
      );
    }

    else if (this.selectedType === 'metadata') {

      apiCall = this.bulkDownloadService.bulkDownload(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        true
      );
    }

    else {
      this.errorMsg = 'Please select a download type';
      this.isLoading = false;
      return;
    }

    apiCall.subscribe({
      next: (res: any) => {

        this.isLoading = false;
        this.successMsg = 'Bulk download prepared successfully';

        this.metadataUrl = res.metadataUrl;
        this.contentZipUrl = res.contentZipUrl;
        this.contractZipUrl = res.contractZipUrl;

      },
      error: (err: any) => {

        this.isLoading = false;
        this.errorMsg = err?.error?.message || 'Bulk download failed';

      }
    });

  }

  resetMessages(): void {

    this.errorMsg = '';
    this.successMsg = '';
    this.metadataUrl = '';
    this.contentZipUrl = '';
    this.contractZipUrl = '';

  }

}