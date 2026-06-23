import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Item } from '../../api';
import { ItemFacadeService } from '../../services/item-facade.service';
import { ItemTableRow } from '../table-row-interface/item-table-row';

@Injectable({
  providedIn: 'root',
})
export class ItemTableService {
  private readonly itemService = inject(ItemFacadeService);

  public getRows(): Observable<ItemTableRow[]> {
    return this.itemService.getAll().pipe(
      map((items) => items.map((item) => this.toTableRow(item))),
    );
  }

  private toTableRow(item: Item): ItemTableRow {
    return {
      id: item.id,
      item,
    };
  }

}