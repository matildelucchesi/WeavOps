import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemDetailsPage } from './item-details-page';

describe('ItemDetailsPage', () => {
  let component: ItemDetailsPage;
  let fixture: ComponentFixture<ItemDetailsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemDetailsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemDetailsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
