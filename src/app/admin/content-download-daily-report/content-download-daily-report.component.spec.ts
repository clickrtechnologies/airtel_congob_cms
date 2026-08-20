import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentDownloadDailyReportComponent } from './content-download-daily-report.component';

describe('ContentDownloadDailyReportComponent', () => {
  let component: ContentDownloadDailyReportComponent;
  let fixture: ComponentFixture<ContentDownloadDailyReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContentDownloadDailyReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentDownloadDailyReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
