import { Component, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DecorativeLinesComponent } from "../../reusable-components/decorative-lines-component/decorative-lines-component";
import { TitlePageComponent } from "../../reusable-components/title-page-component/title-page-component";
import { CalendarEvent } from '../../../api';
import { CalendarEventFacadeService } from '../../../services/calendar-event-facade.service';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  ariaLabel: string;
  events: CalendarEvent[];
}

@Component({
  selector: 'app-calendar-page',
  imports: [MatIconModule, DecorativeLinesComponent, TitlePageComponent],
  standalone: true,
  templateUrl: './calendar-page.html',
  styleUrl: './calendar-page.scss',
})
export class CalendarPage implements OnInit {
  private readonly calendarEventService = inject(CalendarEventFacadeService);
  private calendarEventsByDate = new Map<string, CalendarEvent[]>();

  public readonly weekDays: string[] = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  public currentMonth: Date = this.getCurrentMonth();
  public readonly monthLabel = signal(this.formatMonthLabel(this.currentMonth));
  public readonly calendarDays = signal<CalendarDay[]>(this.buildCalendarDays(this.currentMonth));

  public ngOnInit(): void {
    this.loadCalendarEvents();
  }

  public showPreviousMonth(): void {
    this.setCurrentMonth(new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1));
  }

  public showNextMonth(): void {
    this.setCurrentMonth(new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1));
  }

  public showTodayMonth(): void {
    this.setCurrentMonth(this.getCurrentMonth());
  }

  public getCalendarEventChipClass(event: CalendarEvent): string {
    switch (event.importance) {
      case CalendarEvent.ImportanceEnum.High:
        return 'calendar-event-chip-high';
      case CalendarEvent.ImportanceEnum.Medium:
        return 'calendar-event-chip-medium';
      case CalendarEvent.ImportanceEnum.Low:
        return 'calendar-event-chip-low';
      default:
        return 'calendar-event-chip-low';
    }
  }

  private loadCalendarEvents(): void {
    this.calendarEventService.getCalendarEvents().subscribe({
      next: (calendarEvents) => {
        this.calendarEventsByDate = this.groupCalendarEventsByDate(calendarEvents ?? []);
        this.calendarDays.set(this.buildCalendarDays(this.currentMonth));
      },
      error: (error) => {
        console.error('Error loading calendar events:', error);
        this.calendarEventsByDate = new Map<string, CalendarEvent[]>();
        this.calendarDays.set(this.buildCalendarDays(this.currentMonth));
      },
    });
  }

  private groupCalendarEventsByDate(calendarEvents: CalendarEvent[]): Map<string, CalendarEvent[]> {
    const eventsByDate = new Map<string, CalendarEvent[]>();

    for (const calendarEvent of calendarEvents) {
      const eventDate = new Date(calendarEvent.date);

      if (Number.isNaN(eventDate.getTime())) {
        continue;
      }

      const dateKey = this.toDateKey(eventDate);
      const dayEvents = eventsByDate.get(dateKey) ?? [];
      dayEvents.push(calendarEvent);
      eventsByDate.set(dateKey, dayEvents);
    }

    for (const dayEvents of eventsByDate.values()) {
      dayEvents.sort((firstEvent, secondEvent) => this.compareCalendarEvents(firstEvent, secondEvent));
    }

    return eventsByDate;
  }

  private compareCalendarEvents(firstEvent: CalendarEvent, secondEvent: CalendarEvent): number {
    const firstDate = new Date(firstEvent.date).getTime();
    const secondDate = new Date(secondEvent.date).getTime();

    if (firstDate !== secondDate) {
      return firstDate - secondDate;
    }

    return firstEvent.description.localeCompare(secondEvent.description, 'it-IT');
  }

  private getCurrentMonth(): Date {
    const today = new Date();

    return new Date(today.getFullYear(), today.getMonth(), 1);
  }

  private setCurrentMonth(month: Date): void {
    this.currentMonth = month;
    this.monthLabel.set(this.formatMonthLabel(month));
    this.calendarDays.set(this.buildCalendarDays(month));
  }

  private buildCalendarDays(month: Date): CalendarDay[] {
    const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const leadingDays = (firstDayOfMonth.getDay() + 6) % 7;
    const totalCells = Math.ceil((leadingDays + daysInMonth) / 7) * 7;
    const gridStartDate = new Date(month.getFullYear(), month.getMonth(), 1 - leadingDays);

    return Array.from({ length: totalCells }, (_, index) => {
      const date = new Date(gridStartDate.getFullYear(), gridStartDate.getMonth(), gridStartDate.getDate() + index);

      return {
        date,
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === month.getMonth(),
        isToday: this.isSameDate(date, new Date()),
        ariaLabel: this.formatAriaLabel(date),
        events: this.calendarEventsByDate.get(this.toDateKey(date)) ?? [],
      };
    });
  }

  private formatMonthLabel(date: Date): string {
    return new Intl.DateTimeFormat('it-IT', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  private formatAriaLabel(date: Date): string {
    return new Intl.DateTimeFormat('it-IT', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  private isSameDate(firstDate: Date, secondDate: Date): boolean {
    return firstDate.getFullYear() === secondDate.getFullYear()
      && firstDate.getMonth() === secondDate.getMonth()
      && firstDate.getDate() === secondDate.getDate();
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
