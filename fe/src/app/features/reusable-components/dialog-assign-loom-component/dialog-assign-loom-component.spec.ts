import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAssignLoomComponent } from './dialog-assign-loom-component';

describe('DialogAssignLoomComponent', () => {
  let component: DialogAssignLoomComponent;
  let fixture: ComponentFixture<DialogAssignLoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogAssignLoomComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogAssignLoomComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
