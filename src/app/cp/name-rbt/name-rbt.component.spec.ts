import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NameRbtComponent } from './name-rbt.component';

describe('NameRbtComponent', () => {
  let component: NameRbtComponent;
  let fixture: ComponentFixture<NameRbtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NameRbtComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NameRbtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
