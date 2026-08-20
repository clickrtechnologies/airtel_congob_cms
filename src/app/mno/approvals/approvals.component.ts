import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { MnoApproval } from 'src/app/models/mno-models/mno-approval.model';
import { ApprovalService } from 'src/app/service/artist-service/artist-approval.service';
import { ContentUploadService } from 'src/app/service/cp-service/content-upload.service';
import { MnoApprovalService } from 'src/app/service/mno-service/mno-approval.service';
import { QrPopupComponent } from 'src/app/shared/components/qr-popup-component/qr-popup-component.component';

@Component({
  selector: 'app-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.css'],
})
export class ApprovalsComponent {
  approvals: (MnoApproval & { controls: FormGroup })[] = [];
  artistList: any[] = [];
  mnoLogins: any[] = [];
  isSaving = false;
  selectAllChecked = false;
  selectedApprovalMap: Record<number, boolean> = {};
  globalSelectAll = false;
  currentSongPage = 0;
  songPageSize = 10000;
  songTotalPages = 0;
  totalItems: any;

  selectedCp: string = 'all';
  uniqueCpList: any[] = [];
  filteredApprovals: any[] = [];

  additionalDocs: any;
  previewData: any = null;
  isPlaying: boolean[] = [];

  constructor(
    private approvalService: ApprovalService,
    private fb: FormBuilder,
    private mnoApprovalService: MnoApprovalService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private contentUploadService: ContentUploadService
  ) {}

  ngOnInit(): void {
    const mnoId = Number(sessionStorage.getItem('id'));
    if (mnoId) {
      this.getMnoSongContentPage(mnoId);
    }
    this.getAllAdditionalDocs();
    // this.getArtistLoginList();
    // this.getMnoLoginList();
  }

  goToSongPage(page: number) {
    const userId = Number(sessionStorage.getItem('id'));
    if (page >= 0 && page < this.songTotalPages) {
      this.currentSongPage = page;
      this.getMnoSongContentPage(userId); // call your loading function
    }
  }

  // getMnoSongContentPage(mnoId: number): void {
  //   this.mnoApprovalService
  //     .getMnoSongContentPage(mnoId, this.currentSongPage, this.songPageSize)
  //     .subscribe({
  //       next: (response: any) => {
  //         const pageData = response?.data || {};

  //         // Paginated content (THIS IS THE MAIN FIX)
  //         const list = pageData.content || [];

  //         // Pagination values
  //         this.songTotalPages = pageData.totalPages || 0;
  //         this.totalItems = pageData.totalItems || 0;
  //         this.currentSongPage = pageData.currentPage || 0;

  //         // Filter active + (optionally approved/unapproved)
  //         const approvedSongs = list.filter(
  //           (item: any) => item.approvedByMno === null && item.approvedByUser === true && item.active === true
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
  //               approved: new FormControl(this.selectedApprovalMap[item.id] ?? approvedValue)

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

          // Pagination data
          this.songTotalPages = pageData.totalPages || 0;
          this.totalItems = pageData.totalItems || 0;
          this.currentSongPage = pageData.currentPage || 0;

          // Filter relevant songs
          const approvedSongs = list.filter(
            (item: any) =>
              item.approvedByMno === null &&
              item.approvedByUser === true &&
              item.active === true
          );

          // ⭐ Extract Unique CP list
          this.uniqueCpList = [
            ...new Set(approvedSongs.map((x: any) => x.cpName).filter(Boolean)),
          ];

