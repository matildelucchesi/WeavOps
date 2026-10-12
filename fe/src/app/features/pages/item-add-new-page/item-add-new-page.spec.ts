import { MatDialog } from '@angular/material/dialog';
import { CertificationFacadeService } from '../../../services/certification-facade.service';
import { CustomerFacadeService } from '../../../services/customer-facade.service';
import { CustomerItemHistoryFacadeService } from '../../../services/customer-item-history-facade.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgForm } from '@angular/forms';
import { of } from 'rxjs';

import { ItemAddNewPage } from './item-add-new-page';
import { ItemFacadeService } from '../../../services/item-facade.service';

describe('ItemAddNewPage', () => {
  let component: ItemAddNewPage;
  let fixture: ComponentFixture<ItemAddNewPage>;
  let itemService: {
    createItemWithArrangement: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    itemService = {
      createItemWithArrangement: vi.fn().mockReturnValue(of({})),
    };

    await TestBed.configureTestingModule({
      imports: [ItemAddNewPage],
      providers: [
        { provide: CertificationFacadeService, useValue: { getAll: () => of([]) } },
        { provide: CustomerFacadeService, useValue: { getAll: () => of([]) } },
        { provide: CustomerItemHistoryFacadeService, useValue: { create: () => of({}) } },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of({ worksSaturday: false, worksSunday: false }) }) } },
        { provide: ItemFacadeService, useValue: itemService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemAddNewPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('serializes the selected delivery date as an ISO string when creating the item', () => {
    const selectedDate = new Date('2026-06-30T00:00:00.000Z');
    component.itemName = 'Articolo 100';
    component.customerName = 'ACME Srl';
    component.piecesCount = 3;
    component.pieceLength = 50;
    component.hitsPerDm = 25;
    component.reedCount = 20;
    component.reedCM = 100;
    component.reedHeight = 1.5;
    component.warpLength = 200;
    component.warpEndCount = 1200;
    component.deliveryDate = selectedDate;
    component.warpWeight = 100.5;
    component.weftWeight = 20.25;
    component.isCertified = 'PARTIAL';
    component.certificationId = 'grs-id';

    component.createNewItem({ invalid: false } as NgForm);

    expect(itemService.createItemWithArrangement).toHaveBeenCalledWith(
      expect.objectContaining({
        warpWeight: 100.5,
        weftWeight: 20.25,
        isCertified: 'PARTIAL',
        certificationId: 'grs-id',
        arrangement: expect.objectContaining({
          deliveryDate: selectedDate.toISOString(),
        }),
      }),
    );
  });
});
