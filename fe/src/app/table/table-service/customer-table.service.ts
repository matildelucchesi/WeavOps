import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Customer, Referent } from '../../api';
import { CustomerFacadeService } from '../../services/customer-facade.service';
import { CustomerTableRow } from '../table-row-interface/customer-table-row';

@Injectable({
  providedIn: 'root',
})
export class CustomerTableService {
  private readonly customerService = inject(CustomerFacadeService);

  public getRows(): Observable<CustomerTableRow[]> {
    return this.customerService.getAll().pipe(
      map((customers) => customers.map((customer) => this.toTableRow(customer))),
    );
  }

  private toTableRow(customer: Customer): CustomerTableRow {
    const referents = customer.referents ?? [];

    return {
      name: customer.name,
      email: customer.email,
      referent: this.formatReferents(referents),
      phoneNumber: this.formatPhoneNumbers(referents),
      note: customer.note ?? '',
    };
  }

  private formatReferents(referents: Referent[]): string {
    return referents
      .map((referent) => `${referent.firstName} ${referent.lastName}`.trim())
      .filter(Boolean)
      .join(', ');
  }

  private formatPhoneNumbers(referents: Referent[]): string {
    return referents
      .map((referent) => referent.phoneNumber)
      .filter((phoneNumber): phoneNumber is string => Boolean(phoneNumber))
      .join(', ');
  }
}
