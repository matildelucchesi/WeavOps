import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoomHistoryPage } from './loom-history-page';

describe('LoomHistoryPage', () => {
  let component: LoomHistoryPage;
  let fixture: ComponentFixture<LoomHistoryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoomHistoryPage],
    }).compileComponents();

    fixture = TestBed.createComponent(LoomHistoryPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
