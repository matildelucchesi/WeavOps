import { Injectable, inject } from '@angular/core';
import { CreateItemWithArrangementRequest, Item, ItemService as ItemApiService } from '../api';

@Injectable({
  providedIn: 'root',
})
export class ItemFacadeService {
  private readonly itemApi = inject(ItemApiService);

  getAll() {
    return this.itemApi.getItems();
  }

  getById(id: string) {
    return this.itemApi.getItemById({ id });
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
