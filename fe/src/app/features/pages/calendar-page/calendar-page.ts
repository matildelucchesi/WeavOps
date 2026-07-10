import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { concatMap, from, toArray } from 'rxjs';
import { DecorativeLinesComponent } from "../../reusable-components/decorative-lines-component/decorative-lines-component";
import { TitlePageComponent } from "../../reusable-components/title-page-component/title-page-component";
import { ButtonGeneralActionComponent } from '../../reusable-components/button/button-general-action-component/button-general-action-component';
import { LoaderComponent } from '../../reusable-components/loader-component/loader-component';
import { CalendarEvent } from '../../../api';
import { CalendarEventFacadeService } from '../../../services/calendar-event-facade.service';
import { WhitePanel } from "../../reusable-components/white-panel/white-panel";

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasClosure: boolean;
  ariaLabel: string;
  events: CalendarEvent[];
}

type CalendarEventType = CalendarEvent.TypeEnum | 'CLOSURE';

interface CalendarEventTypeOption {
  type: CalendarEventType;
  label: string;
  colorClass: string;
}

interface ClosureEditorDay {
  date: Date | null;
  dateKey: string | null;
  dayNumber: number | null;
  isToday: boolean;
  isSelected: boolean;
}

interface ClosureEditorMonth {
  label: string;
  days: ClosureEditorDay[];
}

type CalendarViewMode = 'calendar' | 'generic-event' | 'closure-editor';

@Component({
  selector: 'app-calendar-page',
  imports: [FormsModule, MatIconModule, MatSnackBarModule, MatTooltipModule, DecorativeLinesComponent, TitlePageComponent, ButtonGeneralActionComponent, LoaderComponent, WhitePanel],
  standalone: true,
  templateUrl: './calendar-page.html',
  styleUrl: './calendar-page.scss',
})
export class CalendarPage implements OnInit {
  private readonly calendarEventService = inject(CalendarEventFacadeService);
  private readonly snackBar = inject(MatSnackBar);
  private calendarEventsByDate = new Map<string, CalendarEvent[]>();
  private readonly minimumLoaderDurationMs = 1000;

  public readonly weekDays: string[] = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  public currentMonth: Date = this.getCurrentMonth();
  public readonly monthLabel = signal(this.formatMonthLabel(this.currentMonth));
  public readonly calendarDays = signal<CalendarDay[]>(this.buildCalendarDays(this.currentMonth));
  public readonly viewMode = signal<CalendarViewMode>('calendar');
  public readonly isAddEventMenuOpen = signal(false);
  public readonly closureEditorYear = signal(new Date().getFullYear());
  public readonly selectedClosureDateKeys = signal<Set<string>>(new Set<string>());
  public readonly closureEditorMonths = computed<ClosureEditorMonth[]>(() =>
    this.buildClosureEditorMonths(this.closureEditorYear(), this.selectedClosureDateKeys())
  );
  public readonly isSavingClosures = signal(false);
  public readonly isSavingGenericEvent = signal(false);
  public readonly isSaving = computed(() => this.isSavingClosures() || this.isSavingGenericEvent());
  public genericEventDescription = '';
  public genericEventDate = '';
  public readonly eventTypeOptions: CalendarEventTypeOption[] = [
    { type: CalendarEvent.TypeEnum.Generic, label: 'Evento generico', colorClass: 'calendar-event-color-generic' },
    { type: CalendarEvent.TypeEnum.Delivery, label: 'Consegna articolo', colorClass: 'calendar-event-color-delivery' },
    { type: CalendarEvent.TypeEnum.ItemForecast, label: 'Fine prevista articolo', colorClass: 'calendar-event-color-item-forecast' },
    { type: CalendarEvent.TypeEnum.LoomForecast, label: 'Fine prevista telaio', colorClass: 'calendar-event-color-loom-forecast' },
    { type: 'CLOSURE', label: 'Chiusura aziendale', colorClass: 'calendar-event-color-closure' },
  ];
  private readonly eventTypeVisibility = signal<Record<CalendarEventType, boolean>>({
    [CalendarEvent.TypeEnum.Generic]: true,
    [CalendarEvent.TypeEnum.Delivery]: true,
    [CalendarEvent.TypeEnum.ItemForecast]: true,
    [CalendarEvent.TypeEnum.LoomForecast]: true,
    CLOSURE: true,
  });
  private initialClosureDateKeys = new Set<string>();

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

  public toggleAddEventMenu(): void {
    this.isAddEventMenuOpen.update((isOpen) => !isOpen);
  }

  public openGenericEventEditor(): void {
    this.genericEventDescription = '';
    this.genericEventDate = this.toDateInputValue(new Date());
    this.isAddEventMenuOpen.set(false);
    this.viewMode.set('generic-event');
  }

