import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerItemsHistoryPage } from './customer-items-history-page';

describe('CustomerItemsHistoryPage', () => {
  let component: CustomerItemsHistoryPage;
  let fixture: ComponentFixture<CustomerItemsHistoryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerItemsHistoryPage],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerItemsHistoryPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
