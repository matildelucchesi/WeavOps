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

  getCurrentWeekPendingDeliveryCount() {
    return this.api.getCurrentWeekPendingDeliveryCount();
  }

  getCalendarEventById(calendarEventId: string) {
    return this.api.getCalendarEventById({ id: calendarEventId });
  }

  getOverdueDeliveryCount() {
    return this.api.getOverdueDeliveryCount();
  }

  updateCalendarEvent(calendarEventId: string, calendarEvent: CalendarEvent) {
    return this.api.updateCalendarEvent({ id: calendarEventId, calendarEvent });
  }
  

}
