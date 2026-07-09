import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogLoomAlertTerminateProduction } from './dialog-loom-alert-terminate-production';

describe('DialogLoomAlertTerminateProduction', () => {
  let component: DialogLoomAlertTerminateProduction;
  let fixture: ComponentFixture<DialogLoomAlertTerminateProduction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogLoomAlertTerminateProduction],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogLoomAlertTerminateProduction);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
