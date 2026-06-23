import { Injectable, inject } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { Arrangement, Customer, Item } from '../../api';
import { ArrangementFacadeService } from '../../services/arrangement-facade.service';
import { CustomerFacadeService } from '../../services/customer-facade.service';
import { ItemFacadeService } from '../../services/item-facade.service';
import { ItemTableRow } from '../table-row-interface/item-table-row';

@Injectable({
  providedIn: 'root',
})
export class ItemNotArchivedTableService {
  private readonly itemService = inject(ItemFacadeService);
  private readonly arrangementService = inject(ArrangementFacadeService);
  private readonly customerService = inject(CustomerFacadeService);

  public getRows(): Observable<ItemTableRow[]> {
    return this.itemService.getItemsNotArchived().pipe(
      switchMap((items) => {
        if (items.length === 0) {
          return of([]);
        }

        return forkJoin(items.map((item) => this.toTableRow(item)));
      }),
    );
  }

  private toTableRow(item: Item): Observable<ItemTableRow> {
    return forkJoin({
      arrangement: this.getArrangement(item.arrangementId),
      customer: this.getCustomer(item.customerId),
    }).pipe(
      map(({ arrangement, customer }) => ({
        id: item.id,
        item,
        state: item.state,
        arrangement,
        customer,
      })),
    );
  }

  private getArrangement(arrangementId: string | undefined): Observable<Arrangement | undefined> {
    if (!arrangementId) {
      return of(undefined);
    }

    return this.arrangementService.getById(arrangementId).pipe(
      catchError(() => of(undefined)),
    );
  }

  private getCustomer(customerId: string | undefined): Observable<Customer | undefined> {
    if (!customerId) {
      return of(undefined);
    }

    return this.customerService.getById(customerId).pipe(
      catchError(() => of(undefined)),
    );
  }

}
