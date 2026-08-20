import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx-js-style';
import { ReportService } from 'src/app/service/cp-service/reports.service';
import { ContentUploadService } from 'src/app/service/cp-service/content-upload.service';
import { Reports } from 'src/app/models/cp-models/report.model';
 
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  countryList: string[] = [];
  cpList: Array<{ id: number; name: string }> = [];
  isAdminUser = false;

  pageSize = 10;
  currentPage = 1;
  sortColumn = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';
  searchTerm = '';

  mnoList: string[] = [];
    selectedCountry: string = '';
    selectedCp: string = '';
    selectedCpId: number | null = null;
    selectedMno: string = '';
  
    availableYears: string[] = [];
    selectedYear: string = '';
  
    availableMonths: { name: string, value: number }[] = [
      { name: 'January', value: 1 },
      { name: 'February', value: 2 },
      { name: 'March', value: 3 },
      { name: 'April', value: 4 },
      { name: 'May', value: 5 },
      { name: 'June', value: 6 },
      { name: 'July', value: 7 },
      { name: 'August', value: 8 },
      { name: 'September', value: 9 },
      { name: 'October', value: 10 },
      { name: 'November', value: 11 },
      { name: 'December', value: 12 },
    ];
    selectedMonth: number | null = null;
  
    reportsData: Reports[] = [];
