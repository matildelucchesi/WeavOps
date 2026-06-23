import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Loom } from '../../api';
import { LoomFacadeService } from '../../services/loom-facade.service';
import { LoomTableRow } from '../table-row-interface/loom-table-row';

@Injectable({
  providedIn: 'root',
})
export class LoomTableService {
  private readonly loomService = inject(LoomFacadeService);

  public getRows(): Observable<LoomTableRow[]> {
    return this.loomService.getAll().pipe(
      map((looms) => looms.map((loom) => this.toTableRow(loom))),
    );
  }

  private toTableRow(loom: Loom): LoomTableRow {
    return {
      id: loom.id,
      loom,
      serialNumber: loom.serialNumber,
      status: loom.status,
    };
  }

}