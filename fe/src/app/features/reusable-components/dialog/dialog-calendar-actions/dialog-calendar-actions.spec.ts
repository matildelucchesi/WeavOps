import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCalendarActions } from './dialog-calendar-actions';

describe('DialogCalendarActions', () => {
  let component: DialogCalendarActions;
  let fixture: ComponentFixture<DialogCalendarActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogCalendarActions],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogCalendarActions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
