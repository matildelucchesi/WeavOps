import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { LoomFacadeService } from '../../../services/loom-facade.service';
import { CertificationFacadeService } from '../../../services/certification-facade.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemDetailsPage } from './item-details-page';

describe('ItemDetailsPage', () => {
  let component: ItemDetailsPage;
  let fixture: ComponentFixture<ItemDetailsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemDetailsPage],
      providers: [provideRouter([]), { provide: LoomFacadeService, useValue: { getAll: () => of([]) } }, { provide: CertificationFacadeService, useValue: { getAll: () => of([]) } }],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemDetailsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
