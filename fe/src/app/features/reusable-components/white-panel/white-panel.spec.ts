import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhitePanel } from './white-panel';

describe('WhitePanel', () => {
  let component: WhitePanel;
  let fixture: ComponentFixture<WhitePanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhitePanel],
    }).compileComponents();

    fixture = TestBed.createComponent(WhitePanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
