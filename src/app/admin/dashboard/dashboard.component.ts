import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AdminDashboardService } from 'src/app/service/admin-service/admin-dashboard.service';
import { QrPopupComponent } from 'src/app/shared/components/qr-popup-component/qr-popup-component.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { CpManagementService } from 'src/app/service/admin-service/cp-management.service';
import { ContentUploadService } from 'src/app/service/cp-service/content-upload.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {

  @ViewChild('tableScrollContainer') tableScrollContainer!: ElementRef;
  @ViewChild('tableScrollSlider') tableScrollSlider!: ElementRef;
@ViewChild('tableScrollContainer') tableContainer!: ElementRef;
  selectedCp: string = 'all'; // default
  uniqueCpList: any[] = [];

  additionalDocs: any;
  previewData: any = null;

  // Columns to be displayed in the Angular Material table
  displayedColumns: string[] = [
    'sno',
    'artistName',
    'albumName',
    'songName',
    'contractFileUrl',
    'expiryDate',
    'audioFileUrl',
    'artistApproval',
    'userApproval',
    'mnoApproval',
  ];

  isPlaying: boolean[] = [];

  currentSongPage = 0;
  songPageSize = 10;
  songTotalPages = 0;

  // Data source for Material Table
  dataSource = new MatTableDataSource<any>([]);

  // Original data array (optional, if you want to keep a copy)
  dashboardData: any[] = [];
  filteredData = this.dashboardData;
  searchTerm: string = '';

  selectedLanguage: string = 'en';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  cpLogins: any;
  cpNames: any;
  scrollPosition: any = 0;
totalUploadedSongs: any;
totalApprovedSongs: any;

  constructor(
    private adminDashboardService: AdminDashboardService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private cpManagementService: CpManagementService,
    private contentUploadService: ContentUploadService
  ) {
    this.translate.addLangs(['en', 'fr']);

    const savedLang = localStorage.getItem('appLanguage') || 'en';
    this.selectedLanguage = savedLang;
    this.translate.setDefaultLang(savedLang);
    this.translate.use(savedLang);
  }

  getCpLoginList(): void {
    this.cpManagementService.getCpLogins().subscribe({
      next: (response: any) => {
        this.cpLogins = Array.isArray(response.data) ? response.data : [];

        // 👉 Extract only names
        this.cpNames = this.cpLogins.map((cp: { name: any }) => cp.name);
      },
      error: (err: any) => {
        this.cpLogins = [];
      },
    });
  }

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
    this.getAdminDashboardPage();
    this.getCpLoginList();
    this.getAllAdditionalDocs();
  }

  goToSongPage(page: number) {
    if (page >= 0 && page < this.songTotalPages) {
      this.currentSongPage = page;
      this.getAdminDashboardPage(); // call your loading function
    }
  }

  getAdminDashboardPage(): void {
    this.adminDashboardService
      .getAdminDashboardPage(this.currentSongPage, this.songPageSize,this.searchTerm  )
      .subscribe({
        next: (response: any) => {
          const pageData = response?.data || {};
          const list = pageData.content || [];

          // Pagination values
          this.songTotalPages = pageData.totalPages || 0;

          // Store raw backend data
          this.dashboardData = list;

          // ✔ Extract unique CP list
          this.uniqueCpList = [
            ...new Set(
              list
                .map((x: any) => x.cpName)
                .filter((v: any): v is string => typeof v === 'string')
            ),
          ];

          // total approved songs
          this.totalApprovedSongs = list.filter(
            (song: any) => song.artistApproval === true &&
              song.userApproval === true 
          ).length;
          // total uploaded songs
          this.totalUploadedSongs = list.length;
          // Apply filters (search + CP filter)
          this.applyFilters();
          // Update Material Table
          this.dataSource.data = this.filteredData;

          // paginator & sort
          if (this.paginator) this.dataSource.paginator = this.paginator;
          if (this.sort) this.dataSource.sort = this.sort;
        },

        error: (err) => {
          console.error('Pagination Load Error:', err);
          this.dashboardData = [];
          this.filteredData = [];
          this.dataSource.data = [];
        },
      });
  }

  filterDashboard() {
    this.applyFilters();
  }

  applyFilters() {
  this.filteredData = this.dashboardData.filter((d) => {
    return this.selectedCp === 'all' || d.cpName === this.selectedCp;
  });
}

  playAudio(fileUrl: string) {
    if (fileUrl) {
      const audio = new Audio(fileUrl);
      audio.play();
    }
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

  searchTimeout: any;

onSearchChange() {
  clearTimeout(this.searchTimeout);

  this.searchTimeout = setTimeout(() => {
    this.currentSongPage = 0;
    this.getAdminDashboardPage();
  }, 400);
}
  downloadContract(fileUrl: string) {
    if (!fileUrl) return;
    window.open(fileUrl, '_blank'); //  opens in new tab
  }

  openQrPopup(url: string) {
    this.dialog.open(QrPopupComponent, {
      data: { url },
      width: '300px', // dialog width
      maxHeight: '80vh', // optional
      panelClass: 'custom-qr-dialog', // optional custom styling
    });
  }

  refreshDashboard() {
    this.getAdminDashboardPage();
  }

  getApprovalIcon(status: boolean | null): string {
    if (status === true) {
      return 'bi bi-check-circle-fill text-success';
    } else if (status === false) {
      return 'bi bi-x-circle-fill text-danger';
    } else {
      return 'bi bi-hourglass-split text-warning';
    }
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
  updateScrollSlider() {
  const el = this.tableContainer.nativeElement;

  const scrollLeft = el.scrollLeft;
  const maxScrollLeft = el.scrollWidth - el.clientWidth;

  this.scrollPosition = (scrollLeft / maxScrollLeft) * 100;
}

  openPreview(rowIndex: number) {
    const row = this.filteredData[rowIndex];

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

  // Scroll Slider Methods for Single Upload Table
  onTableScroll(value: string): void {
    const scrollPercent = parseInt(value, 10);
    this.scrollPosition = scrollPercent;

    if (this.tableScrollContainer) {
      const element = this.tableScrollContainer.nativeElement;
      const maxScroll = element.scrollWidth - element.clientWidth;
      element.scrollLeft = (scrollPercent / 100) * maxScroll;
    }
  }
}
