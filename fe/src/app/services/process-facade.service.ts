import { Injectable, inject } from '@angular/core';
import { Process, ProcessService as ProcessApiService } from '../api';

@Injectable({
  providedIn: 'root',
})
export class ProcessFacadeService {
  private readonly processApi = inject(ProcessApiService);

  getAll() {
    return this.processApi.getProcesses();
  }

  getById(id: string) {
    return this.processApi.getProcessById({ id });
  }

  create(process: Process) {
    return this.processApi.createProcess({ process });
  }

  update(id: string, process: Process) {
    return this.processApi.updateProcess({ id, process });
  }

  remove(id: string) {
    return this.processApi.deleteProcess({ id });
  }
}