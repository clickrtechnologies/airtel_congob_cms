import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ContentUploadService } from 'src/app/service/cp-service/content-upload.service';
import * as XLSX from 'xlsx-js-style';



interface Artist {
  id: number;
  name: string;
  email: string;
  country?: string;
  contactNumber?: string;
  artistPicture?: string;
  cpId?: number;
  active?: boolean;
}

@Component({
  selector: 'app-artist-details',
  templateUrl: './artist-details.component.html',
  styleUrls: ['./artist-details.component.css']
})
export class ArtistDetailsComponent implements OnInit {
  cpId!: string;
  artistForm!: FormGroup;
  artists: Artist[] = [];
  selectedFile: File | null = null;
  uploadedImageUrl: string | null = null;
  selectedExcel: File | null = null;
  showImageModal: boolean = false;
  selectedImageUrl: string | null = null;
  deleteIndex: number | null = null;
  showConfirmBox: boolean = false;
  isUploading: boolean = false;

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;

  searchTerm: string = '';
  filteredArtists: Artist[] = [];

  constructor(
    private fb: FormBuilder,
    private contentUploadService: ContentUploadService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.cpId = sessionStorage.getItem('id') || '';
    this.artistForm = this.fb.group({
      id: [''],
      artistName: ['', Validators.required],
      artistEmail: ['', [Validators.email]],
      artistCountry: [''],
      artistContact: ['', [Validators.pattern(/^\d{10}$/)]],
    });

    this.fetchArtists();
  }
  //  Fetch current artists
  fetchArtists() {
    this.contentUploadService.getArtistsByCpIdPage(this.cpId, this.currentPage, this.pageSize)
      .subscribe({
        next: (res: any) => {
          this.artists = res.data.content || [];
          this.totalPages = res.data.totalPages;
          this.applySearchFilter(); // ✅ refresh filtered list after data load
        },
        error: (err: any) => {
          this.toastr.error('Error fetching artists');
          console.error('Error fetching artists', err);
        }
      });
  }

  // Real-time filtering logic
  onSearchChange(value: string) {
    this.searchTerm = value.trim().toLowerCase();
    this.applySearchFilter();
  }

  //  Apply filter
  applySearchFilter() {
    if (!this.searchTerm) {
      this.filteredArtists = [...this.artists];
    } else {
      this.filteredArtists = this.artists.filter(artist =>
        artist.name?.toLowerCase().includes(this.searchTerm)
      );
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.fetchArtists();
    }
  }

  //  Image upload for single artist
  onFileChange(event: any) {
    const file: File | null = event.target.files?.[0] ?? null;
    if (file) this.selectedFile = file;
  }

  uploadArtistImage() {
    if (!this.selectedFile) {
      this.toastr.warning('Please select an image first!');
      return;
    }
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.contentUploadService.uploadArtistImage(formData).subscribe({
      next: (res: any) => {
        this.uploadedImageUrl = res.url;
        this.toastr.success('Image uploaded successfully!');
      },
      error: (err) => this.toastr.error('Error uploading image: ' + err.message),
    });
  }

  //  Save single artist
  saveArtist() {
    if (this.artistForm.invalid) {
      this.artistForm.markAllAsTouched();
      return;
    }
    this.isUploading = true;
    const payload = {
      id: this.artistForm.get('id')?.value,
      name: this.artistForm.get('artistName')?.value,
      email: this.artistForm.get('artistEmail')?.value,
      country: this.artistForm.get('artistCountry')?.value,
      contactNumber: this.artistForm.get('artistContact')?.value,
      artistPicture: this.uploadedImageUrl || '',
      cpId: +this.cpId
    };

    this.contentUploadService.saveArtist(payload).subscribe({
      next: () => {
        this.toastr.success('Artist saved successfully!');
        this.artistForm.reset();
        this.uploadedImageUrl = null;
        this.fetchArtists();
        this.isUploading = false;
      },
      error: (err: any) => {
        this.toastr.error('Error saving artist: ' + err.message);
        this.isUploading = false;
      }
    });
  }