  public openClosureEditor(): void {
    this.initializeClosureSelection();
    this.closureEditorYear.set(new Date().getFullYear());
    this.isAddEventMenuOpen.set(false);
    this.viewMode.set('closure-editor');
  }

  public returnToCalendar(onLoaded?: () => void, onError?: () => void): void {
    this.isAddEventMenuOpen.set(false);
    this.viewMode.set('calendar');
    this.loadCalendarEvents(onLoaded, onError);
  }

  public showPreviousClosureYear(): void {
    this.closureEditorYear.update((year) => year - 1);
  }

  public showNextClosureYear(): void {
    this.closureEditorYear.update((year) => year + 1);
  }

  public toggleClosureDate(day: ClosureEditorDay): void {
    if (!day.dateKey || this.isSavingClosures()) {
      return;
    }

    this.selectedClosureDateKeys.update((selectedDateKeys) => {
      const updatedDateKeys = new Set(selectedDateKeys);

      if (updatedDateKeys.has(day.dateKey!)) {
        updatedDateKeys.delete(day.dateKey!);
      } else {
        updatedDateKeys.add(day.dateKey!);
      }

      return updatedDateKeys;
    });
  }

  public hasUnsavedClosureChanges(): boolean {
    const selectedDateKeys = this.selectedClosureDateKeys();

    if (selectedDateKeys.size !== this.initialClosureDateKeys.size) {
      return true;
    }

    return [...selectedDateKeys].some((dateKey) => !this.initialClosureDateKeys.has(dateKey));
  }

  public saveClosures(): void {
    if (!this.hasUnsavedClosureChanges() || this.isSavingClosures()) {
      return;
    }

    const selectedDateKeys = this.selectedClosureDateKeys();
    const existingClosureEvents = this.getClosureEvents();
    const datesToCreate = [...selectedDateKeys]
      .filter((dateKey) => !this.initialClosureDateKeys.has(dateKey));
    const eventsToDelete = existingClosureEvents
      .filter((event) => {
        const eventDate = new Date(event.date);
        return !Number.isNaN(eventDate.getTime()) && !selectedDateKeys.has(this.toDateKey(eventDate));
      })
      .filter((event) => !!event.id);

    const requests = [
      ...datesToCreate.map((dateKey) => this.calendarEventService.createCalendarEvent({
        description: 'Chiusura aziendale',
        date: this.toClosureEventDate(dateKey),
        type: CalendarEvent.TypeEnum.Closure,
      })),
      ...eventsToDelete.map((event) => this.calendarEventService.deleteCalendarEvent(event.id!)),
    ];

    if (requests.length === 0) {
      return;
    }

    const saveStartedAt = Date.now();
    this.isSavingClosures.set(true);
    from(requests).pipe(
      concatMap((request) => request),
      toArray(),
    ).subscribe({
      next: () => {
        this.loadCalendarEvents(() => {
          this.finishSavingAfterMinimumDuration(saveStartedAt, () => {
            this.initializeClosureSelection();
            this.isSavingClosures.set(false);
            this.showSaveSuccessMessage();
          });
        }, () => {
          this.finishSavingAfterMinimumDuration(saveStartedAt, () => {
            this.isSavingClosures.set(false);
          });
        });
      },
      error: (error) => {
        console.error('Error saving closure dates:', error);
        this.finishSavingAfterMinimumDuration(saveStartedAt, () => {
          this.isSavingClosures.set(false);
        });
      },
    });
  }

  public saveGenericEvent(): void {
    const description = this.genericEventDescription.trim();
    const date = this.parseDateInput(this.genericEventDate);

    if (!description || !date || this.isSavingGenericEvent()) {
      return;
    }

    const saveStartedAt = Date.now();
    this.isSavingGenericEvent.set(true);
    this.calendarEventService.createCalendarEvent({
      description,
      date: date.toISOString(),
      type: CalendarEvent.TypeEnum.Generic,
    }).subscribe({
      next: () => {
        this.returnToCalendar(() => {
          this.finishSavingAfterMinimumDuration(saveStartedAt, () => {
            this.isSavingGenericEvent.set(false);
            this.showSaveSuccessMessage();
          });
        }, () => {
          this.finishSavingAfterMinimumDuration(saveStartedAt, () => {
            this.isSavingGenericEvent.set(false);
          });
        });
      },
      error: (error) => {
        console.error('Error creating generic calendar event:', error);
        this.finishSavingAfterMinimumDuration(saveStartedAt, () => {
          this.isSavingGenericEvent.set(false);
        });
      },
    });
  }

