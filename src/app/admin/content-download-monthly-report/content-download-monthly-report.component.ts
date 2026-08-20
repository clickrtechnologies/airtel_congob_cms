import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface ContentMonthlyData {
  date: string;
  artist: string;
  albumName: string;
  album: string;
  genre: string;
  downloads: number;
  copy: number;
  ivr: number;
  appCount: number;
  cp: string;
}

@Component({
  selector: 'app-content-download-monthly-report',
  templateUrl: './content-download-monthly-report.component.html',
  styleUrls: ['./content-download-monthly-report.component.css']
})
export class ContentDownloadMonthlyReportComponent implements OnInit {

  contentMonthlyData: ContentMonthlyData[] = [];
  loading = false;
  error: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchMonthlyReport('India', 'Airtel', 2025, 10);
  }

  fetchMonthlyReport(country: string, mno: string, year: number, month: number) {
    this.loading = true;
    this.error = '';

    const url = `http://163.223.186.221:8084/contentuploadcontroller/reports?country=${country}&mno=${mno}&year=${year}&month=${month}`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        // Assuming API returns array of monthly data matching ContentMonthlyData
        console.log("DATA", res)
        this.contentMonthlyData = res.data || [];
        console.log("contentMonthlyData",this.contentMonthlyData)
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to fetch monthly report.';
        this.loading = false;
      }
    });
  }

}
