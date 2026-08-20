import { Component, OnInit } from '@angular/core';
import { BulkDownloadService } from 'src/app/service/cp-service/bulk-download.service';

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
  selectedArtist: string = '';
  selectedCategory: string = '';
  selectedGenre: string = '';
  selectedLanguage: string = '';

  artistList: any[] = [];

  cpId!: number;

  constructor(private bulkDownloadService: BulkDownloadService) {}

  ngOnInit(): void {

    this.cpId = Number(sessionStorage.getItem('id'));

  }

  onTypeChange(): void {

    this.resetMessages();

    this.selectedFile = null;
    this.selectedArtist = '';
    this.selectedCategory = '';
    this.selectedGenre = '';
    this.selectedLanguage = '';

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

      apiCall = this.bulkDownloadService.bulkDownload(
        this.selectedFile,
        this.cpId
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
        this.cpId,
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
        this.cpId,
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
        this.cpId,
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
        this.cpId,
        undefined,
        undefined,
        undefined,
        this.selectedLanguage
      );

    }

    else if (this.selectedType === 'metadata') {

      apiCall = this.bulkDownloadService.bulkDownload(
        undefined,
        this.cpId,
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

        this.errorMsg =
          err?.error?.message || 'Bulk download failed';

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