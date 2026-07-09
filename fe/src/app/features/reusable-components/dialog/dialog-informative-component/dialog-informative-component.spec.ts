import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogInformativeComponent } from './dialog-informative-component';

describe('DialogInformativeComponent', () => {
  let component: DialogInformativeComponent;
  let fixture: ComponentFixture<DialogInformativeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogInformativeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogInformativeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
