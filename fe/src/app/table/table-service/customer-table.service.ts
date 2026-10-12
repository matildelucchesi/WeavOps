import { Injectable, inject } from '@angular/core';
import { DestinationFacadeService } from '../../services/destination-facade.service';
import { Destination } from '../../api/model/destination';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { Customer, Referent } from '../../api';
import { CustomerFacadeService } from '../../services/customer-facade.service';
import { CustomerTableRow } from '../table-row-interface/customer-table-row';

@Injectable({
  providedIn: 'root',
})
export class CustomerTableService {
  private readonly customerService = inject(CustomerFacadeService);
  private readonly destinationService = inject(DestinationFacadeService);

  public getRows(): Observable<CustomerTableRow[]> {
    return forkJoin({customers: this.customerService.getAll(), destinations: this.destinationService.getAll().pipe(catchError(() => of([])))}).pipe(
      map(({customers, destinations}) => customers.map(customer => this.toTableRow(customer, destinations))),
    );
  }

  private toTableRow(customer: Customer, destinations: Destination[]): CustomerTableRow {
    const referents = customer.referents ?? [];

    return {
      id: customer.id,
      customer,
      name: customer.name,
      email: customer.email,
      vatNumber: customer.vatNumber ?? '',
      destinationNames: (customer.destinationIds ?? []).map(id => {
        const destination = destinations.find(value => value.id === id);
        return destination ? `${destination.name} — ${destination.city} (${destination.provinceCode})` : 'Destinazione non disponibile';
      }).join('\n'),
      referent: this.formatReferents(referents),
      phoneNumber: this.formatPhoneNumbers(referents),
      note: customer.note ?? '',
    };
  }

  private formatReferents(referents: Referent[]): string {
    return referents
      .map((referent) => `${referent.firstName} ${referent.lastName}`.trim())
      .filter(Boolean)
      .join('\n');
  }

  private formatPhoneNumbers(referents: Referent[]): string {
    return referents
      .map((referent) => referent.phoneNumber)
      .filter((phoneNumber): phoneNumber is string => Boolean(phoneNumber))
      .join('\n');
  }
}
