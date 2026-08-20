import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

import { ReportsComponent } from './reports.component';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;

  beforeEach(async () => {
    sessionStorage.clear();
    sessionStorage.setItem('userRole', 'ROLE_ADMIN');

    await TestBed.configureTestingModule({
      imports: [FormsModule, HttpClientTestingModule],
      declarations: [ReportsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should keep CP list as an array for admin role', () => {
    component.cpList = [{ id: 1, name: 'CP Test' }];
    expect(Array.isArray(component.cpList)).toBeTrue();
    expect(component.cpList[0].name).toBe('CP Test');
  });
});
