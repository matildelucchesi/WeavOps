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

    component.createNewItem({ invalid: false } as NgForm);

    expect(itemService.createItemWithArrangement).toHaveBeenCalledWith(
      expect.objectContaining({
        arrangement: expect.objectContaining({
          deliveryDate: selectedDate.toISOString(),
        }),
      }),
    );
  });
});
