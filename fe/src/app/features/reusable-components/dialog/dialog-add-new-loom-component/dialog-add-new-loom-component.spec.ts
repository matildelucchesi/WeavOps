import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddNewLoomComponent } from './dialog-add-new-loom-component';

describe('DialogAddNewLoomComponent', () => {
  let component: DialogAddNewLoomComponent;
  let fixture: ComponentFixture<DialogAddNewLoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogAddNewLoomComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogAddNewLoomComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
