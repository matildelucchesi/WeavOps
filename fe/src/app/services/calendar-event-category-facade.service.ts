import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';

export interface CalendarEventCategory {
  readonly id?: string;
  name: string;
  color: string;
  readonly standard?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CalendarEventCategoryFacadeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/calendar-event-categories`;

  getAll() {
    return this.http.get<CalendarEventCategory[]>(this.baseUrl);
  }

  getById(id: string) {
    return this.http.get<CalendarEventCategory>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }

  create(calendarEventCategory: CalendarEventCategory) {
    return this.http.post<CalendarEventCategory>(this.baseUrl, calendarEventCategory);
  }

  update(id: string, calendarEventCategory: CalendarEventCategory) {
    return this.http.put<CalendarEventCategory>(
      `${this.baseUrl}/${encodeURIComponent(id)}`,
      calendarEventCategory,
    );
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }
}
