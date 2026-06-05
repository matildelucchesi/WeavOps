import { Injectable, inject } from '@angular/core';
import { Arrangement, ArrangementService as ArrangementApiService } from '../api';

@Injectable({
  providedIn: 'root',
})
export class ArrangementFacadeService {
  private readonly arrangementApi = inject(ArrangementApiService);

  getAll() {
    return this.arrangementApi.getArrangements();
  }

  getById(id: string) {
    return this.arrangementApi.getArrangementById({ id });
  }

  create(arrangement: Arrangement) {
    return this.arrangementApi.createArrangement({ arrangement });
  }

  update(id: string, arrangement: Arrangement) {
    return this.arrangementApi.updateArrangement({ id, arrangement });
  }

  remove(id: string) {
    return this.arrangementApi.deleteArrangement({ id });
  }
}
