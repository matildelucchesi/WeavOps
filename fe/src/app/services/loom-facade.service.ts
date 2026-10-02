import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Loom, LoomService as LoomApiService } from '../api';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoomFacadeService {
  private readonly loomApi = inject(LoomApiService);
  private readonly http = inject(HttpClient);

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

  recordKnotting(id: string) {
    return this.http.post<void>(
      `${environment.apiUrl}/looms/${encodeURIComponent(id)}/knotting`,
      {},
    );
  }

  createMobileAccessToken(id: string) {
    return this.http.post<{ token: string }>(
      `${environment.apiUrl}/looms/${encodeURIComponent(id)}/mobile-access-token`,
      {},
    );
  }
}
