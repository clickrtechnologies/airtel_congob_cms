import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MnoManagementComponent } from './mno-management.component';

describe('MnoManagementComponent', () => {
  let component: MnoManagementComponent;
  let fixture: ComponentFixture<MnoManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MnoManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MnoManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
