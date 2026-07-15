import { Injectable, inject } from '@angular/core';
import {
  CustomerItemHistory,
  CustomerItemHistoryService as CustomerItemHistoryApiService,
} from '../api';

@Injectable({
  providedIn: 'root',
})
export class CustomerItemHistoryFacadeService {
  private readonly customerItemHistoryApi = inject(CustomerItemHistoryApiService);

  getAll() {
    return this.customerItemHistoryApi.getCustomerItemHistories();
  }

  getById(id: string) {
    return this.customerItemHistoryApi.getCustomerItemHistoryById({ id });
  }

  create(customerItemHistory: CustomerItemHistory) {
    return this.customerItemHistoryApi.createCustomerItemHistory({ customerItemHistory });
  }

  update(id: string, customerItemHistory: CustomerItemHistory) {
    return this.customerItemHistoryApi.updateCustomerItemHistory({
      id,
      customerItemHistory,
    });
  }

  remove(id: string) {
    return this.customerItemHistoryApi.deleteCustomerItemHistory({ id });
  }
}
