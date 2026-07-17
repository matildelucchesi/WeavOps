import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoomMobilePage } from './loom-mobile-page';

describe('LoomMobilePage', () => {
  let component: LoomMobilePage;
  let fixture: ComponentFixture<LoomMobilePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoomMobilePage],
    }).compileComponents();

    fixture = TestBed.createComponent(LoomMobilePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
