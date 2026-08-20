import { AfterViewInit, Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { MnoApproval } from 'src/app/models/mno-models/mno-approval.model';
import { MnoSong } from 'src/app/models/mno-models/mno-song.model';
import { ApprovalService } from 'src/app/service/artist-service/artist-approval.service';
import { ContentUploadService } from 'src/app/service/cp-service/content-upload.service';
import { MnoApprovalService } from 'src/app/service/mno-service/mno-approval.service';
import { MnoDashboardService } from 'src/app/service/mno-service/mno-dashboard.service';
import { QrPopupComponent } from 'src/app/shared/components/qr-popup-component/qr-popup-component.component';
declare var $: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  selectedApprovalMap: Record<number, boolean> = {};
  globalSelectAll = false;
  selectedCp: string = 'all';
  uniqueCpList: any[] = [];
  filteredApprovals: any[] = [];

  mnoSongs: MnoSong[] = [];
  currentSongPage = 0;
  songPageSize = 10;
  songTotalPages = 0;
  totalItems: any;

  approvals: (MnoApproval & { controls: FormGroup })[] = [];
  artistList: any[] = [];
  mnoLogins: any[] = [];

  isPlaying: boolean[] = [];
  additionalDocs: any;
  previewData: any = null;

  constructor(
    private approvalService: ApprovalService,
    private fb: FormBuilder,
    private mnoApprovalService: MnoApprovalService,
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

    const mnoId = Number(sessionStorage.getItem('id'));
    if (mnoId) {
      this.getMnoSongContentPage(mnoId);
    }
    this.getArtistLoginList();
    this.getMnoLoginList();
    this.getAllAdditionalDocs();
  }

  getMnoSongContent(mnoId: number): void {
    this.mnoApprovalService.getMnoSongContent(mnoId).subscribe({
      next: (response: any) => {
        if (Array.isArray(response.data)) {
          const approvedSongs = response.data.filter(
            (item: any) => item.approvedByMno !== null && item.active === true
          );

          this.approvals = approvedSongs.map((item: any) => {
            const song: MnoApproval = {
              id: item.id || null,
              artist: item.artist?.name || item.artistName || '',
              album: item.albumName || '',
              songName: item.songName || '',
              genre: item.genre || '',
              uploadDate: item.uploadDate?.split('T')[0] || '',
              cp: item.cpName || '',
              fromDate: item.fromDate?.split('T')[0] || '',
              toDate: item.toDate?.split('T')[0] || '',
              country: item.country || '',
              mno: item.mno?.name || item.mno || '',
              approvedByMno: item.approvedByMno ?? null,
              contractFileUrl: item.contractFileUrl || '',
              expiryDate: item.expiryDate?.split('T')[0] || '',
              audioFileUrl: item.audioFileUrl || '',
              rejectionReason: item.rejectionReason || '',
              songCode: item.songCode || '',
              qrUrl: item.qrCodeUrl || '',
              licensedCountry: item.licensedCountry || '',
              subCategory: item.subCategory ?? '',
              category: item.category ?? '',
            };

            return {
              ...song,
              controls: this.fb.group({
                approved: new FormControl(song.approvedByMno),
              }),
            };
          });
        } else {
          this.approvals = [];
        }
      },
      error: () => {
        this.approvals = [];
      },
    });
  }

  // getMnoSongContentPage(mnoId: number): void {
  //   this.mnoApprovalService
  //     .getMnoSongContentPage(mnoId, this.currentSongPage, this.songPageSize)
  //     .subscribe({
  //       next: (response: any) => {
  //         const pageData = response?.data || {};
  //         console.log('Page Data:', pageData);
  //         // Paginated content (THIS IS THE MAIN FIX)
  //         const list = pageData.content || [];

  //         // Pagination values
  //         this.songTotalPages = pageData.totalPages || 0;
  //         this.totalItems = pageData.totalItems || 0;
  //         this.currentSongPage = pageData.currentPage || 0;

  //         // Filter active + (optionally approved/unapproved)
  //         const approvedSongs = list.filter(
  //           (item: any) => item.approvedByMno !== null  && item.active === true
  //         );

  //         // Map to UI structure
  //         this.approvals = approvedSongs.map((item: any) => {

  //           // Respect global toggle or previously selected values
  //           const approvedValue =
  //             this.selectedApprovalMap[item.id] ??
  //             (this.globalSelectAll ? true : item.approvedByMno);

  //           const song: MnoApproval = {
  //             id: item.id || null,
  //             artist: item.artist?.name || item.artistName || '',
  //             album: item.albumName || '',
  //             songName: item.songName || '',
  //             genre: item.genre || '',
  //             uploadDate: item.uploadDate?.split('T')[0] || '',
  //             cp: item.cpName || '',
  //             fromDate: item.fromDate?.split('T')[0] || '',
  //             toDate: item.toDate?.split('T')[0] || '',
  //             country: item.country || '',
  //             mno: item.mno?.name || item.mno || '',
  //             approvedByMno: approvedValue,
  //             contractFileUrl: item.contractFileUrl || '',
  //             expiryDate: item.expiryDate?.split('T')[0] || '',
  //             audioFileUrl: item.audioFileUrl || '',
  //             rejectionReason: item.rejectionReason || '',
  //             songCode: item.songCode || '',
  //             qrUrl: item.qrCodeUrl || '',
  //             licensedCountry: item.licensedCountry || ''
  //           };

  //           return {
  //             ...song,
  //             controls: this.fb.group({
  //               approved: new FormControl(approvedValue)
  //             })
  //           };
  //         });
  //       },

  //       error: () => {
  //         this.approvals = [];
  //       }
  //     });
  // }
  getMnoSongContentPage(mnoId: number): void {
    this.mnoApprovalService
      .getMnoSongContentPage(mnoId, this.currentSongPage, this.songPageSize)
      .subscribe({
        next: (response: any) => {
          const pageData = response?.data || {};
          const list = pageData.content || [];

          // Pagination values
          this.songTotalPages = pageData.totalPages || 0;
          this.totalItems = pageData.totalItems || 0;
          this.currentSongPage = pageData.currentPage || 0;

          // Filter approved + active
          const approvedSongs = list.filter(
            (item: any) => item.approvedByMno !== null && item.active === true
          );

          // ⭐ Extract unique CP list
          this.uniqueCpList = [
            ...new Set(approvedSongs.map((x: any) => x.cpName).filter(Boolean)),
          ];

          // Map to UI format
          this.approvals = approvedSongs.map((item: any) => {
            return {
              id: item.id || null,
              artist: item.artist?.name || item.artistName || '',
              album: item.albumName || '',
              songName: item.songName || '',
              genre: item.genre || '',
              uploadDate: item.uploadDate?.split('T')[0] || '',
              cp: item.cpName || '',
              fromDate: item.fromDate?.split('T')[0] || '',
              toDate: item.toDate?.split('T')[0] || '',
              country: item.country || '',
              mno: item.mno?.name || item.mno || '',
              approvedByMno: item.approvedByMno,
              contractFileUrl: item.contractFileUrl || '',
              expiryDate: item.expiryDate?.split('T')[0] || '',
              audioFileUrl: item.audioFileUrl || '',
              songCode: item.songCode || '',
              qrUrl: item.qrCodeUrl || '',
              subCategory: item.subCategory ?? '',
              category: item.category ?? '',
              cpId: item.cpId,
            };
          });

          // Apply CP filter
          this.filterDashboard();

          // Reset playing array
          this.isPlaying = Array(this.approvals.length).fill(false);
        },

        error: () => {
          this.approvals = [];
          this.filteredApprovals = [];
        },
      });
  }

  filterDashboard() {
    if (this.selectedCp === 'all') {
      this.filteredApprovals = this.approvals;
      return;
    }

    this.filteredApprovals = this.approvals.filter(
      (song) => song.cp === this.selectedCp
    );
  }

  goToSongPage(page: number) {
    const userId = Number(sessionStorage.getItem('id'));
    if (page >= 0 && page < this.songTotalPages) {
      this.currentSongPage = page;
      this.getMnoSongContentPage(userId); // call your loading function
    }
  }

  getArtistLoginList(): void {
    this.approvalService.getArtistLogins().subscribe({
      next: (response: any) => {
        this.artistList = Array.isArray(response.data) ? response.data : [];
      },
      error: (err: any) => {
        console.error('Failed to fetch artist logins:', err);
        this.artistList = [];
      },
    });
  }

  getMnoLoginList(): void {
    this.approvalService.getMnoLogins().subscribe({
      next: (response: any) => {
        this.mnoLogins = Array.isArray(response.data) ? response.data : [];
      },
      error: (err: any) => {
        console.error('Failed to fetch MNO logins:', err);
        this.mnoLogins = [];
      },
    });
  }

  toggleAudio(i: number) {
    const audio = document.getElementById(
      `audio-player-${i}`
    ) as HTMLAudioElement | null;

    if (audio) {
      if (this.isPlaying[i]) {
        audio.pause();
        this.isPlaying[i] = false;
      } else {
        // Pause all other audios first
        this.isPlaying.forEach((_, index) => {
          const otherAudio = document.getElementById(
            `audio-player-${index}`
          ) as HTMLAudioElement | null;
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
      width: '300px', // dialog width
      maxHeight: '80vh', // optional
      panelClass: 'custom-qr-dialog', // optional custom styling
    });
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
