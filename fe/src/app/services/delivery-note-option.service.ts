import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface DeliveryNoteOption {
  id?: string;
  type: 'TRANSPORT' | 'FREIGHT';
  value: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class DeliveryNoteOptionService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl.replace(/\/$/, '')}/delivery-note-options`;
  getAll() { return this.http.get<DeliveryNoteOption[]>(this.url); }
  save(option: DeliveryNoteOption) {
    return option.id
      ? this.http.put<DeliveryNoteOption>(`${this.url}/${encodeURIComponent(option.id)}`, option)
      : this.http.post<DeliveryNoteOption>(this.url, option);
  }
}
