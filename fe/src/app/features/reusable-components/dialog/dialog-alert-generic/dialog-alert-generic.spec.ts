import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAlertGeneric } from './dialog-alert-generic';

describe('DialogAlertGeneric', () => {
  let component: DialogAlertGeneric;
  let fixture: ComponentFixture<DialogAlertGeneric>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogAlertGeneric],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogAlertGeneric);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
