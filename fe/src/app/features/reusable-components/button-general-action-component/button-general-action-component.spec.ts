import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonGeneralActionComponent } from './button-general-action-component';

describe('ButtonGeneralActionComponent', () => {
  let component: ButtonGeneralActionComponent;
  let fixture: ComponentFixture<ButtonGeneralActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonGeneralActionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonGeneralActionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
