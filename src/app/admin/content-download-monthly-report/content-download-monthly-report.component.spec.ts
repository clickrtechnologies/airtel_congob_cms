import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentDownloadMonthlyReportComponent } from './content-download-monthly-report.component';

describe('ContentDownloadMonthlyReportComponent', () => {
  let component: ContentDownloadMonthlyReportComponent;
  let fixture: ComponentFixture<ContentDownloadMonthlyReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContentDownloadMonthlyReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentDownloadMonthlyReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
