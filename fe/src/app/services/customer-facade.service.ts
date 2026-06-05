import { Injectable, inject } from '@angular/core';
import { Customer, CustomerService as CustomerApiService } from '../api';

@Injectable({
  providedIn: 'root',
})
export class CustomerFacadeService {
  private readonly customerApi = inject(CustomerApiService);

  getAll() {
    return this.customerApi.getCustomers();
  }

  getById(id: string) {
    return this.customerApi.getCustomerById({ id });
  }

  create(customer: Customer) {
    return this.customerApi.createCustomer({ customer });
  }

  update(id: string, customer: Customer) {
    return this.customerApi.updateCustomer({ id, customer });
  }

  remove(id: string) {
    return this.customerApi.deleteCustomer({ id });
  }
}
