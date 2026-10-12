import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface SavedDeliveryNote { _id: string; number: number; year: number; date: string; customerName: string; fabricIds?: string[]; }
@Injectable({ providedIn: 'root' })
export class DeliveryNoteService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl.replace(/\/$/, '')}/delivery-notes`;
  list() { return this.http.get<SavedDeliveryNote[]>(this.url); }
  reserveNumber() { return this.http.post<{ number: number; year: number }>(`${this.url}/reserve-number`, {}); }
  save(number: number, date: string, customerName: string, pdf: Blob, fabricIds: string[]) {
    const form = new FormData();
    form.append('number', String(number)); form.append('date', date);
    form.append('customerName', customerName); form.append('file', pdf, 'ddt.pdf');
    fabricIds.forEach(id => form.append('fabricIds', id));
    return this.http.post<SavedDeliveryNote>(this.url, form);
  }
  download(id: string) { return this.http.get(`${this.url}/${encodeURIComponent(id)}/pdf`, { responseType: 'blob' }); }
  delete(id: string) { return this.http.delete<void>(`${this.url}/${encodeURIComponent(id)}`); }
  view(id: string, onError: (message: string) => void): void {
    const preview = window.open('', '_blank');
    if (!preview) {
      onError('Consenti l’apertura delle finestre per visualizzare il documento.');
      return;
    }
    preview.opener = null;
    this.download(id).subscribe({
      next: pdf => {
        const url = URL.createObjectURL(pdf);
        preview.location.replace(url);
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      },
      error: () => {
        preview.close();
        onError('Impossibile visualizzare il PDF.');
      },
    });
  }
}
