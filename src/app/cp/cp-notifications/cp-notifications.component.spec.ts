import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpNotificationsComponent } from './cp-notifications.component';

describe('CpNotificationsComponent', () => {
  let component: CpNotificationsComponent;
  let fixture: ComponentFixture<CpNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CpNotificationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CpNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