Math: any;
  
    constructor(
      private reportsService: ReportService,
      private contentUploadService: ContentUploadService
    ) { }
  
    ngOnInit(): void {
      this.generateYears();
    const role = sessionStorage.getItem('userRole');
    const cpId = Number(sessionStorage.getItem('id'));
    this.isAdminUser = role === 'ROLE_ADMIN';

    if (this.isAdminUser) {
      this.getAllCountryList();
      this.getAllOperatorList();
      this.getCpList();
    } else if (role === 'ROLE_CP') {
      this.getAllCountryList();
      this.getAllOperatorList();
    } else {
      this.getCountryList(cpId);
      this.getOperatorList(cpId);
    }

    this.loadReports();
  }

  getCpList(): void {
    this.contentUploadService.getCpLogins().subscribe({
      next: (res: any) => {
        const cpData = Array.isArray(res?.data) ? res.data : [];
        this.cpList = cpData
          .filter((cp: any) => cp?.role === 'ROLE_CP')
          .map((cp: any) => ({
            id: Number(cp?.id),
            name: cp?.name || ''
          }))
          .filter((cp: { id: number; name: string }) => !!cp.id && !!cp.name);
      },
      error: () => {
        this.cpList = [];
      }
    });
  }
  
    getCountryList(cpId: number): void {

    this.reportsService.getCountries(cpId).subscribe({
      next: (res: any) => {
        this.countryList = Array.isArray(res?.data)
          ? res.data
          : [];
      },
      error: () => {
        this.countryList = [];
      }
    });

  }

  getOperatorList(cpId: number): void {

    this.reportsService.getOperators(cpId).subscribe({
      next: (res: any) => {
        this.mnoList = Array.isArray(res?.data)
          ? res.data
          : [];
      },
      error: () => {
        this.mnoList = [];
      }
    });

  }
  getAllCountryList(): void {

    this.reportsService.getAllCountries().subscribe({
      next: (res: any) => {
        this.countryList = Array.isArray(res?.data)
          ? res.data
          : [];
      },
      error: () => {
        this.countryList = [];
      }
    });

  }

  getAllOperatorList(): void {

    this.reportsService.getAllOperators().subscribe({
      next: (res: any) => {
        this.mnoList = Array.isArray(res?.data)
          ? res.data
          : [];
      },
      error: () => {
        this.mnoList = [];
      }
    });

  }
  
    generateYears(): void {
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 10;
      this.availableYears = [];
      for (let y = currentYear; y >= startYear; y--) {
        this.availableYears.push(y.toString());
      }
    }
  
    loadReports(): void {
      const role = sessionStorage.getItem('userRole');
      const cpIdFromSession = Number(sessionStorage.getItem('id'));
      const isCpOrSpUser = role === 'ROLE_CP' || role === 'ROLE_SP';

      const hasAnyFilter = !!(
        this.selectedCountry ||
        this.selectedMno ||
        this.selectedYear ||
        this.selectedMonth ||
        this.selectedCpId ||
        this.selectedCp
      );

      if (role === 'ROLE_ADMIN' && hasAnyFilter && !this.selectedCpId) {
        return;
      }

      const cpId = role === 'ROLE_ADMIN'
        ? this.selectedCpId ?? undefined
        : isCpOrSpUser
          ? (cpIdFromSession || this.selectedCpId || undefined)
          : cpIdFromSession;

      this.reportsService.getReports(
        this.selectedCountry || undefined,
        this.selectedMno || undefined,
        this.selectedYear ? Number(this.selectedYear) : undefined,
        this.selectedMonth !== null && this.selectedMonth !== undefined ? Number(this.selectedMonth) : undefined,
        cpId
      ).subscribe({
        next: (res: any) => {
          this.reportsData = Array.isArray(res?.data) ? res.data : [];
          this.currentPage = 1;
        },
        error: (err) => console.error('Error loading reports', err)
      });
    }
  
    onCountryChange(): void {
      this.selectedMno = '';
      this.selectedYear = '';
      this.selectedMonth = null;
      this.reportsData = [];
    }

    onCpChange(): void {
      const selected = this.cpList.find(cp => cp.name === this.selectedCp);
      this.selectedCpId = selected ? selected.id : null;
      this.selectedMno = '';
      this.selectedYear = '';
      this.selectedMonth = null;
      this.reportsData = [];
    }
  
    onMnoChange(): void {
      this.selectedYear = '';
      this.selectedMonth = null;
      this.reportsData = [];
    }
  
    onYearChange(): void {
      this.selectedMonth = null;
      this.reportsData = [];
    }
  
    onMonthChange(): void {
      this.loadReports();
    }
  
    // --- Excel Export ---
    exportToExcel(): void {
      if (!this.reportsData || this.reportsData.length === 0) return;
  
      const excelData = this.reportsData.map(r => ({
        'Date': r.date,
        'Country': r.country,
        'MNO': r.mno,
        'Artist': r.artist,
        'Album': r.album,
        'Song': r.song,
        'Genre': r.genre,
        'Downloads': r.downloads,
        'Copy': r.modes?.copy ?? r.copy ?? 0,
        'IVR': r.modes?.ivr ?? r.ivr ?? 0,
        'App': r.modes?.app ?? r.app ?? 0,
        'SMS': r.modes?.sms ?? r.sms ?? 0,
        'USSD': r.modes?.ussd ?? r.ussd ?? 0,
        'WAP': r.modes?.wap ?? r.wap ?? 0,
        'RBT Set': r.rbtSet,
        'CP Name': r.cp,
        'Language': r.language || ''
      }));
  
      const header1 = ['Date', 'Country', 'MNO', 'Artist', 'Album', 'Song', 'Genre', 'Downloads', 'Mode of Download', 'Mode of Download', 'Mode of Download', 'Mode of Download', 'Mode of Download', 'Mode of Download', 'RBT Set', 'CP Name', 'Language'];
      const header2 = ['', '', '', '', '', '', '', '', 'Copy', 'IVR', 'App', 'SMS', 'USSD', 'WAP', '', '', ''];
  
      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([header1, header2]);
      XLSX.utils.sheet_add_json(ws, excelData, { skipHeader: true, origin: 'A3' });
      ws['!merges'] = [{ s: { r: 0, c: 7 }, e: { r: 0, c: 13 } }];
      ws['!cols'] = [
        { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 12 }, { wch: 10 },
        { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
        { wch: 10 }, { wch: 18 }, { wch: 12 }
      ];
  
      const range = XLSX.utils.decode_range(ws['!ref']!);
      for (let R = 0; R <= 1; R++) {
        for (let C = 0; C <= range.e.c; C++) {
          const cell_ref = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[cell_ref]) continue;
          ws[cell_ref].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "0070C0" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } }
            }
          };
        }
      }
  
      ws['!freeze'] = { xSplit: 0, ySplit: 2 };
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Reports');
      XLSX.writeFile(wb, `Reports_${this.selectedCountry}_${this.selectedMno}_${this.selectedYear}_${this.selectedMonth}.xlsx`);
    }

    getTotal(field: keyof Reports): number {
    return this.filteredReports.reduce((sum, row) => {
      const value = row[field];
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);
  }

  get filteredReports(): Reports[] {
    const term = this.searchTerm.trim().toLowerCase();
    const sorted = this.getSortedReports();

    if (!term) {
      return sorted;
    }

    return sorted.filter((row) => {
      const searchable = [
        row.date,
        row.country,
        row.mno,
        row.artist,
        row.album,
        row.song,
        row.genre,
        row.cp,
        row.language,
        row.downloads,
      ]
        .filter((value) => value !== null && value !== undefined)
        .map((value) => String(value).toLowerCase());

      return searchable.some((value) => value.includes(term));
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredReports.length / this.pageSize));
  }

  get visiblePages(): Array<number | 'ellipsis-left' | 'ellipsis-right'> {
    const pages: Array<number | 'ellipsis-left' | 'ellipsis-right'> = [];
    const total = this.totalPages;

    if (total <= 7) {
      for (let page = 1; page <= total; page++) {
        pages.push(page);
      }
      return pages;
    }

    pages.push(1);

    if (this.currentPage > 3) {
      pages.push('ellipsis-left');
    }

    const start = Math.max(2, this.currentPage - 1);
    const end = Math.min(total - 1, this.currentPage + 1);

    for (let page = start; page <= end; page++) {
      pages.push(page);
    }

    if (this.currentPage < total - 2) {
      pages.push('ellipsis-right');
    }

    pages.push(total);
    return pages;
  }

  get paginatedReports(): Reports[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredReports.slice(start, start + this.pageSize);
  }

  getSortedReports(): Reports[] {
    const cloned = [...this.reportsData];

    cloned.sort((a, b) => {
      const left = this.getSortValue(a, this.sortColumn);
      const right = this.getSortValue(b, this.sortColumn);

      if (left < right) return this.sortDirection === 'asc' ? -1 : 1;
      if (left > right) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return cloned;
  }

  getSortValue(row: Reports, column: string): string | number {
    const value = (row as any)[column];

    if (typeof value === 'string' || typeof value === 'number') {
      return value;
    }

    if (value && typeof value === 'object') {
      return value.copy ?? value.ivr ?? value.app ?? 0;
    }

    return 0;
  }

  sortTable(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.currentPage = 1;
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  getModeTotal(mode: keyof Reports['modes']): number {
    return this.filteredReports.reduce((sum, row) => {
      return sum + this.getModeValue(row, mode);
    }, 0);
  }

  getModeValue(row: Reports, mode: keyof Reports['modes']): number {
    const modeValue = row.modes?.[mode];
    const directValue = row[mode] as number | undefined;
    return Number(modeValue ?? directValue ?? 0);
  }

}