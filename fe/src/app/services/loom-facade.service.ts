import { Injectable, inject } from '@angular/core';
import { Loom, LoomService as LoomApiService } from '../api';

@Injectable({
  providedIn: 'root',
})
export class LoomFacadeService {
  private readonly loomApi = inject(LoomApiService);

  getAll() {
    return this.loomApi.getLooms();
  }

  getById(id: string) {
    return this.loomApi.getLoomById({ id });
  }

  create(loom: Loom) {
    return this.loomApi.createLoom({ loom });
  }

  update(id: string, loom: Loom) {
    return this.loomApi.updateLoom({ id, loom });
  }

  remove(id: string) {
    return this.loomApi.deleteLoom({ id });
  }

  deleteMultiLooms(requestBody: Array<string>) {
    return this.loomApi.deleteMultiLooms({ requestBody });
  }

  addPieces(id: string, pieces: number) {
    return this.loomApi.addPieces({ id, pieces });
  }
}