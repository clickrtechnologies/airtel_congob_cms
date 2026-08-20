import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalMisReportComponent } from './internal-mis-report.component';

describe('InternalMisReportComponent', () => {
  let component: InternalMisReportComponent;
  let fixture: ComponentFixture<InternalMisReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InternalMisReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InternalMisReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
