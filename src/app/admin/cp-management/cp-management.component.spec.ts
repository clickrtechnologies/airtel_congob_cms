import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpManagementComponent } from './cp-management.component';

describe('CpManagementComponent', () => {
  let component: CpManagementComponent;
  let fixture: ComponentFixture<CpManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CpManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CpManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
