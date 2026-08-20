import { Component, OnInit } from '@angular/core';
import { Reports } from 'src/app/models/cp-models/report.model';
import { ContentUploadService } from 'src/app/service/cp-service/content-upload.service';
import { ReportService } from 'src/app/service/cp-service/reports.service';
import { MnoReportService } from 'src/app/service/mno-service/mno-report.service';
import * as XLSX from 'xlsx-js-style';

interface ReportData {
  sno: number;
  date: string;
  artistName: string;
  albumName: string;
  songName: string;
  genCat: string;
  downloads: number;
  modes: {
    copy: boolean;
    ivr: boolean;
    app: boolean;
  };
  cpName: string;
}

interface GeoMno {
  name: string;
  months: string[];
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
   countryList: string[] = ['India','RDC', 'Nigeria']; // default countries
    selectedCountry: string = '';
    mnoList: Array<{ id: number; name: string }> = [];
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
   
    constructor(
      private reportsService: ReportService,
      private contentUploadService: ContentUploadService
    ) { }
   
    ngOnInit(): void {
      this.generateYears();
      this.getMnoList();
    }
   
    getMnoList(): void {
      this.contentUploadService.getMnoList().subscribe({
        next: (res: any) => {
          const data = Array.isArray(res?.data) ? res.data : [];
          this.mnoList = data.map((m: any) => ({
            id: m.id,
            name: m.name ?? m.mnoName ?? ''
          }));
        },
        error: (err) => {
          console.error('Failed to fetch MNO list', err);
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
      const mnoId = sessionStorage.getItem('id');
      if (!this.selectedCountry || !this.selectedMno || !this.selectedYear || !this.selectedMonth) return;
   
      this.reportsService.getReports(
        this.selectedCountry,
        this.selectedMno,
        Number(this.selectedYear),
        Number(this.selectedMonth),
        mnoId ? Number(mnoId) : null
        
      ).subscribe({
        next: (res: any) => {
          this.reportsData = Array.isArray(res?.data) ? res.data : [];
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
        'Artist': r.artist,
        'Album': r.album,
        'Song': r.song,
        'Genre': r.genre,
        'Downloads': r.downloads,
        'Copy': r.modes.copy,
        'IVR': r.modes.ivr,
        'App': r.modes.app,
        'SMS': r.modes.sms,
        'USSD': r.modes.ussd,
        'WAP': r.modes.wap,
        'RBT Set': r.rbtSet,
        'CP Name': r.cp
      }));
   
      const header1 = ['Date', 'Artist', 'Album', 'Song', 'Genre', 'Downloads', 'Mode of Download', 'Mode of Download', 'Mode of Download', 'Mode of Download', 'Mode of Download', 'Mode of Download', 'RBT Set', 'CP Name'];
      const header2 = ['', '', '', '', '', '', 'Copy', 'IVR', 'App', 'SMS', 'USSD', 'WAP', '', ''];
   
      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([header1, header2]);
      XLSX.utils.sheet_add_json(ws, excelData, { skipHeader: true, origin: 'A3' });
      ws['!merges'] = [{ s: { r: 0, c: 6 }, e: { r: 0, c: 11 } }];
      ws['!cols'] = [
        { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 12 },
        { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
        { wch: 10 }, { wch: 15 }
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
}