  public getCalendarEventChipClass(event: CalendarEvent): string {
    switch (this.getCalendarEventType(event)) {
      case CalendarEvent.TypeEnum.Generic:
        return 'calendar-event-chip-generic';
      case CalendarEvent.TypeEnum.Delivery:
        return 'calendar-event-chip-delivery';
      case CalendarEvent.TypeEnum.ItemForecast:
        return 'calendar-event-chip-item-forecast';
      case CalendarEvent.TypeEnum.LoomForecast:
        return 'calendar-event-chip-loom-forecast';
      case 'CLOSURE':
        return 'calendar-event-chip-closure';
      default:
        return 'calendar-event-chip-low';
    }
  }

  public isCalendarEventTypeVisible(type: CalendarEventType): boolean {
    return this.eventTypeVisibility()[type];
  }

  public setCalendarEventTypeVisibility(type: CalendarEventType, isVisible: boolean): void {
    this.eventTypeVisibility.update((visibility) => ({
      ...visibility,
      [type]: isVisible,
    }));
    this.calendarDays.set(this.buildCalendarDays(this.currentMonth));
  }

  private loadCalendarEvents(onLoaded?: () => void, onError?: () => void): void {
    this.calendarEventService.getCalendarEvents().subscribe({
      next: (calendarEvents) => {
        this.calendarEventsByDate = this.groupCalendarEventsByDate(calendarEvents ?? []);
        this.calendarDays.set(this.buildCalendarDays(this.currentMonth));
        onLoaded?.();
      },
      error: (error) => {
        console.error('Error loading calendar events:', error);
        this.calendarEventsByDate = new Map<string, CalendarEvent[]>();
        this.calendarDays.set(this.buildCalendarDays(this.currentMonth));
        onError?.();
      },
    });
  }

  private showSaveSuccessMessage(): void {
    this.snackBar.open('Salvataggio avvenuto con successo', 'Chiudi', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }

  private finishSavingAfterMinimumDuration(startedAt: number, onFinish: () => void): void {
    const elapsedTime = Date.now() - startedAt;
    const remainingTime = Math.max(this.minimumLoaderDurationMs - elapsedTime, 0);

    window.setTimeout(onFinish, remainingTime);
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
      const dayEvents = this.calendarEventsByDate.get(this.toDateKey(date)) ?? [];

      return {
        date,
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === month.getMonth(),
        isToday: this.isSameDate(date, new Date()),
        hasClosure: dayEvents.some((event) => this.getCalendarEventType(event) === 'CLOSURE'),
        ariaLabel: this.formatAriaLabel(date),
        events: dayEvents
          .filter((event) => this.isCalendarEventTypeVisible(this.getCalendarEventType(event))),
      };
    });
  }

  private getCalendarEventType(event: CalendarEvent): CalendarEventType {
    return event.type ?? CalendarEvent.TypeEnum.Generic;
  }

  private initializeClosureSelection(): void {
    const closureDateKeys = new Set<string>();

    for (const event of this.getClosureEvents()) {
      const eventDate = new Date(event.date);

      if (!Number.isNaN(eventDate.getTime())) {
        closureDateKeys.add(this.toDateKey(eventDate));
      }
    }

    this.initialClosureDateKeys = closureDateKeys;
    this.selectedClosureDateKeys.set(new Set(closureDateKeys));
  }

  private getClosureEvents(): CalendarEvent[] {
    return [...this.calendarEventsByDate.values()]
      .flat()
      .filter((event) => this.getCalendarEventType(event) === CalendarEvent.TypeEnum.Closure);
  }

  private buildClosureEditorMonths(year: number, selectedDateKeys: Set<string>): ClosureEditorMonth[] {
    return Array.from({ length: 12 }, (_, monthIndex) => {
      const firstDayOfMonth = new Date(year, monthIndex, 1);
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      const leadingDays = (firstDayOfMonth.getDay() + 6) % 7;
      const totalCells = Math.ceil((leadingDays + daysInMonth) / 7) * 7;

      return {
        label: new Intl.DateTimeFormat('it-IT', { month: 'long' }).format(firstDayOfMonth),
        days: Array.from({ length: totalCells }, (_, index): ClosureEditorDay => {
          const dayNumber = index - leadingDays + 1;

          if (dayNumber < 1 || dayNumber > daysInMonth) {
            return { date: null, dateKey: null, dayNumber: null, isToday: false, isSelected: false };
          }

          const date = new Date(year, monthIndex, dayNumber);
          const dateKey = this.toDateKey(date);

          return {
            date,
            dateKey,
            dayNumber,
            isToday: this.isSameDate(date, new Date()),
            isSelected: selectedDateKeys.has(dateKey),
          };
        }),
      };
    });
  }

  private toClosureEventDate(dateKey: string): string {
    const date = this.parseDateInput(dateKey);
    return date ? date.toISOString() : new Date().toISOString();
  }

  private toDateInputValue(date: Date): string {
    return this.toDateKey(date);
  }

  private parseDateInput(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) {
      return null;
    }

    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);

    return Number.isNaN(date.getTime()) ? null : date;
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
