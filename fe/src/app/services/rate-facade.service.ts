import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Rate } from '../api/model/rate';
import { Service } from '../api/model/service';
@Injectable({providedIn:'root'})
export class RateFacadeService {
  private readonly http = inject(HttpClient);
  getServices() { return this.http.get<Service[]>('/api/services'); }
  getAll() { return this.http.get<Rate[]>('/api/rates'); }
  create(rate: Rate) { return this.http.post<Rate>('/api/rates', rate); }
  update(id: string, rate: Rate) { return this.http.put<Rate>(`/api/rates/${encodeURIComponent(id)}`, rate); }
  remove(id: string) { return this.http.delete<void>(`/api/rates/${encodeURIComponent(id)}`); }
}
