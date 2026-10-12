import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Fabric } from '../api/model/fabric';
@Injectable({providedIn: 'root'})
export class FabricFacadeService {
  private readonly http = inject(HttpClient);
  getAll() { return this.http.get<Fabric[]>('/api/fabrics'); }
  getByItemId(itemId: string) { return this.http.get<Fabric[]>('/api/fabrics', {params: {itemId}}); }
}
