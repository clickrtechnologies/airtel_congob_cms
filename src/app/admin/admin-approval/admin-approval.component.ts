import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { UserApproval } from 'src/app/models/user-models/user-approval.model';
import { ContentUploadService } from 'src/app/service/cp-service/content-upload.service';
import { UserApprovalService } from 'src/app/service/user-service/user-approval.service';
import { QrPopupComponent } from 'src/app/shared/components/qr-popup-component/qr-popup-component.component';
@Component({
  selector: 'app-admin-approval',
  templateUrl: './admin-approval.component.html',
  styleUrls: ['./admin-approval.component.css']
})
export class AdminApprovalComponent {
approvals: (UserApproval & { controls: FormGroup })[] = [];
  userList: any;
  mnoLogins: any;
  isPlaying: boolean[] = [];
  isLoading = false;
  selectedApprovalMap: Record<number, boolean> = {};
  globalSelectAll = false;
  selectedCp: string = 'all';
  uniqueCpList: string[] = [];
  filteredApprovals: any[] = []; // To store filtered data

  currentSongPage = 0;
  songPageSize = 1000;
  songTotalPages = 0;
  totalItems: any;
  additionalDocs: any;
  previewData: any = null;

  constructor(
    private approvalService: UserApprovalService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private contentUploadService: ContentUploadService
  ) {}

  ngOnInit(): void {
    const userId = Number(sessionStorage.getItem('id'));
    if (userId) {
      // this.getUserSongContent(userId);
      this.getUserSongContentPage(userId);
    }
    this.getAllAdditionalDocs();
  }

  goToSongPage(page: number) {
    const userId = Number(sessionStorage.getItem('id'));
    if (page >= 0 && page < this.songTotalPages) {
      this.currentSongPage = page;
      this.getUserSongContentPage(userId); // call your loading function
    }
  }

  getUserSongContentPage(userId: number): void {
    this.approvalService
      .getUserContentPage(userId, this.currentSongPage, this.songPageSize)
      .subscribe({
        next: (response: any) => {
          const pageData = response?.data || {};
          const list = pageData.content || [];

          // PAGINATION
          this.songTotalPages = pageData.totalPages || 0;
          this.totalItems = pageData.totalItems || 0;
          this.currentSongPage = pageData.currentPage || 0;

          this.globalSelectAll = true;
          // FILTER only unapproved + active
          const unapprovedSongs = list.filter(
            (item: any) =>
              item.approvedByUser === null &&
              // item.active === true &&
              // item.fromDate != null &&
              item.contractFileUrl != null
          );

          // ⭐ Extract Unique CP List
          const cpValues = list
            .map((x: any) => x.cpName)
            .filter((v: any): v is string => typeof v === 'string');

          this.uniqueCpList = Array.from(new Set<string>(cpValues));

          // MAP data
          this.approvals = unapprovedSongs.map((item: any) => {
            const approvedValue =
              this.selectedApprovalMap[item.id] ??
              (this.globalSelectAll ? true : item.approved);

            const song = {
              id: item.id || null,
              artist: item.artist?.name || item.artistName || '',
              album: item.albumName || '',
              songName: item.songName || '',
              songDescription: item.songDescription || '',
              language: item.language || '',
              genre: item.genre || '',
              uploadDate: item.uploadDate?.split('T')[0] || '',
              cp: item.cpName || '',
              fromDate: item.fromDate?.split('T')[0] || '',
              toDate: item.toDate?.split('T')[0] || '',
              country: item.country || '',
              mno: item.mnoName || item.mno || '',
              approved: approvedValue,
              songCode: item.songCode || '',
              qrUrl: item.qrCodeUrl || '',
              licensedCountry: item.licensedCountry || '',
              active: item.active || '',
              audioFileUrl: item.audioFileUrl || '',
              contractFileUrl: item.contractFileUrl ?? '',
              contractCode: item.contractCode ?? '',
              songYear: item.songYear,
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
          this.filterApprovals();
        },

        error: () => {
          this.approvals = [];
          this.filteredApprovals = [];
        },
      });
  }

  filterApprovals() {
    if (this.selectedCp === 'all') {
      this.filteredApprovals = this.approvals;
      return;
    }

    this.filteredApprovals = this.approvals.filter(
      (song) => song.cp === this.selectedCp
    );
  }

  getUserLoginList(): void {
    this.approvalService.getUserLogins().subscribe({
      next: (response: any) => {
        this.userList = Array.isArray(response.data) ? response.data : [];
      },
      error: (err: any) => {
        console.error('Failed to fetch user logins:', err);
        this.userList = [];
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

  // Save approval for single song
  saveApproval(index: number): void {
    const song = this.approvals[index];
    const approved = song.controls?.get('approved')?.value;

    const requestDTO = {
      id: song.id,
      approvedByUser: approved,
    };

    this.approvalService.approveSong(requestDTO).subscribe({
      next: () => {
        this.toastr.success('Approval saved successfully!');
        song.approved = approved;
        this.getUserSongContentPage(Number(sessionStorage.getItem('id')));
      },
      error: (err: any) => {
        console.error('Failed to save approval', err);
        this.toastr.error('Failed to save approval. Please try again.');
      },
    });
  }

  // Save all approvals
  saveAllApprovals(): void {
    const bulkRequest = this.approvals.map((song) => ({
      id: song.id,
      approvedByUser: song.approved,
    }));

    this.isLoading = true;
    this.approvalService.approveSongsBulk(bulkRequest).subscribe({
      next: () => {
        this.toastr.success('Selected approvals saved successfully!');
        this.getUserSongContentPage(Number(sessionStorage.getItem('id')));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to save approvals', err);
        this.toastr.error('Failed to save approvals. Please try again.');
        this.isLoading = false;
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
  }

  get selectAllChecked(): boolean {
    return this.approvals.every((song) => song.approved === true);
  }

  get selectAllLabel(): string {
    return this.selectAllChecked ? 'Reject All' : 'Approve All';
  }

  // selectAllToggle(event: any) {
  //   const toggle = !this.selectAllChecked;
  //   this.approvals.forEach(song => song.approved = toggle);
  // }

  selectAllToggle(event: any) {
    this.globalSelectAll = !this.globalSelectAll;

    this.approvals.forEach((song) => {
      song.approved = this.globalSelectAll;
      this.selectedApprovalMap[song.id] = this.globalSelectAll;
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

