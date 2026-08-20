import * as FileSaver from 'file-saver';
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ContentUploadService } from '../../service/cp-service/content-upload.service';
import * as JSZip from 'jszip';
import * as XLSX from 'xlsx-js-style';
import { ToastrService } from 'ngx-toastr';
import { CellErrorValue, CellFormulaValue, CellHyperlinkValue, CellRichTextValue, CellSharedFormulaValue, Workbook } from 'exceljs';
import { QrPopupComponent } from 'src/app/shared/components/qr-popup-component/qr-popup-component.component';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ExcelValidationError } from 'src/app/models/cp-models/excel-validation-error';
import { NGXLogger } from 'ngx-logger';
import { HttpEventType } from '@angular/common/http';




@Component({
  selector: 'app-content-upload',
  templateUrl: './content-upload.component.html',
  styleUrls: ['./content-upload.component.css']
})
export class ContentUploadComponent implements AfterViewInit {
  @ViewChild('contentTableScrollContainer') contentTableScrollContainer!: ElementRef;
  @ViewChild('contentTableScrollSlider') contentTableScrollSlider!: ElementRef;

  cpLogins: any;

  cpIdFromSession: number | null = null;
  scrollPositionSingle = 0;
  toastOptions = {
    timeOut: 5000,
    closeButton: true,
    progressBar: true,
    positionClass: 'toast-top-right'
  };
  currentSongPage = 0;
  songPageSize = 10;
  songTotalPages = 0;
  isUploading = false;

  isZipLoading = false;
  isZipReady = false;
  cpId: any;
  uploadProgress = 0;
  uploadStage: 'ARTIST' | 'SONG' | null = null;
  errorExcelLink: any;
  uploadSummary: any = null;
  showUploadSummaryModal = false;
  uploadStageProgress: string = '';


  onBulkFileChange($event: Event) {
    throw new Error('Method not implemented.');
  }
  form = this.fb.group({
    uploads: this.fb.array<FormGroup>([])
  });

  get uploads(): FormArray<FormGroup> {
    return this.form.get('uploads') as FormArray<FormGroup>;
  }

  isPlaying: boolean[] = [];
  isVideoUploading: boolean = false;

  deleteIndex: number | null = null; // To track which row to delete
  showConfirmBox: boolean = false;
  audioZipFile: File | null = null;

  // UI helper flags for each row
  isEditing: boolean[] = [];

  artistList: Array<{ id: number; artistName: string; artistEmail: string }> = [];
  mnoList: Array<{ id: number; name: string }> = [];

  excelFile: File | null = null;
  audioFiles: File[] = [];

  selectedExcelFile: File | null = null;
  selectedAudioFiles: File[] = [];
  selectedAudioFile: string[] = []; // one file name per table row
  selectedThumbnail: string[] = [];
  selectedVideo: string[] = [];
  showImageModal: boolean = false;
  selectedImageUrl: SafeUrl | null = null;
  audioUploading: boolean[] = [];
  selectedVideoUrl: string | null = null;
  showVideoPlayer = false;
  fakeProcessingInterval: any;
  isProcessing = false;




  constructor(
    private contentUploadService: ContentUploadService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private logger: NGXLogger
  ) {
    this.logger.info('ContentUploadComponent initialized');
  }

  ngOnInit(): void {
    this.logger.info('ContentUploadComponent ngOnInit started');
    const storedId = sessionStorage.getItem('id');
    this.cpIdFromSession = storedId ? +storedId : null;
    this.logger.debug('CP ID from session:', this.cpIdFromSession);
    this.getArtistNames();
    this.getAllSongcontentPage();
    this.getCpLoginList();
    this.getMnoList();
    this.logger.info('ContentUploadComponent ngOnInit completed');
  }

  ngAfterViewInit(): void {
    // Initialize scroll position after view renders
  }

  sanitizeUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }


  private createRow(song?: any, enableSongId: boolean = true): FormGroup {
    return this.fb.group({
      id: new FormControl(song?.id ?? null),
      artistId: new FormControl(song?.artistId ?? ''),
      artistName: new FormControl(song?.artistName ?? '', Validators.required),
      artistEmail: new FormControl(song?.artistEmail ?? ''),
      albumName: new FormControl(song?.albumName ?? '', Validators.required),
      songName: new FormControl(song?.songName ?? '', Validators.required),
      genre: new FormControl(song?.genre ?? '', Validators.required),
      uploadDate: new FormControl(song?.uploadDate ?? '', Validators.required), // yyyy-MM-dd in UI
      cpName: new FormControl(song?.cpName ?? ''),
      country: new FormControl(song?.country ?? ''),
      mnoId: new FormControl(song?.mnoId ?? ''),
      mnoName: new FormControl(song?.mnoName ?? '', Validators.required),
      audioFileUrl: new FormControl(song?.audioFileUrl ?? ''),
      audioFile: new FormControl<File | null>(null),
      songId: new FormControl(
        { value: song?.songId ?? null, disabled: !enableSongId } // Enable or disable based on the parameter
      ),
      active: new FormControl(song?.active ?? true),
      cpId: new FormControl(this.cpIdFromSession),
      songDescription: new FormControl(song?.songDescription ?? ''),
      thumbnailUrl: new FormControl(song?.thumbnailUrl ?? ''),
      thumbnail: new FormControl<File | null>(null),
      videoUrl: new FormControl(song?.videoUrl ?? ''),
      Video: new FormControl<File | null>(null),
      videoThumbnail: new FormControl<File | null>(null),
      language: new FormControl(song?.language ?? '', Validators.required),
      songYear: new FormControl(song?.songYear ?? '', Validators.required),
      subCategory: new FormControl(song?.subCategory ?? ''),
      category: new FormControl(song?.category ?? ''),
      songDuration: new FormControl(song?.songDuration ?? ''),

    });
  }

  private setRowEnabled(i: number, enabled: boolean) {
    const grp = this.uploads.at(i);
    if (!grp) return;

    // Keep audioFileUrl readable; toggle others
    const toToggle = [
      'artistId', 'artistEmail', 'albumName', 'songName', 'genre', 'uploadDate',
      'cpName', 'country', 'mnoId', 'songDescription', 'thumbnailUrl', 'videoUrl', 'language', 'songYear',
      'subCategory', 'category', 'songDuration', 'artistName', 'mnoName'
    ];
    toToggle.forEach(ctrlName => {
      const ctrl = grp.get(ctrlName);
      if (!ctrl) return;
      enabled ? ctrl.enable({ emitEvent: false }) : ctrl.disable({ emitEvent: false });
    });
  }

  addContent() {
    this.logger.info('Adding new content row');
    const row = this.createRow(
      {
        artistId: '',
        artistName: '',
        artistEmail: '',
        albumName: '',
        songName: '',
        genre: '',
        uploadDate: '',
        cpName: '',
        country: '',
        mnoId: '',
        mnoName: '',
        audioFileUrl: '',
        songId: '',
        active: true,
        cpId: this.cpIdFromSession,// Must be true so the row is visible,
        songDescription: '',
        thumbnailUrl: '',
        videoUrl: '',
        language: '',
        songYear: '',
        category: '',
        subCategory: '',
        songDuration: ''
      },
      true // Enable songId for new rows
    );
    this.uploads.insert(0, row);
    this.isEditing.splice(0, 0, true);
    this.setRowEnabled(0, true);
  }


  editContent(i: number) {
    this.logger.info('Editing content at row:', i);
    this.isEditing[i] = true;
    this.setRowEnabled(i, true);
    const grp = this.uploads.at(i);
    if (grp) {
      grp.get('songId')?.disable();
    }
  }

  saveContent(i: number) {
    this.logger.info('Saving content at row:', i);
    if (this.uploads.invalid) {

      this.uploads.markAllAsTouched();
      this.logger.warn('Form validation failed for row:', i);
      this.toastr.warning('Enter required fields, cannot save content.');
      return;
    }

    const missingAudio = this.uploads.controls.some(
      (grp: any) => !grp.get('audioFileUrl')?.value
    );

    if (missingAudio) {
      this.toastr.warning('Please upload audio file before saving.');
      return;
    }

    const grp = this.uploads.at(i);
    if (!grp) return;

    const v = grp.getRawValue();

    // Resolve names from ids for payload cleanliness
    const artistName =
      this.artistList.find(a => a.id === +v.artistId)?.artistName || v.artistName || '';
    const mnoName =
      this.mnoList.find(m => m.id === +v.mnoId)?.name || v.mnoName || '';

    // Convert date to ISO if provided
    const uploadDateIso = v.uploadDate
      ? new Date(v.uploadDate + 'T00:00:00').toISOString()
      : new Date().toISOString();

    const payload = {
      id: v.id ?? undefined,
      artistId: v.artistId || null,
      artistName,
      albumName: v.albumName,
      songName: v.songName,
      genre: v.genre,
      uploadDate: uploadDateIso,
      cpName: v.cpName,
      country: v.country,
      mnoId: v.mnoId || null,
      mno: mnoName, // if your backend expects `mno` as name; change to mnoName/mno if needed
      songId: v.songId || null,
      audioFileUrl: v.audioFileUrl || '',
      active: v.active,
      songDescription: v.songDescription,
      thumbnailUrl: v.thumbnailUrl,
      cpId: sessionStorage.getItem('id') ? +sessionStorage.getItem('id')! : null,
      videoUrl: v.videoUrl,
      language: v.language || '',
      songYear: v.songYear || '',
      category: v.category || '',
      subCategory: v.subCategory || '',
      duration: v.songDuration || ''
    };
    console.log('Payload to save:', payload);
    this.contentUploadService.saveContent(payload).subscribe({
      next: () => {
        this.logger.info('Content saved successfully for row:', i);
        this.toastr.success('Content saved successfully!');
        this.isEditing[i] = false;
        this.setRowEnabled(i, false);
        this.getAllSongcontentPage(); // refresh from server to stay in sync
      },
      error: (err: any) => {
        this.logger.error('Failed to save content at row:', i, err);
        this.toastr.error('Failed to save content!');
        this.getAllSongcontentPage();
      }
    });
  }

  deleteContent() {
    if (this.deleteIndex === null) return;

    const i = this.deleteIndex;
    const grp = this.uploads.at(i);
    const id = grp?.get('id')?.value as number | null;
    this.logger.info('Deleting content at row:', i, 'with ID:', id);

    if (!id) {
      // client-only row not saved yet
      this.logger.info('Deleting unsaved client-only row');
      this.uploads.removeAt(i);
      this.isEditing.splice(i, 1);
      this.cancelDelete();
      return;
    }

    this.contentUploadService.deleteContentById(id).subscribe({
      next: () => {
        this.logger.info('Content deleted successfully, ID:', id);
        this.uploads.removeAt(i);
        this.isEditing.splice(i, 1);
        this.toastr.success('Content deleted successfully!');
        this.cancelDelete();
      },
      error: () => {
        this.logger.error('Failed to delete content, ID:', id);
        this.toastr.error('Failed to delete content!');
        this.cancelDelete();
      }
    });
  }

  confirmDelete(i: number) {
    this.deleteIndex = i;
    this.showConfirmBox = true; // show the confirmation box
  }

  cancelDelete() {
    this.deleteIndex = null;
    this.showConfirmBox = false; // hide the confirmation box
  }

  goToSongPage(page: number) {
    if (page >= 0 && page < this.songTotalPages) {
      this.currentSongPage = page;
      this.getAllSongcontentPage(); // call your loading function
    }
  }


  getAllSongcontent(): void {

    const id = sessionStorage.getItem('id');
    if (!id) {
      return;
    }

    this.contentUploadService.getAllSongContent(id).subscribe({
      next: (response: any) => {
        // Clear previous data
        this.uploads.clear();
        this.isEditing = [];


        const list = Array.isArray(response?.data) ? response.data : [];

        // Filter only approved content


        list.forEach((item: any, index: number) => {
          // Normalize data
          const normalized = {
            id: item.id ?? null,
            artistId: item.artist?.id ?? item.artistId ?? '',
            artistName: item.artistName ?? '',

            albumName: item.albumName ?? '',
            songName: item.songName ?? '',
            genre: item.genre ?? '',
            uploadDate: item.uploadDate ? item.uploadDate.split('T')[0] : '', // format yyyy-MM-dd
            cpName: item.cpName ?? '',
            country: item.country ?? '',
            mnoId: item.mno?.id ?? item.mnoId ?? '',
            mnoName: item.mno?.name ?? item.mnoName ?? item.mno ?? '',
            audioFileUrl: item.audioFileUrl ?? '',
            songId: item.songId ?? '',
            active: item.active ?? '',
            cpId: this.cpIdFromSession,
            songDescription: item.songDescription,
            thumbnailUrl: item.thumbnailUrl,
            artistEmail: this.artistList.find(a => a.id === item.artistId)?.artistEmail || '',
            videoUrl: item.videoUrl,
            language: item.language || '',
            songYear: item.songYear || '',
            category: item.category || '',
            subCategory: item.subCategory || '',
            songDuration: item.songDuration || ''

          };
          // Create FormGroup row
          const row = this.createRow(normalized, false); // false = disable songId editing
          // Add row to FormArray
          this.uploads.push(row);

          // Initialize editing flag and disable row
          this.isEditing.push(false);
          this.setRowEnabled(this.uploads.length - 1, false);

        });
      },
      error: (err) => {
        this.uploads.clear();
        this.isEditing = [];
      }
    });
  }

  getAllSongcontentPage(): void {

    const id = sessionStorage.getItem('id');
    if (!id) {
      return;
    }

    this.contentUploadService.getAllSongContentPage(this.cpIdFromSession, this.currentSongPage, this.songPageSize)
      .subscribe({
        next: (response: any) => {
          this.uploads.clear();
          this.isEditing = [];

          const list = response.data.content || [];  //  pageable content
          this.songTotalPages = response.data.totalPages;
          list.forEach((item: any, index: number) => {
            console.log('Raw item from backend:', item);
            const normalized = {
              id: item.id ?? null,
              artistId: item.artist?.id ?? item.artistId ?? '',
              artistName: item.artistName ?? '',
              albumName: item.albumName ?? '',
              songName: item.songName ?? '',
              genre: item.genre ?? '',
              uploadDate: item.uploadDate ? item.uploadDate.split('T')[0] : '', // format yyyy-MM-dd
              cpName: item.cpName ?? '',
              country: item.country ?? '',
              mnoId: item.mno?.id ?? item.mnoId ?? '',
              mnoName: item.mno?.name ?? item.mnoName ?? item.mno ?? '',
              audioFileUrl: item.audioFileUrl ?? '',
              songId: item.songId ?? '',
              active: item.active ?? '',
              cpId: this.cpIdFromSession,
              songDescription: item.songDescription,
              thumbnailUrl: item.thumbnailUrl,
              // artistEmail: this.artistList.find(a => a.id === item.artistId)?.artistEmail || '',
              videoUrl: item.videoUrl,
              language: item.language || '',
              songYear: item.songYear || '',
              category: item.category || '',
              subCategory: item.subCategory || '',
              songDuration: item.duration || ''
            };
            console.log("Normalized object:", normalized);
            const row = this.createRow(normalized, false);
            console.log("Row:", row);
            this.uploads.push(row);
            this.isEditing.push(false);
            this.setRowEnabled(this.uploads.length - 1, false);
          });
        },
        error: () => {
          this.uploads.clear();
          this.isEditing = [];
        }
      });

  }

  convertDriveUrl(url: string | null): string {
    if (!url) return '';

    // Pattern 1: /file/d/FILEID/view
    let match = url.match(/\/d\/([^\/]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }

    // Pattern 2: id=FILEID
    match = url.match(/id=([^&]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }

    // Fallback: return original
    return url;
  }




  onFileChange(event: Event, i: number) {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files.length > 0) {
      const file = input.files[0];

      // Save file name for UI display
      this.selectedAudioFile[i] = file.name;

      // Mark uploading state
      this.audioUploading[i] = true;

      const grp = this.uploads.at(i);
      grp?.get('audioFile')?.setValue(file);

      const formData = new FormData();
      formData.append('uploadAudio', file);
      formData.append('cpId', this.cpIdFromSession?.toString() || '');

      // Upload
      this.contentUploadService.uploadAudio(formData).subscribe({
        next: (res: any) => {
          const url = res?.url || '';
          grp?.get('audioFileUrl')?.setValue(url);
          this.toastr.success('Audio uploaded successfully!');
        },
        error: (err) => {
          this.toastr.error('Audio upload failed!');
        },
        complete: () => {
          // Re-enable button after upload
          this.audioUploading[i] = false;
        }
      });
    } else {
      this.selectedAudioFile[i] = '';
    }
  }


  onFileChangeThumbnail(event: Event, i: number) {
    this.isVideoUploading = true;
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files.length > 0) {
      const file = input.files[0];

      // Save file name for UI display
      this.selectedThumbnail[i] = file.name;

      const grp = this.uploads.at(i);
      grp?.get('thumbnail')?.setValue(file);

      // Upload the file
      const formData = new FormData();
      formData.append('thumbnail', file);
      this.isEditing[i] = false;


      this.contentUploadService.uploadThumbnail(formData).subscribe({
        next: (res: any) => {
          const url = res?.url || '';
          grp?.get('thumbnailUrl')?.setValue(url);
          this.isEditing[i] = true;
          this.toastr.success('Thumbnail uploaded successfully!');
          this.isVideoUploading = false;
        },
      });
    } else {
      this.selectedThumbnail[i] = '';
      this.isVideoUploading = false;
    }
  }

  onVideoChange(event: Event, i: number) {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedVideo[i] = file.name;

      const grp = this.uploads.at(i);
      grp?.get('video')?.setValue(file);

      // Generate video thumbnail (first frame)
      this.generateVideoThumbnail(file).then((thumbnailDataUrl: string) => {
        grp?.get('videoThumbnail')?.setValue(thumbnailDataUrl);
      });

      // Upload video file
      const formData = new FormData();
      formData.append('video', file);
      this.isEditing[i] = false;

      this.contentUploadService.uploadVideo(formData).subscribe({
        next: (res: any) => {
          const url = res?.url || '';
          grp?.get('videoUrl')?.setValue(url);
          this.isEditing[i] = true;
          this.toastr.success('Video uploaded successfully!');
        },
        error: () => {
          this.toastr.error('Video upload failed.');
          this.isEditing[i] = true;
        },
      });
    } else {
      this.selectedVideo[i] = '';
    }
  }

  generateVideoThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');

      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      video.muted = true;
      video.playsInline = true;

      video.onloadeddata = () => {
        video.currentTime = 1;
      };

      video.onseeked = () => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Canvas not supported');
        canvas.width = 160;
        canvas.height = 90;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        URL.revokeObjectURL(video.src);
        resolve(dataUrl);
      };

      video.onerror = (error) => reject(error);
    });
  }




  openThumbnailPreview(url: string): void {
    if (url) {
      window.open(url, '_blank');
    } else {
      this.toastr.warning('Thumbnail not available to preview.');
    }
  }
  openVideoPreview(url: string): void {
    if (url) {
      window.open(url, '_blank');
    } else {
      this.toastr.warning('Video not available to preview.');
    }
  }


  playAudio(i: number) {
    const audio = document.getElementById(`audio-player-${i}`) as HTMLAudioElement | null;
    if (audio) {
      audio.play();
    }
  }

  pauseAudio(i: number) {
    const audio = document.getElementById(`audio-player-${i}`) as HTMLAudioElement | null;
    if (audio) {
      audio.pause();
    }
  }

  getArtistNames(): void {
    const cpId = sessionStorage.getItem('id') || '';
    this.contentUploadService.getArtistsByCpId(cpId).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res?.data) ? res.data : [];
        // normalize to {id, artistName}
        this.artistList = data.map((a: any) => ({
          id: a.id,
          artistName: a.artistName ?? a.name ?? '',
          artistEmail: a.artistEmail ?? a.email ?? ''
        }));
      },
      error: (err: any) => {
        this.artistList = [];
      }
    });
  }

  getMnoList(): void {
    this.contentUploadService.getMnoList().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res?.data) ? res.data : [];
        // normalize to {id, name}
        this.mnoList = data.map((m: any) => ({
          id: m.id,
          name: m.name ?? m.mnoName ?? ''
        }));
      },
      error: (err: any) => {
        this.mnoList = [];
      }
    });
  }

  onArtistChange(i: number) {
    const grp = this.uploads.at(i);
    if (!grp) return;

    const artistId = +grp.get('artistId')!.value!;
    const artistEmail = +grp.get('artistEmail')!.value!;

    const artist = this.artistList.find(a => a.id === artistId);

    grp.get('artistName')!.setValue(artist?.artistName ?? '');
    grp.get('artistEmail')!.setValue(artist?.artistEmail ?? '');

  }

  onMnoChange(i: number) {
    const grp = this.uploads.at(i);
    if (!grp) return;

    const mnoId = +grp.get('mnoId')!.value!;
    const mno = this.mnoList.find(m => m.id === mnoId);
    grp.get('mnoName')!.setValue(mno?.name ?? '');
  }



  async readExcel(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);
        resolve(rows); // array of objects
      };
      reader.onerror = err => reject(err);
      reader.readAsBinaryString(file);
    });
  }

  uploadBulk(): Promise<void> {
    return new Promise(async (resolve, reject) => {

      //  Check files exist
      if (!this.excelFile || !this.audioZipFile) {
        this.logger.error('Missing files for bulk upload - Excel:', !!this.excelFile, 'ZIP:', !!this.audioZipFile);
        this.toastr.error("Please upload both Excel and ZIP file!");
        return reject();
      }

      this.logger.info('Bulk upload started - Excel:', this.excelFile.name, 'ZIP:', this.audioZipFile.name);

      //  Validate Excel extension
      if (!this.excelFile.name.endsWith('.xlsx') && !this.excelFile.name.endsWith('.xls')) {
        this.toastr.error("Please upload a valid Excel file (.xlsx or .xls)!");
        return reject();
      }

      // Validate ZIP file
      if (!this.audioZipFile.name.endsWith('.zip')) {
        this.toastr.error("Please upload a valid ZIP file (.zip)!");
        return reject();
      }

      // Validate number of songs in Excel vs ZIP contents
      const isValid = await this.validateExcelAndZip(this.excelFile, this.audioZipFile);
      if (!isValid) {
        return reject();
      }

      //  Proceed with upload
      this.isUploading = true;
      const formData = new FormData();
      formData.append("excelFile", this.excelFile);
      formData.append("audioZip", this.audioZipFile);
      formData.append("cpId", this.cpIdFromSession?.toString() || '');
      this.uploadStage = 'SONG';
      this.uploadProgress = 0;

      this.contentUploadService.uploadBulk(formData).subscribe({

        next: (event: any) => {

          // Upload progress
          if (event.type === HttpEventType.UploadProgress) {

            this.uploadStageProgress = "UPLOADING";

            if (event.total) {
              this.uploadProgress = Math.round((event.loaded / event.total) * 100);
            }

            // when upload finishes → start fake processing
            if (this.uploadProgress === 100 && !this.isProcessing) {
              this.uploadStageProgress = "PROCESSING";
              this.startFakeProcessing();
            }

          }

          // Server response
          if (event.type === HttpEventType.Response) {

            this.stopFakeProcessing();

            const responseData = event.body?.body?.data;

            const success = responseData?.successRecords ?? 0;
            const failed = responseData?.failedRecords ?? 0;
            const errorExcel = responseData?.errorExcelLink;

            this.uploadSummary = {
              success,
              failed,
              errorExcelLink: errorExcel
            };

            this.showUploadSummaryModal = true;

            this.getAllSongcontentPage();
            this.resetForm();

            resolve();
          }

        },

        error: (err: any) => {

          this.stopFakeProcessing();

          this.toastr.error('Bulk upload failed');

          reject(err);
        }

      });

    });
  }


  private extractArtistsFromExcel(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data: any[] = XLSX.utils.sheet_to_json(sheet);

        if (!data.length) {
          reject('Excel file is empty');
          return;
        }
        console.log('Raw artist data from Excel:', data);

        const artistPayload = data.map(row => ({
          name: row["Artist Name *"]?.trim(),
          email: row.email || '',
          country: row.country || '',
          contactNumber: row.contactNumber || '',
          artistPicture: '',
          cpId: sessionStorage.getItem('id') ? +sessionStorage.getItem('id')! : null
        }));

        resolve(artistPayload);
      };

      reader.readAsBinaryString(file);
    });
  }

  async uploadArtistThenBulkContent() {
    if (!this.excelFile || !this.audioZipFile) {
      this.toastr.error("Please upload both Excel and ZIP file!");
      return;
    }

    this.isUploading = true;

    try {
      await this.uploadArtistsFromExcel();

      await this.uploadBulk();

    } catch (err) {
      console.error(err);
    } finally {
      this.isUploading = false;
    }
  }

  private uploadArtistsFromExcel(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const cpId = sessionStorage.getItem('id') || '';
        const payload = await this.extractArtistsFromExcel(this.excelFile!);
        console.log('Extracted artist payload:', payload);
        this.uploadStage = 'ARTIST';
        this.uploadProgress = 20;
        this.contentUploadService.saveBulkArtists(payload, cpId).subscribe({
          next: () => {
            this.uploadProgress = 50;   // Artist upload done
            resolve();
          },
          error: (err) => reject(err)
        });
      } catch (err) {
        reject(err);
      }
    });
  }




  //  Helper: Replace only illegal Windows characters, KEEP SPACES
  sanitizeFileName(name: string): string {
    return name
      .trim()
      .replace(/[\\/:*?"<>|]/g, "_"); // Keep spaces, only replace illegal chars
  }



  async validateExcelAndZip(excelFile: File, zipFile: File) {
    try {
      const errors: any[] = [];

      // -------------------------------
      //  Read Excel
      // -------------------------------
      const excelData = await excelFile.arrayBuffer();
      const workbook = XLSX.read(excelData);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (rows.length <= 1) {
        this.toastr.error("❌ Excel must contain at least 1 data row.", "", this.toastOptions);
        return false;
      }

      // Required Excel headers
      const headers = rows[0].map(h => h?.toString().trim().toLowerCase() || "");
      const requiredCols = [
        "song name *",
        "artist name *",
        "genre *",
        'upload date ("dd-mm-yyyy") *',
        "licensed countries * (comma separated)",
        "licensed mnos * (comma separated)",
        "language *",
        "year of the song *",
        "duration *(in seconds)"
      ];

      for (const col of requiredCols) {
        if (!headers.includes(col)) {
          this.toastr.error(`❌ Missing column: ${col}`, "", this.toastOptions);
          return false;
        }
      }

      // Column index mapping
      const colIndex: Record<string, number> = {};
      headers.forEach((h, i) => (colIndex[h] = i));

      const songNames: string[] = [];
      const artistNames: string[] = [];
      const seen = new Set();

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];

        // SONG NAME
        const song = row[colIndex["song name *"]];
        if (!song || song.toString().trim() === "") continue;

        const songName = song.toString().trim();

        // Reject special characters in song name
        // const validSongRegex = /^[a-zA-Z0-9 _\-()]+$/;

        // if (!validSongRegex.test(songName)) {
        //   errors.push({
        //     row: i + 1,
        //     column: "Song Name",
        //     value: songName,
        //     message: "Song name contains invalid special characters",
        //     expected: "Only letters, numbers, spaces, underscore (_) and dash (-) allowed",
        //     severity: "ERROR",
        //     suggestion: "Rename the song without special characters"
        //   });
        // }

        // Reject "/" in song
        if (songName.includes("/")) {
          errors.push({
            row: i + 1,
            column: "Song Name",
            value: songName,
            message: "Invalid character '/' found",
            expected: "Song name without '/' character",
            severity: "ERROR",
            suggestion: "Rename the song and audio file without '/'"
          });

        }

        // const key = songName.toLowerCase();
        const key = songName.toLowerCase();
        if (seen.has(key)) {
          errors.push({
            row: i + 1,
            column: "Song Name",
            value: songName,
            message: "Duplicate song name in Excel",
            expected: "Unique song name per row",
            severity: "ERROR",
            suggestion: "Remove or rename the duplicate song entry"
          });

        }
        seen.add(key);
        songNames.push(songName);

        // ARTIST NAME VALIDATION
        const artist = row[colIndex["artist name *"]];

        if (!artist || artist.toString().trim() === "") {
          errors.push({
            row: i + 1,
            column: "Artist Name",
            value: "",
            message: "Artist name is mandatory",
            expected: "Existing artist name",
            severity: "ERROR",
            suggestion: "Enter a valid artist name from system"
          });
        } else {
          const artistName = artist.toString().trim();
          artistNames.push(artistName);
        }


        // DURATION VALIDATION
        const duration = row[colIndex["duration *(in seconds)"]];

        if (duration === undefined || duration === null || duration.toString().trim() === "") {
          errors.push({
            row: i + 1,
            column: "Duration",
            value: "",
            message: "Duration is mandatory",
            expected: "Integer value in seconds (e.g., 180)",
            severity: "ERROR",
            suggestion: "Enter song duration in seconds as an integer"
          });
        } else {
          const durationValue = duration.toString().trim();

          // check integer only
          if (!/^\d+$/.test(durationValue)) {
            errors.push({
              row: i + 1,
              column: "Duration",
              value: durationValue,
              message: "Invalid duration format",
              expected: "Integer value only e.g. 30",
              severity: "ERROR",
              suggestion: "Remove decimals, text, or symbols"
            });
          }
        }
      }

      // Assuming this.artistList contains artists fetched from backend


      const zipData = await zipFile.arrayBuffer();
      const zip = await JSZip.loadAsync(zipData);

      const audioFiles = Object.keys(zip.files).filter(f =>
        f.toLowerCase().match(/\.(mp3|wav|m4a|flac)$/)
      );

      if (audioFiles.length === 0) {
        this.toastr.error("❌ No audio files (.mp3/.wav/.flac/.m4a) found in ZIP.", "", this.toastOptions);
        return false;
      }

      // Create map of ZIP base filenames (case-sensitive)
      const zipBaseMap = new Map<string, string>(); // baseName → originalFileName

      const validSongRegex = /^[a-zA-Z0-9 _-]+$/;

      audioFiles.forEach(filePath => {

        const fileName = filePath.split("/").pop() || "";
        const base = fileName.replace(/\.[^/.]+$/, "");
        const cleanBase = base.replace(/\//g, "").trim();

        // Validate audio filename
        // if (!validSongRegex.test(cleanBase)) {
        //   errors.push({
        //     row: "-",
        //     column: "Audio File",
        //     value: fileName,
        //     message: "Audio filename contains invalid special characters",
        //     expected: "Only letters, numbers, spaces, underscore (_) and dash (-)",
        //     severity: "ERROR",
        //     suggestion: "Rename the audio file"
        //   });
        // }

        zipBaseMap.set(cleanBase, fileName);

      });




      for (let i = 0; i < songNames.length; i++) {
        const song = songNames[i];
        const expectedBase = song.replace(/\//g, "").trim(); // NO lowercase

        if (!zipBaseMap.has(expectedBase)) {
          errors.push({
            row: i + 1,
            column: "Audio File",
            value: song,
            message: "Audio file missing in ZIP",
            expected: `${expectedBase}.mp3 | .wav `,
            severity: "ERROR",
            suggestion: "Add audio file with exact song name"
          });

        }
      }

      const hasBlockingErrors = errors.some(e => e.severity === 'ERROR');

      if (hasBlockingErrors) {
        this.generateErrorExcel(errors);
        this.toastr.error(
          `❌ ${errors.length} issues found. Download error Excel.`,
          "",
          this.toastOptions
        );
        return false;
      }

      // warnings only → allow upload
      this.toastr.warning(
        `⚠ ${errors.length} warnings found. Upload allowed.`,
        "",
        this.toastOptions
      );

      this.toastr.success("✅ All songs, artists, and audio files validated successfully!", "", {
        timeOut: 3000
      });

      return true;

    } catch (err) {
      console.error(err);
      this.toastr.error("❌ Error occurred during validation.", "", this.toastOptions);
      console.log(err);
      return false;
    }
  }

  generateErrorExcel(errors: ExcelValidationError[]) {

    const rows = [
      ["Row", "Column", "Invalid Value", "Error", "Expected", "Severity", "How to Fix"],
      ...errors.map(e => [
        e.row,
        e.column,
        e.value ?? "",
        e.message,
        e.expected ?? "",
        e.severity,
        e.suggestion ?? ""
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);

    const headerCols = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

    /* -------------------------------
       Header Styling
    --------------------------------*/
    headerCols.forEach(col => {

      const cell = `${col}1`;

      if (!ws[cell]) return;

      ws[cell].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "D9E1F2" } }, // light blue
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" }
        }
      };

    });

    /* -------------------------------
       Highlight Rows by Severity
    --------------------------------*/
    errors.forEach((e, idx) => {

      const rowNumber = idx + 2; // because header is row 1

      let color = "";

      if (e.severity === "ERROR") color = "FFF4CC";     // light red
      // if (e.severity === "WARNING") color = "FFF4CC";   // light yellow

      if (!color) return;

      headerCols.forEach(col => {

        const cellRef = `${col}${rowNumber}`;

        if (!ws[cellRef]) return;

        ws[cellRef].s = {
          fill: { fgColor: { rgb: color } },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" }
          }
        };

      });

    });

    /* -------------------------------
       Auto Column Width
    --------------------------------*/
    ws['!cols'] = [
      { wch: 6 },   // Row
      { wch: 15 },  // Column
      { wch: 30 },  // Invalid Value
      { wch: 35 },  // Error
      { wch: 25 },  // Expected
      { wch: 10 },  // Severity
      { wch: 40 }   // How to Fix
    ];

    /* -------------------------------
       Freeze Header Row
    --------------------------------*/
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Validation Errors");

    XLSX.writeFile(wb, "content_upload_errors.xlsx");

  }









  resetForm() {
    this.excelFile = null;
    this.audioZipFile = null;
    this.selectedExcelFile = null;
  }


  toggleAudio(i: number) {
    const audio = document.getElementById(`audio-player-${i}`) as HTMLAudioElement | null;

    if (!audio) {
      return;
    }

    if (this.isPlaying[i]) {
      audio.pause();
      this.isPlaying[i] = false;
    } else {
      this.isPlaying.forEach((_, index) => {
        const otherAudio = document.getElementById(`audio-player-${index}`) as HTMLAudioElement | null;
        if (otherAudio) otherAudio.pause();
        this.isPlaying[index] = false;
      });

      audio.play().catch(err => console.error('Play error:', err));
      this.isPlaying[i] = true;

      audio.onended = () => {
        this.isPlaying[i] = false;
      };
    }
  }


  onExcelChange(event: any) {
    const file = event.target.files[0];
    this.selectedExcelFile = file ?? null;
    this.excelFile = file ?? null;
    this.logger.info('Excel file selected:', file?.name);

    // Reset the input so same file can be selected again
    event.target.value = '';
  }

  onAudioFilesChange(event: any) {
    const files: FileList = event.target.files;
    this.selectedAudioFiles = files ? Array.from(files) : [];
    this.audioFiles = files ? Array.from(files) : [];
    this.logger.info('Audio files selected:', files?.length, 'files');

    // Reset the input so same files can be selected again
    event.target.value = '';
  }

  async downloadTemplate(): Promise<void> {
    this.logger.info('Download template started');
    try {

      // Fetch song IDs for reference
      const response = await firstValueFrom(this.contentUploadService.getSongIds());
      const songIds: string[] = Array.isArray(response?.data) ? response.data : [];

      const workbook = new Workbook();
      const mainSheet = workbook.addWorksheet('UploadSongs', {
        views: [{ state: 'frozen', ySplit: 1 }],
      });

      // Hidden sheets for data validation
      const hiddenSongSheet = workbook.addWorksheet('ExistingSongIds');
      hiddenSongSheet.state = 'veryHidden';
      songIds.forEach((id, i) => (hiddenSongSheet.getCell(`A${i + 1}`).value = id));

      // Header setup
      const headers = [
        'Song Name *',
        'Song Description',
        'Category ',
        'Sub-Category ',
        'Language *',
        'Album Name',
        'Artist Name *',
        'Genre *',
        'Upload Date ("dd-mm-yyyy") *',
        'Licensed Countries * (comma separated)',
        'Licensed MNOs * (comma separated)',
        'Thumbnail URL (Optional)',
        'Year of the Song *',
        "Duration *(in seconds)"
      ];


      const headerRow = mainSheet.addRow(headers);
      headerRow.height = 25;

      headerRow.eachCell((cell) => {
        const isRequired = cell.value?.toString().includes('*');
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isRequired ? 'FFB22222' : 'FF305496' },
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      // Column widths
      mainSheet.columns = [
        { width: 25 }, // Song Name
        { width: 25 }, // Description
        { width: 20 }, // Category
        { width: 20 }, // Sub-Category
        { width: 15 }, // Language
        { width: 25 }, // Album
        { width: 25 }, // Artist
        { width: 20 }, // Genre
        { width: 22 }, // Upload Date
        { width: 20 }, // Country
        { width: 25 }, // MNO
        { width: 40 }, // Thumbnail URL
        { width: 15 }, // Year
        { width: 15 } //duration
      ];

      const maxRows = 1000;

      for (let row = 2; row <= maxRows; row++) {
        const currentRow = mainSheet.getRow(row);

        currentRow.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        });

        mainSheet.getCell(`J${row}`).note =
          'Enter country names separated by commas.\nExample: Kenya,Congo';

        mainSheet.getCell(`K${row}`).note =
          'Enter MNO names separated by commas.\nExample: Airtel,MTN';

        mainSheet.getCell(`N${row}`).note =
          'Enter duration in number only.\nExample: 30';


      }

      mainSheet.autoFilter = { from: 'A1', to: 'N1' };

      const buf = await workbook.xlsx.writeBuffer();
      FileSaver.saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'songs_bulk_upload.xlsx');

      this.toastr.success('  Excel template generated successfully!');
    } catch (error) {
      this.toastr.error('❌ Failed to generate Excel template. Please try again.');
    }
  }


  openZipPicker() {
    const input = document.getElementById('audioZipUpload') as HTMLInputElement;
    if (input) {
      input.click(); // programmatically open file picker
    }
  }


  onAudioZipChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    this.isZipLoading = true;
    this.isZipReady = false;

    setTimeout(() => {
      const file = input.files![0];

      if (!file.name.toLowerCase().endsWith('.zip')) {
        this.isZipLoading = false;
        alert('Please upload a valid ZIP file');
        input.value = ''; // reset input
        return;
      }

      this.audioZipFile = file;

      this.isZipLoading = false;
      this.isZipReady = true;

      //reset so same file can be selected again
      input.value = '';

    }, 0);
  }


  // Fetch existing CP login list
  getCpLoginList(): void {
    this.contentUploadService.getCpLogins().subscribe({
      next: (response: any) => {
        this.cpLogins = Array.isArray(response.data) ? response.data : [];

      },
      error: (err: any) => {
        this.cpLogins = [];
      }
    });
  }


  openQrPopup(videoUrl: string) {
    if (!videoUrl) {
      this.toastr.warning('Video not available.');
      return;
    }

    const popup = window.open('', '_blank', 'width=800,height=500');
    popup!.document.write(`
    <html>
      <head><title>Video Preview</title></head>
      <body style="margin:0;display:flex;justify-content:center;align-items:center;background:#000;">
        <video src="${videoUrl}" controls autoplay style="max-width:100%;max-height:100%;border-radius:8px;"></video>
      </body>
    </html>
  `);
  }

  viewThumbnail(url: string) {
    this.selectedImageUrl = this.sanitizeUrl(url);
    this.showImageModal = true;
  }

  closeModal() {
    this.showImageModal = false;
    this.selectedImageUrl = null;
  }

  // Scroll Slider Methods for Single Upload Table
  onTableScrollSingle(value: string): void {
    const scrollPercent = parseInt(value, 10);
    if (this.contentTableScrollContainer) {
      const element = this.contentTableScrollContainer.nativeElement;
      const maxScroll = element.scrollWidth - element.clientWidth;
      element.scrollLeft = (scrollPercent / 100) * maxScroll;
    }
  }

  updateScrollSliderSingle(): void {
    if (this.contentTableScrollContainer && this.contentTableScrollSlider) {
      const element = this.contentTableScrollContainer.nativeElement;
      const maxScroll = element.scrollWidth - element.clientWidth;
      const scrollPercent = (element.scrollLeft / maxScroll) * 100;
      this.scrollPositionSingle = Math.min(scrollPercent, 100);
    }
  }

  startFakeProcessing() {

    this.isProcessing = true;
    this.uploadProgress = 80;
    this.fakeProcessingInterval = setInterval(() => {

      if (this.uploadProgress < 80) {
        this.uploadProgress += 1;
      }

    }, 400); // speed of progress

  }

  stopFakeProcessing() {

    if (this.fakeProcessingInterval) {
      clearInterval(this.fakeProcessingInterval);
    }

    this.uploadProgress = 100;
    this.isProcessing = false;

  }



}


