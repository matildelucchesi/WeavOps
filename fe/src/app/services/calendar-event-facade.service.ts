import { Injectable, inject } from '@angular/core';
import { CalendarEvent, CalendarEventsService } from '../api';

@Injectable({
  providedIn: 'root',
})
export class CalendarEventFacadeService {
  private readonly api = inject(CalendarEventsService);

  createCalendarEvent(calendarEvent: CalendarEvent) {
    return this.api.createCalendarEvent({ calendarEvent });
  }

  deleteCalendarEvent(calendarEventId: string) {
    return this.api.deleteCalendarEvent({ id: calendarEventId });
  }

  getCalendarEvents() {
    return this.api.getCalendarEvents();
  }

  getCalendarEventById(calendarEventId: string) {
    return this.api.getCalendarEventById({ id: calendarEventId });
  }

  updateCalendarEvent(calendarEventId: string, calendarEvent: CalendarEvent) {
    return this.api.updateCalendarEvent({ id: calendarEventId, calendarEvent });
  }
  

}