import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoomProductionDetailsPage } from './loom-production-details-page';

describe('LoomProductionDetailsPage', () => {
  let component: LoomProductionDetailsPage;
  let fixture: ComponentFixture<LoomProductionDetailsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoomProductionDetailsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(LoomProductionDetailsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
