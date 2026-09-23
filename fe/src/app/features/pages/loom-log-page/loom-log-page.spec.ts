import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { LoomLogService } from '../../../api';

import { LoomLogPage } from './loom-log-page';

describe('LoomLogPage', () => {
  let component: LoomLogPage;
  let fixture: ComponentFixture<LoomLogPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoomLogPage],
      providers: [
        { provide: LoomLogService, useValue: { getLoomLogs: () => of([]) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoomLogPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
