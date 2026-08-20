import { Component, OnInit } from '@angular/core';
import { UserApprovalService } from 'src/app/service/user-service/user-approval.service';
import { UserApproval } from 'src/app/models/user-models/user-approval.model';
import { MatDialog } from '@angular/material/dialog';
import { QrPopupComponent } from 'src/app/shared/components/qr-popup-component/qr-popup-component.component';
import { ToastrService } from 'ngx-toastr';
import { ContentUploadService } from 'src/app/service/cp-service/content-upload.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  approvals: UserApproval[] = [];
  isPlaying: boolean[] = [];

  currentSongPage = 0;
  songPageSize = 10;
  songTotalPages = 0;
  selectedCp: string = 'all';
  uniqueCpList: any[] = [];
  filteredApprovals: any[] = [];
  additionalDocs: any;
  previewData: any = null;
  searchText: string = '';
  constructor(
    private approvalService: UserApprovalService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private contentUploadService: ContentUploadService
  ) {}

  ngOnInit(): void {
    const isFirstLogin = sessionStorage.getItem('isFirstLogin');
    const name = sessionStorage.getItem('name') || 'User';
    if (isFirstLogin === 'true') {
      this.toastr.success(`Welcome, ${name}! `, 'Login Successful', {
        timeOut: 5000,
        positionClass: 'toast-top-right',
      });
      sessionStorage.setItem('isFirstLogin', 'false');
    }

    const userId = Number(sessionStorage.getItem('id'));
    if (userId) this.getUserSongContentPage(userId);
    this.getAllAdditionalDocs();
  }

  goToSongPage(page: number) {
    const userId = Number(sessionStorage.getItem('id'));
    if (page >= 0 && page < this.songTotalPages) {
      this.currentSongPage = page;
      this.getUserSongContentPage(userId); 
    }
  }

  getUserSongContentPage(userId: number): void {
    this.approvalService
      .getUserContentPage(userId, this.currentSongPage, this.songPageSize, this.searchText )
      .subscribe({
        next: (response: any) => {
          const pageData = response?.data || {};
          const list = pageData.content || [];

          // Pagination
          this.songTotalPages = pageData.totalPages || 0;
          this.currentSongPage = pageData.currentPage || 0;

          // Filter approved + active
          const approvedSongs = list.filter(
            (item: any) =>
              item.active === true &&
              item.approvedByUser != null
          );

          this.uniqueCpList = [
            ...new Set(list.map((x: any) => x.cpName).filter(Boolean)),
          ];

          this.approvals = approvedSongs.map((item: any) => ({
            ...item,
            artist: item.artistName,
            album: item.albumName,
            songName: item.songName,
            songDescription: item.songDescription,
            language: item.language,
            songYear: item.songYear,
            audioFileUrl: item.audioFileUrl,
            genre: item.genre,
            uploadDate: item.uploadDate?.split('T')[0] || '',
            cp: item.cpName,
            fromDate: item.fromDate?.split('T')[0] || '',
            toDate: item.toDate?.split('T')[0] || '',
            country: item.country,
            mno: item.mnoName || item.mno,
            songCode: item.songCode,
            qrUrl: item.qrCodeUrl,
            contractFileUrl: item.contractFileUrl,
            approved: item.approvedByUser,
            contractCode: item.contractCode ?? '',
            subCategory: item.subCategory ?? '',
            category: item.category ?? '',
            duration: item.songDuration ?? ''
          }));

          this.filterSongs();

          this.isPlaying = Array(this.approvals.length).fill(false);
        },

        error: () => {
          this.approvals = [];
          this.filteredApprovals = [];
        },
      });
  }

filterSongs() {
  let data = this.approvals;

  // Apply CP filter first
  if (this.selectedCp !== 'all') {
    data = data.filter((song) => song.cp === this.selectedCp);
  }
  this.filteredApprovals = data;
}

  searchTimeout: any;

onSearchChange() {
  clearTimeout(this.searchTimeout);

  this.searchTimeout = setTimeout(() => {
    const userId = Number(sessionStorage.getItem('id'));
    this.currentSongPage = 0; 
    this.getUserSongContentPage(userId);
  }, 400);
}

  toggleAudio(i: number) {
    const audio = document.getElementById(
      `audio-player-${i}`
    ) as HTMLAudioElement | null;
    if (!audio) return;

    if (this.isPlaying[i]) {
      audio.pause();
      this.isPlaying[i] = false;
    } else {
      this.isPlaying.forEach((_, index) => {
        const otherAudio = document.getElementById(
          `audio-player-${index}`
        ) as HTMLAudioElement | null;
        if (otherAudio) otherAudio.pause();
        this.isPlaying[index] = false;
      });
      audio.play();
      this.isPlaying[i] = true;
      audio.onended = () => (this.isPlaying[i] = false);
    }
  }

  openQrPopup(url: string) {
    this.dialog.open(QrPopupComponent, {
      data: { url },
      width: '300px',
      maxHeight: '80vh',
      panelClass: 'custom-qr-dialog',
    });
  }

  downloadContract(url: string | undefined) {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = url.split('/').pop() || 'contract.pdf';
    link.click();
  }

  getAllAdditionalDocs(): void {
    const cpId = sessionStorage.getItem('id');
    if (!cpId) return;

    this.contentUploadService.getAllAdditionalDoc().subscribe({
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

  openPreview(rowIndex: number) {
    const row = this.filteredApprovals[rowIndex];

    const mainUrl = row.contractFileUrl;

    // Filter additionalDocs based on contract code or song ID
    const filteredDocs = this.additionalDocs.filter(
      (d: any) => d.cpId === row.cpId
    );

    this.previewData = {
      mainUrl: mainUrl,
      docs: filteredDocs,
    };

    // Open Bootstrap Modal
    const modal = new (window as any).bootstrap.Modal(
      document.getElementById('previewModal')
    );
    modal.show();
  }
}
