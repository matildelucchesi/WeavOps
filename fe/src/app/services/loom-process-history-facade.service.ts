import { Injectable, inject } from '@angular/core';
import {
  LoomProcessHistory,
  LoomProcessHistoryService as LoomProcessHistoryApiService,
} from '../api';

@Injectable({
  providedIn: 'root',
})
export class LoomProcessHistoryFacadeService {
  private readonly loomProcessHistoryApi = inject(LoomProcessHistoryApiService);

  getAll() {
    return this.loomProcessHistoryApi.getLoomProcessHistories();
  }

  getById(id: string) {
    return this.loomProcessHistoryApi.getLoomProcessHistoryById({ id });
  }

  create(loomProcessHistory: LoomProcessHistory) {
    return this.loomProcessHistoryApi.createLoomProcessHistory({ loomProcessHistory });
  }

  update(id: string, loomProcessHistory: LoomProcessHistory) {
    return this.loomProcessHistoryApi.updateLoomProcessHistory({
      id,
      loomProcessHistory,
    });
  }

  remove(id: string) {
    return this.loomProcessHistoryApi.deleteLoomProcessHistory({ id });
  }
}
