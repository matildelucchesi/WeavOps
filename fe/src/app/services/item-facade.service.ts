import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateItemWithArrangementRequest, Item, ItemService as ItemApiService, ProductionAdvice } from '../api';
import { environment } from '../../environments/environment';

export interface ItemAndArrangementResponse {
  item: Item;
  arrangement: import('../api').Arrangement;
}

@Injectable({
  providedIn: 'root',
})
export class ItemFacadeService {
  private readonly itemApi = inject(ItemApiService);
  private readonly http = inject(HttpClient);

  getAll() {
    return this.itemApi.getItems();
  }

  getById(id: string) {
    return this.itemApi.getItemById({ id });
  }

  getRemainingMetersToAssign(id: string) {
    return this.http.get<number>(
      `${environment.apiUrl}/items/${encodeURIComponent(id)}/remaining-meters-to-assign`,
    );
  }

  getRunningItemsCount() {
    return this.itemApi.getRunningItemsCount();
  }

  getProductionAdvice(id: string) {
    return this.itemApi.getProductionAdviceByItemId({ id });
  }

  create(item: Item) {
    return this.itemApi.createItem({ item });
  }

  update(id: string, item: Item) {
    return this.itemApi.updateItem({ id, item });
  }

  updateItemAndArrangement(id: string, item: Item, arrangement: import('../api').Arrangement) {
    return this.http.put<ItemAndArrangementResponse>(
      `${environment.apiUrl}/items/${encodeURIComponent(id)}/with-arrangement`,
      { item, arrangement },
    );
  }

  remove(id: string) {
    return this.itemApi.deleteItem({ id });
  }

  deleteMultiItems(requestBody: Array<string>) {
    return this.itemApi.deleteMultiItems({ requestBody });
  }

  createItemWithArrangement(createItemWithArrangementRequest: CreateItemWithArrangementRequest) {
    return this.itemApi.createItemWithArrangement({ createItemWithArrangementRequest });
  }

  getItemsArchived() {
    return this.itemApi.getItemsArchived();
  }

  getItemsNotArchived() {
    return this.itemApi.getItemsNotArchived();
  }

}
