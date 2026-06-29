import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogItemAlertState } from './dialog-item-alert-state';

describe('DialogItemAlertState', () => {
  let component: DialogItemAlertState;
  let fixture: ComponentFixture<DialogItemAlertState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogItemAlertState],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogItemAlertState);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
