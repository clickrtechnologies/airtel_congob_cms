import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrPopupComponentComponent } from './qr-popup-component.component';

describe('QrPopupComponentComponent', () => {
  let component: QrPopupComponentComponent;
  let fixture: ComponentFixture<QrPopupComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QrPopupComponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QrPopupComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
