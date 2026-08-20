import { AfterViewInit, Component, ViewChild, ElementRef, createNgModule } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { from } from 'rxjs';
import { Song } from 'src/app/models/cp-models/song.model';
import { ContentUploadService } from 'src/app/service/cp-service/content-upload.service';
import { DashboardService } from 'src/app/service/cp-service/dashboard.service';
import { QrPopupComponent } from 'src/app/shared/components/qr-popup-component/qr-popup-component.component';

declare var $: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit {

  @ViewChild('tableScrollContainer') tableScrollContainer!: ElementRef;
  @ViewChild('tableScrollSlider') tableScrollSlider!: ElementRef;

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  scrollPosition = 0;
  totalUploadedSongs: number | undefined;
  totalApprovedSongs: number | undefined;

  // Alias for pagination display
  get currentSongPage(): number {
    return this.currentPage;
  }

  get songTotalPages(): number {
    return this.totalPages;
  }

  isPlayingIndex: number | null = null;
  audio = new Audio();


  isPlaying: boolean[] = [];
  previewData: any = null;
  additionalDocs: any;

  form = this.fb.group({
    uploads: this.fb.array<FormGroup>([])
  });

  get uploads(): FormArray<FormGroup> {
    return this.form.get('uploads') as FormArray<FormGroup>;
  }

  songs: Song[] = [];

  artistList: Array<{ id: number; artistName: string; artistEmail: string }> = [];

  constructor(private router: Router, private dashboardService: DashboardService,
    private fb: FormBuilder, private dialog: MatDialog, private toastr: ToastrService,
    private contentUploadService: ContentUploadService) {
    // this.getSongs();
  }

  ngOnInit(): void {
    //  sessionStorage.setItem('isFirstLogin', 'true');
    const isFirstLogin = sessionStorage.getItem('isFirstLogin');
    const name = sessionStorage.getItem('name') || 'User';
    if (isFirstLogin === 'true') {
      this.toastr.success(`Welcome, ${name}! `, 'Login Successful', {
        timeOut: 5000,
        positionClass: 'toast-top-right',
      });
      sessionStorage.setItem('isFirstLogin', 'false');
    }
    this.getArtistNames();
    this.getAllSongcontentPage();
    this.getAdditionalDocs();
    this.loadDashboardStats();
  }

  ngAfterViewInit(): void {
    // Initialize scroll position after view renders
  }

  loadDashboardStats(): void {
  const cpId = sessionStorage.getItem('id');
  if (!cpId) return;

  this.contentUploadService.getDashboardStats(cpId).subscribe({
    next: (res: any) => {
      this.totalUploadedSongs = res.totalSongs || 0;
      this.totalApprovedSongs = res.totalApprovedSongs || 0;
    },
    error: (err) => {
      console.error("Error loading dashboard stats", err);
      this.totalUploadedSongs = 0;
      this.totalApprovedSongs = 0;
    }
  });
}




  private createRow(song?: any): FormGroup {
    return this.fb.group({
      id: new FormControl(song?.id ?? null),
      artistId: new FormControl(song?.artistId ?? ''),
      artistName: new FormControl(song?.artistName ?? ''),
      artistEmail: new FormControl(song?.artistEmail ?? ''),
      albumName: new FormControl(song?.albumName ?? ''),
      songName: new FormControl(song?.songName ?? ''),
      genre: new FormControl(song?.genre ?? ''),
      uploadDate: new FormControl(song?.uploadDate ?? ''), // yyyy-MM-dd in UI
      cpName: new FormControl(song?.cpName ?? ''),
      country: new FormControl(song?.country ?? ''),
      mnoId: new FormControl(song?.mnoId ?? ''),
      mnoName: new FormControl(song?.mnoName ?? ''),
      audioFileUrl: new FormControl(song?.audioFileUrl ?? ''),
      audioFile: new FormControl<File | null>(null),
      qrCodeUrl: new FormControl(song?.qrCodeUrl ?? ''),
      fromDate: new FormControl(song?.fromDate ?? ''),
      toDate: new FormControl(song?.toDate ?? ''),
      songCode: new FormControl(song?.songCode ?? ''),
      active: new FormControl(song?.active ?? ''),
      contractCode: new FormControl(song?.contractCode ?? ''),
      contractFileUrl: new FormControl(song?.contractFileUrl ?? ''),
      songDescription: new FormControl(song?.songDescription ?? ''),
      language: new FormControl(song?.language ?? ''),
      songYear: new FormControl(song?.songYear ?? ''),
      subCategory: new FormControl(song?.subCategory ?? ''),
      category: new FormControl(song?.category ?? ''),
      approvedByUser: new FormControl(!!song?.approvedByUser),
      songDuration: new FormControl(song?.songDuration ?? '')


    });
  }

  getAdditionalDocs(): void {
    const cpId = sessionStorage.getItem('id');
    if (!cpId) return;

    this.contentUploadService.getAdditionalDoc(cpId).subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          // Filter to keep only unique file names
          const uniqueFiles = res.filter(
            (doc, index, self) =>
              index === self.findIndex((d) => d.fileName === doc.fileName)
          );

          this.additionalDocs = uniqueFiles;
        } else {
          this.additionalDocs = [];
        }
      },
      error: (err: any) => {
        this.additionalDocs = [];
      },
    });
  }

  goToSongPage(page: number | string) {
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    if (pageNum >= 0 && pageNum < this.totalPages) {
      this.currentPage = pageNum;
      this.getAllSongcontentPage();
    }
  }

  openPreview(rowIndex: number) {
    const row = this.uploads.at(rowIndex);

    const mainUrl = row.get('contractFileUrl')?.value;
    const code = row.get('contractCode')?.value;

    // Filter additionalDocs based on contract code or song ID
    // const filteredDocs = this.additionalDocs.filter((d: any) =>
    //   d.contractCode === code || d.songId === row.get("song")?.value
    // );

    this.previewData = {
      mainUrl: mainUrl,
      docs: this.additionalDocs,
      fileName: this.getFileName(mainUrl)
    };

    // Open Bootstrap Modal
    const modal = new (window as any).bootstrap.Modal(
      document.getElementById('previewModal')
    );
    modal.show();
  }

  getFileName(url: string): string {
    if (!url) return '';
    return url.substring(url.lastIndexOf('/') + 1);
  }


  getAllSongcontent(): void {
    const id = sessionStorage.getItem('id');
    if (!id) {
      return;
    }

    this.dashboardService.getAllSongContent(id).subscribe({
      next: (response: any) => {
        const list = Array.isArray(response?.data) ? response.data : [];
        const approvedList = list.filter((item: any) => item.approvedByUser === true && item.active === true);

        const uploads = this.form.get('uploads') as FormArray;
        // Clear existing rows
        uploads.clear();

        // Add rows dynamically
        approvedList.forEach((item: any) => {
          console.log('Raw item from backend:', item);
          const normalized = {
            id: item.id ?? null,
            artistId: item.artist?.id ?? item.artistId ?? '',
            artistName: item.artist?.artistName ?? item.artistName ?? '',
            albumName: item.albumName ?? '',
            songName: item.songName ?? '',
            genre: item.genre ?? '',
            qrCodeUrl: item.qrCodeUrl ?? '',
            uploadDate: item.uploadDate ? String(item.uploadDate).split('T')[0] : '',
            cpName: item.cpName ?? '',
            fromDate: item.fromDate ? String(item.fromDate).split('T')[0] : '',
            toDate: item.toDate ? String(item.toDate).split('T')[0] : '',
            country: item.country ?? '',
            mnoId: item.mno?.id ?? item.mnoId ?? '',
            mnoName: item.mno?.name ?? item.mnoName ?? item.mno ?? '',
            audioFileUrl: item.audioFileUrl ?? '',
            songCode: item.songCode ?? '',
            active: item.active ?? '',
            contractCode: item.contractCode ?? '',
            contractFileUrl: item.contractFileUrl ?? '',
            artistEmail: this.artistList.find(a => a.id === item.artistId)?.artistEmail || '',
            songDescription: item.songDescription ?? '',
            language: item.language ?? '',
            songYear: item.songYear ?? '',
            subCategory: item.subCategory ?? '',
            category: item.category ?? '',
            songDuration: item.songDuration ?? ''
          };

          uploads.push(this.createRow(normalized));

        });
      },
      error: (err: any) => {
      }
    });
  }

  getAllSongcontentPage(): void {
    const id = sessionStorage.getItem('id');
    if (!id) { return; }

    this.dashboardService.getAllSongContentPage(id, this.currentPage, this.pageSize, this.searchText)
      .subscribe({
        next: (response: any) => {
          const pageData = response?.data || {};
          const list = pageData.content || [];
          // this.totalUploadedSongs = pageData.totalElements || 0;
          this.totalPages = pageData.totalPages;

          const approvedList = list.filter((item: any) =>
            item.approvedByUser === true && item.active === true);
          // this.totalApprovedSongs = approvedList.length;
          const uploads = this.form.get('uploads') as FormArray;
          uploads.clear();

          approvedList.forEach((item: any) => {
            const normalized = {
              id: item.id ?? null,
              artistId: item.artist?.id ?? item.artistId ?? '',
              artistName: item.artist?.artistName ?? item.artistName ?? '',
              albumName: item.albumName ?? '',
              songName: item.songName ?? '',
              genre: item.genre ?? '',
              qrCodeUrl: item.qrCodeUrl ?? '',
              uploadDate: item.uploadDate ? String(item.uploadDate).split('T')[0] : '',
              cpName: item.cpName ?? '',
              fromDate: item.fromDate ? String(item.fromDate).split('T')[0] : '',
              toDate: item.toDate ? String(item.toDate).split('T')[0] : '',
              country: item.country ?? '',
              mnoId: item.mno?.id ?? item.mnoId ?? '',
              mnoName: item.mno?.name ?? item.mnoName ?? item.mno ?? '',
              audioFileUrl: item.audioFileUrl ?? '',
              songCode: item.songCode ?? '',
              active: item.active ?? '',
              contractCode: item.contractCode ?? '',
              contractFileUrl: item.contractFileUrl ?? '',
              artistEmail: this.artistList.find(a => a.id === item.artistId)?.artistEmail || '',
              songDescription: item.songDescription ?? '',
              language: item.language ?? '',
              songYear: item.songYear ?? '',
              approvedByUser: item.approvedByUser === true || item.approvedByUser === 'true',
              songDuration: item.songDuration ?? '',
              category: item.category ?? '',
              subCategory: item.subCategory ?? ''

            };

            uploads.push(this.createRow(normalized));
          });
        },
        error: (err: any) => { }
      });
  }

  getSongs(): void {
    this.dashboardService.getSongs().subscribe({
      next: (response: any) => {
        this.songs = Array.isArray(response.data) ? response.data : [];
      },
      error: (err) => {
        this.songs = [];
      }
    });
  }
