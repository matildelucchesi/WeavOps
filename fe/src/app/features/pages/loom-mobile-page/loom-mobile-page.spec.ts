import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LoomMobilePage } from './loom-mobile-page';

describe('LoomMobilePage', () => {
  let component: LoomMobilePage;
  let fixture: ComponentFixture<LoomMobilePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoomMobilePage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LoomMobilePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
