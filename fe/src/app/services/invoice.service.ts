import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { InvoiceData } from './invoice-model';

export interface SavedInvoice { _id: string; number: number; year: number; date: string; customerName: string; data: InvoiceData; }
@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl.replace(/\/$/, '')}/invoices`;
  list() { return this.http.get<SavedInvoice[]>(this.url); }
  get(id: string) { return this.http.get<SavedInvoice>(`${this.url}/${encodeURIComponent(id)}`); }
  nextNumber() { return this.http.post<{number: number}>(`${this.url}/reserve-number`, {}); }
  save(data: InvoiceData, pdf: Blob, id?: string) {
    const form = new FormData();
    form.append('data', JSON.stringify(data));
    form.append('file', pdf, 'fattura.pdf');
    return id ? this.http.put<SavedInvoice>(`${this.url}/${encodeURIComponent(id)}`, form) : this.http.post<SavedInvoice>(this.url, form);
  }
  download(id: string) { return this.http.get(`${this.url}/${encodeURIComponent(id)}/pdf`, { responseType: 'blob' }); }
  delete(id: string) { return this.http.delete<void>(`${this.url}/${encodeURIComponent(id)}`); }
}