searchText: string = '';
searchTimeout: any;

onSearchChange() {
  clearTimeout(this.searchTimeout);

  this.searchTimeout = setTimeout(() => {
       this.currentPage = 0; 
    this.getAllSongcontentPage(); 
  }, 400);
}

  toggleAudio(i: number) {
    const audio = document.getElementById(`audio-player-${i}`) as HTMLAudioElement | null;

    if (audio) {
      if (this.isPlaying[i]) {
        audio.pause();
        this.isPlaying[i] = false;
      } else {
        // Pause all other audios first
        this.isPlaying.forEach((_, index) => {
          const otherAudio = document.getElementById(`audio-player-${index}`) as HTMLAudioElement | null;
          if (otherAudio) otherAudio.pause();
          this.isPlaying[index] = false;
        });

        audio.play();
        this.isPlaying[i] = true;

        // Reset when audio ends
        audio.onended = () => {
          this.isPlaying[i] = false;
        };
      }
    }
  }

  openQrPopup(url: string) {
    this.dialog.open(QrPopupComponent, {
      data: { url },
      width: '300px',          // dialog width
      maxHeight: '80vh',       // optional
      panelClass: 'custom-qr-dialog' // optional custom styling
    });
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



  downloadContract(fileUrl: string): void {
    if (!fileUrl) {
      this.toastr.error("No contract file available");
      return;
    }
    window.open(fileUrl, "_blank"); // opens in new tab
  }

  // Scroll Slider Methods
  onTableScroll(value: string): void {
    const scrollPercent = parseInt(value, 10);
    if (this.tableScrollContainer) {
      const element = this.tableScrollContainer.nativeElement;
      const maxScroll = element.scrollWidth - element.clientWidth;
      element.scrollLeft = (scrollPercent / 100) * maxScroll;
    }
  }

  updateScrollSlider(): void {
    if (this.tableScrollContainer && this.tableScrollSlider) {
      const element = this.tableScrollContainer.nativeElement;
      const maxScroll = element.scrollWidth - element.clientWidth;
      const scrollPercent = (element.scrollLeft / maxScroll) * 100;
      this.scrollPosition = Math.min(scrollPercent, 100);
    }
  }

}
