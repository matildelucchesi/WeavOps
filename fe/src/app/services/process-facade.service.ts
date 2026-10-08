import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Item, LoomItemAssignment, Process, ProcessService as ProcessApiService } from '../api';
import { environment } from '../../environments/environment';

export interface AssignedProcessResponse {
  process: Process;
  assignment: LoomItemAssignment;
  item: Item;
}

@Injectable({
  providedIn: 'root',
})
export class ProcessFacadeService {
  private readonly processApi = inject(ProcessApiService);
  private readonly http = inject(HttpClient);

  getAll() {
    return this.processApi.getProcesses();
  }

  getById(id: string) {
    return this.processApi.getProcessById({ id });
  }

  create(process: Process) {
    return this.processApi.createProcess({ process });
  }

  createAssigned(itemId: string, process: Process) {
    return this.http.post<AssignedProcessResponse>(
      `${environment.apiUrl}/items/${encodeURIComponent(itemId)}/processes`,
      { process },
    );
  }

  update(id: string, process: Process) {
    return this.processApi.updateProcess({ id, process });
  }

  delete(id: string) {
    return this.processApi.deleteProcess({ id });
  }
}
