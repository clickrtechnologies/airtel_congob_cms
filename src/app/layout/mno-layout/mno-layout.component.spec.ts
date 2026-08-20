import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MnoLayoutComponent } from './mno-layout.component';

describe('MnoLayoutComponent', () => {
  let component: MnoLayoutComponent;
  let fixture: ComponentFixture<MnoLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MnoLayoutComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MnoLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
