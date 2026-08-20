import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyTokenMnoComponent } from './verify-token-mno.component';

describe('VerifyTokenMnoComponent', () => {
  let component: VerifyTokenMnoComponent;
  let fixture: ComponentFixture<VerifyTokenMnoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifyTokenMnoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyTokenMnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