  //  Excel Sample Download
  downloadSampleExcel() {
    const sample = [
      { name: 'John Doe', email: 'john@gmail.com', country: 'India', contactNumber: '9876543210' }
    ];

    // Convert JSON to sheet
    const ws = XLSX.utils.json_to_sheet(sample);

    // Style header cells
    ws['A1'].s = { fill: { fgColor: { rgb: "FFB22222" } }, font: { color: { rgb: "FFFFFF" }, bold: true } }; // name → red
    ws['C1'].s = { fill: { fgColor: { rgb: "FFB22222" } }, font: { color: { rgb: "FFFFFF" }, bold: true } }; // country → red

    ws['B1'].s = { fill: { fgColor: { rgb: "0000FF" } }, font: { color: { rgb: "FFFFFF" }, bold: true } }; // email → blue
    ws['D1'].s = { fill: { fgColor: { rgb: "0000FF" } }, font: { color: { rgb: "FFFFFF" }, bold: true } }; // contactNumber → blue

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Artists');

    XLSX.writeFile(wb, 'sample_artist_upload.xlsx');
  }


  //  Trigger Excel File Upload
  onExcelSelect(event: any) {
    this.selectedExcel = event.target.files[0] ?? null;
  }

  //  Upload Excel File Logic
  uploadExcel() {
    if (!this.selectedExcel) {
      this.toastr.error('Please select an Excel file!');
      this.isUploading = false;
      return;
    }
    this.isUploading = true;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        this.toastr.error('Excel file is empty!');
        this.isUploading = false;
        return;
      }

      //  Check empty artist name
      if (data.some(row => !row.name || row.name.trim() === '')) {
        this.toastr.error('Artist Name is required in every row.');
        this.isUploading = false;
        return;
      }
      //  Check empty artist country
      if (data.some(row => !row.country || row.country.trim() === '')) {
        this.toastr.error('Artist Country is required in every row.');
        this.isUploading = false;
        return;
      }

      //  Check duplicates inside Excel
      const names = data.map(item => item.name.toLowerCase().trim());
      if (new Set(names).size !== names.length) {
        this.toastr.error('Duplicate artist names found in Excel.');
        this.isUploading = false;
        return;
      }

      //  Duplicate in DB check
      const existing = this.artists.map(a => a.name.toLowerCase());
      const alreadyExists = data.filter(d => existing.includes(d.name.toLowerCase()));
      if (alreadyExists.length > 0) {
        this.toastr.error(`Artist already exists: ${alreadyExists.map(a => a.name).join(', ')}`);
        this.isUploading = false;
        return;
      }

      const cpId = sessionStorage.getItem('id') || '';

      //  Final Payload
      const payload = data.map(item => ({
        name: item.name,
        email: item.email || '',
        country: item.country || '',
        contactNumber: item.contactNumber || '',
        artistPicture: '',
        cpId: +this.cpId
      }));

      //  Call API
      this.contentUploadService.saveBulkArtists(payload, cpId).subscribe({
        next: () => {
          this.toastr.success('Artists uploaded successfully!');
          this.fetchArtists();
          this.selectedExcel = null;
          this.isUploading = false;
        },
        error: (err) => {
          this.toastr.error('Upload failed: ' + err.message);
          console.error(err);
          this.isUploading = false;
        }

      });
    };

    reader.readAsBinaryString(this.selectedExcel);
  }

  //  Delete artist actions
  confirmDelete(i: number) {
    this.deleteIndex = i;
    this.showConfirmBox = true;
  }

  cancelDelete() {
    this.deleteIndex = null;
    this.showConfirmBox = false;
  }

  deleteArtist() {
    if (this.deleteIndex === null) return;
    const artistId = this.artists[this.deleteIndex]?.id;
    if (!artistId) return;

    this.contentUploadService.deleteArtist(artistId).subscribe({
      next: () => {
        this.toastr.success('Artist deleted!');
        this.fetchArtists();
        this.showConfirmBox = false;
        this.deleteIndex = null;
      },
      error: (err) => this.toastr.error('Delete failed: ' + err.message),
    });
  }

  //  Edit/Modal Methods
  editArtist(index: number) {
    const a = this.artists[index];
    this.artistForm.patchValue({
      id: a.id,
      artistName: a.name,
      artistEmail: a.email,
      artistCountry: a.country,
      artistContact: a.contactNumber,
    });
    this.uploadedImageUrl = a.artistPicture || null;
  }

  viewArtistImage(url: string) {
    this.selectedImageUrl = url;
    this.showImageModal = true;
  }

  closeModal() {
    this.showImageModal = false;
    this.selectedImageUrl = null;
  }
}
