import { Injectable, inject } from '@angular/core';
import { Referent, ReferentService as ReferentApiService } from '../api';

@Injectable({
  providedIn: 'root',
})
export class ReferentFacadeService {
  private readonly referentApi = inject(ReferentApiService);

  getAll() {
    return this.referentApi.getReferents();
  }

  getById(id: string) {
    return this.referentApi.getReferentById({ id });
  }

  create(referent: Referent) {
    return this.referentApi.createReferent({ referent });
  }

  update(id: string, referent: Referent) {
    return this.referentApi.updateReferent({ id, referent });
  }

  remove(id: string) {
    return this.referentApi.deleteReferent({ id });
  }
}