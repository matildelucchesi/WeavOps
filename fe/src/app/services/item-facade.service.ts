import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateItemWithArrangementRequest, Item, ItemService as ItemApiService } from '../api';
import { environment } from '../../environments/environment';

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

  create(item: Item) {
    return this.itemApi.createItem({ item });
  }

  update(id: string, item: Item) {
    return this.itemApi.updateItem({ id, item });
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
