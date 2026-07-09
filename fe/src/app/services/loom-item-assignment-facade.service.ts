import { Injectable, inject } from '@angular/core';
import {
  LoomItemAssignment,
  LoomItemAssignmentService as LoomItemAssignmentApiService,
} from '../api';

@Injectable({
  providedIn: 'root',
})
export class LoomItemAssignmentFacadeService {
  private readonly loomItemAssignmentApi = inject(LoomItemAssignmentApiService);

  getAll() {
    return this.loomItemAssignmentApi.getLoomItemAssignments();
  }

  getById(id: string) {
    return this.loomItemAssignmentApi.getLoomItemAssignmentById({ id });
  }

  create(loomId: string, itemId: string, processId: string, status: LoomItemAssignment.StatusEnum) {
    return this.loomItemAssignmentApi.createLoomItemAssignment({
      loomItemAssignment: { loomId, itemId, processId, status },
    });
  }

  update(id: string, loomItemAssignment: LoomItemAssignment) {
    return this.loomItemAssignmentApi.updateLoomItemAssignment({
      id,
      loomItemAssignment,
    });
  }

  remove(id: string) {
    return this.loomItemAssignmentApi.deleteLoomItemAssignment({ id });
  }

  getByLoomId(loomId: string) {
    return this.loomItemAssignmentApi.getLoomItemAssignmentsByLoomId({ loomId });
  }

  getByItemId(itemId: string) {
    return this.loomItemAssignmentApi.getLoomItemAssignmentsByItemId({ itemId });
  }

  getRunningAssignmentByLoomId(loomId: string) {
    return this.loomItemAssignmentApi.getRunningAssignmentByLoomId({ loomId });
  }
}
