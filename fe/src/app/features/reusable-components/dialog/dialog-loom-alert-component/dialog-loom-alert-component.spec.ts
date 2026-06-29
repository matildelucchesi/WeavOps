import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogLoomAlertComponent } from './dialog-loom-alert-component';

describe('DialogLoomAlertComponent', () => {
  let component: DialogLoomAlertComponent;
  let fixture: ComponentFixture<DialogLoomAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogLoomAlertComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogLoomAlertComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
