import { Component, OnInit  } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
interface ContentData {
  date: string;
  cp: string;
  cpId: string;
  album: string;
  id: string;
  artist: string;
  count: number;
}
@Component({
  selector: 'app-content-download-daily-report',
  templateUrl: './content-download-daily-report.component.html',
  styleUrls: ['./content-download-daily-report.component.css']
})
export class ContentDownloadDailyReportComponent  implements OnInit {

  contentData: ContentData[] = [];
  loading = false;
  error: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchDailyReport('India', 'Airtel', 2025, 10);
  }

  fetchDailyReport(country: string, mno: string, year: number, month: number) {
    this.loading = true;
    this.error = '';

    const url = `http://163.223.186.221:8084/contentuploadcontroller/reports?country=${country}&mno=${mno}&year=${year}&month=${month}`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.contentData = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to fetch daily report.';
        this.loading = false;
      }
    });
  }
}