          // MAP data into UI structure
          this.approvals = approvedSongs.map((item: any) => {
            const approvedValue =
              this.selectedApprovalMap[item.id] ??
              (this.globalSelectAll ? true : item.approvedByMno);

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
              approvedByMno: approvedValue,
              contractFileUrl: item.contractFileUrl || '',
              expiryDate: item.expiryDate?.split('T')[0] || '',
              audioFileUrl: item.audioFileUrl || '',
              rejectionReason: item.rejectionReason || '',
              songCode: item.songCode || '',
              qrUrl: item.qrCodeUrl || '',
              licensedCountry: item.licensedCountry || '',
              cpId: item.cpId,
              subCategory: item.subCategory ?? '',
              category: item.category ?? '',
            };

            return {
              ...song,
              controls: this.fb.group({
                approved: new FormControl(approvedValue),
              }),
            };
          });

          // Apply CP filter
          this.filterMnoApprovals();
        },

        error: () => {
          this.approvals = [];
          this.filteredApprovals = [];
        },
      });
  }

  filterMnoApprovals() {
    if (this.selectedCp === 'all') {
      this.filteredApprovals = this.approvals;
      return;
    }

    this.filteredApprovals = this.approvals.filter(
      (song) => song.cp === this.selectedCp
    );
  }

  getMnoSongContent(mnoId: number): void {
    this.mnoApprovalService.getMnoSongContent(mnoId).subscribe({
      next: (response: any) => {
        if (Array.isArray(response.data)) {
          const approvedSongs = response.data.filter(
            (item: any) =>
              item.approvedByMno === null &&
              item.approvedByUser === true &&
              item.active === true
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
              cpId: item.cpId,
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
      error: (err: any) => {
        console.error('Failed to fetch MNO song content:', err);
        this.approvals = [];
      },
    });
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

  saveApproval(index: number): void {
    const song = this.approvals[index];
    const approved = song.controls?.get('approved')?.value;
    const rejectionReason = song.rejectionReason || '';
    this.isSaving = true; // show loader
    const requestDTO = {
      id: song.id,
      approvedByMno: approved,
      rejectionReason: approved ? '' : rejectionReason,
    };

    this.mnoApprovalService.approveSong(requestDTO).subscribe({
      next: () => {
        this.toastr.success('Approval saved successfully!');
        song.approvedByMno = approved;
        this.getMnoSongContentPage(Number(sessionStorage.getItem('id')));
        song.controls.setValue({ rejectionReason: '' }); // Reset the form control
        this.isSaving = false; // hide loader
      },
      error: (err: any) => {
        console.error('Failed to save approval', err);
        this.toastr.error('Failed to save approval. Please try again.');
        this.isSaving = false; // hide loader
      },
    });
  }

  saveAllApprovals(): void {
    this.isSaving = true; // show loader
    if (this.approvals.length === 0) {
      this.toastr.info('No records to save.');
      return;
    }

    const requests = this.approvals.map((song) => {
      const approved = song.controls.get('approved')?.value;
      return {
        id: song.id,
        approvedByMno: approved,
        rejectionReason: approved
          ? ''
          : song.rejectionReason || 'Rejected by MNO',
      };
    });

    this.mnoApprovalService.bulkApproveSongs(requests).subscribe({
      next: () => {
        this.toastr.success('Selected approvals saved successfully!');
        this.getMnoSongContentPage(Number(sessionStorage.getItem('id')));
        this.isSaving = false; // show loader
      },
      error: (err: any) => {
        console.error('Failed to save approvals:', err);
        this.toastr.error('Failed to save approvals. Please try again.');
        this.isSaving = false; // show loader
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

  downloadContract(fileUrl: string): void {
    if (!fileUrl) {
      console.error('No contract file available');
      return;
    }
    window.open(fileUrl, '_blank'); // opens in new tab
  }

  openQrPopup(url: string) {
    this.dialog.open(QrPopupComponent, {
      data: { url },
      width: '300px', // dialog width
      maxHeight: '80vh', // optional
      panelClass: 'custom-qr-dialog', // optional custom styling
    });
  }

  // Toggle all approvals when header checkbox clicked
  // selectAllToggle() {
  //   const toggle = !this.selectAllChecked;
  //   this.approvals.forEach(song => song.controls.get('approved')?.setValue(toggle));
  //   this.selectAllChecked = toggle;
  // }
  selectAllToggle(event: any) {
    // flip header checkbox
    this.selectAllChecked = !this.selectAllChecked;

    // enable global select all state
    this.globalSelectAll = this.selectAllChecked;

    this.approvals.forEach((song) => {
      // Update global map
      this.selectedApprovalMap[song.id] = this.globalSelectAll;

      // Update model
      song.approvedByMno = this.globalSelectAll;

      // Update form control (UI)
      song.controls.get('approved')?.setValue(this.globalSelectAll);
    });
  }

  // Compute header label dynamically
  get selectAllLabel(): string {
    return this.selectAllChecked ? 'Reject All' : 'Approve All';
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
