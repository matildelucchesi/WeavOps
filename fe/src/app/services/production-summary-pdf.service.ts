import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProductionSummaryPdf {
  id: string;
  loomId: string;
  loomNumber: string;
  fileName: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProductionSummaryPdfService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/$/, '')}/production-summaries`;

  list(loomId?: string): Observable<ProductionSummaryPdf[]> {
    const params = loomId ? new HttpParams().set('loomId', loomId) : undefined;
    return this.http.get<ProductionSummaryPdf[]>(this.baseUrl, { params });
  }

  upload(loomId: string, loomNumber: string, file: Blob, fileName: string): Observable<ProductionSummaryPdf> {
    const body = new FormData();
    body.append('loomId', loomId);
    body.append('loomNumber', String(loomNumber));
    body.append('file', file, fileName);
    return this.http.post<ProductionSummaryPdf>(this.baseUrl, body);
  }

  download(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${encodeURIComponent(id)}/pdf`, { responseType: 'blob' });
  }
}
