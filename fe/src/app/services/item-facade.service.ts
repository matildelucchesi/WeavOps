import { Injectable, inject } from '@angular/core';
import { Item, ItemService as ItemApiService } from '../api';

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
}
