import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpLayoutComponent } from './cp-layout.component';

describe('CpLayoutComponent', () => {
  let component: CpLayoutComponent;
  let fixture: ComponentFixture<CpLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CpLayoutComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CpLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
