import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { catchError, concatMap, forkJoin, from, of, toArray } from 'rxjs';
import { DecorativeLinesComponent } from "../../reusable-components/decorative-lines-component/decorative-lines-component";
import { TitlePageComponent } from "../../reusable-components/title-page-component/title-page-component";
import { ButtonGeneralActionComponent } from '../../reusable-components/button/button-general-action-component/button-general-action-component';
import { LoaderComponent } from '../../reusable-components/loader-component/loader-component';
import { CalendarEvent, Item } from '../../../api';
import { CalendarEventFacadeService } from '../../../services/calendar-event-facade.service';
import { ItemFacadeService } from '../../../services/item-facade.service';
import { WhitePanel } from "../../reusable-components/white-panel/white-panel";
import { DialogCalendarActions, type DialogCalendarActionsResult } from '../../reusable-components/dialog/dialog-calendar-actions/dialog-calendar-actions';
import { DialogAlertGeneric, type DialogAlertGenericData } from '../../reusable-components/dialog/dialog-alert-generic/dialog-alert-generic';
import {
  CalendarEventCategoryFacadeService,
  type CalendarEventCategory,
} from '../../../services/calendar-event-category-facade.service';

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
type CalendarEventColorKey = 'generic' | 'delivery' | 'itemForecast' | 'loomForecast' | 'closure';

interface CalendarEventTypeOption {
  type: CalendarEventType;
  label: string;
  colorClass: string;
}

interface CalendarEventColorOption {
  key: CalendarEventColorKey;
  label: string;
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

type CalendarViewMode = 'calendar' | 'generic-event' | 'closure-editor' | 'settings';

@Component({
  selector: 'app-calendar-page',
  imports: [FormsModule, MatIconModule, MatSnackBarModule, MatTooltipModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, //DecorativeLinesComponent
    TitlePageComponent, ButtonGeneralActionComponent, LoaderComponent, WhitePanel],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
  ],
  standalone: true,
  templateUrl: './calendar-page.html',
  styleUrl: './calendar-page.scss',
})
export class CalendarPage implements OnInit {
  private readonly calendarEventService = inject(CalendarEventFacadeService);
  private readonly calendarEventCategoryService = inject(CalendarEventCategoryFacadeService);
  private readonly itemService = inject(ItemFacadeService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private calendarEventsByDate = new Map<string, CalendarEvent[]>();
  private itemDeliveryById = new Map<string, boolean>();
  private itemDeliveryByArrangementId = new Map<string, boolean>();
  private itemLateById = new Map<string, boolean>();
  private itemLateByArrangementId = new Map<string, boolean>();
  private readonly minimumLoaderDurationMs = 1000;
  private readonly calendarPaletteStorageKey = 'weavops.calendar.eventPalette';
  private readonly defaultEventPalette: Record<CalendarEventColorKey, string> = {
    generic: '#4f46e5',
    delivery: '#170da9',
    itemForecast: '#3d81f6',
    loomForecast: '#15be80',
    closure: '#dd0000',
  };

  public readonly weekDays: string[] = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  public currentMonth: Date = this.getCurrentMonth();
  public readonly monthLabel = signal(this.formatMonthLabel(this.currentMonth));
  public readonly calendarDays = signal<CalendarDay[]>(this.buildCalendarDays(this.currentMonth));
  public readonly calendarEvents = signal<CalendarEvent[]>([]);
  public readonly currentWeekDeliveryCount = signal(0);
  public readonly overdueDeliveryCount = signal(0);
  public readonly viewMode = signal<CalendarViewMode>('calendar');
  public readonly isAddEventMenuOpen = signal(false);
  public readonly closureEditorYear = signal(new Date().getFullYear());
  public readonly selectedClosureDateKeys = signal<Set<string>>(new Set<string>());
  public readonly closureEditorMonths = computed<ClosureEditorMonth[]>(() =>
    this.buildClosureEditorMonths(this.closureEditorYear(), this.selectedClosureDateKeys())
  );
  public readonly isSavingClosures = signal(false);
  public readonly isSavingGenericEvent = signal(false);
  public readonly isDeletingGenericEvent = signal(false);
  public readonly isUpdatingGenericEvent = signal(false);
  public readonly isSaving = computed(() =>
    this.isSavingClosures()
    || this.isSavingGenericEvent()
    || this.isDeletingGenericEvent()
    || this.isUpdatingGenericEvent()
  );
  public genericEventDescription = '';
  public genericEventDate: Date | null = null;
  public genericEventCategoryId = '';
  public newEventCategoryName = '';
  public newEventCategoryColor = '#64748b';
  public readonly eventPalette = signal<Record<CalendarEventColorKey, string>>({ ...this.defaultEventPalette });
  public readonly customEventCategories = signal<CalendarEventCategory[]>([]);
  public readonly eventTypeOptions: CalendarEventTypeOption[] = [
    { type: CalendarEvent.TypeEnum.Generic, label: 'Evento generico', colorClass: 'calendar-event-color-generic' },
    { type: CalendarEvent.TypeEnum.Delivery, label: 'Consegna articolo', colorClass: 'calendar-event-color-delivery' },
    { type: CalendarEvent.TypeEnum.ItemForecast, label: 'Fine prevista articolo', colorClass: 'calendar-event-color-item-forecast' },
    { type: CalendarEvent.TypeEnum.LoomForecast, label: 'Fine prevista telaio', colorClass: 'calendar-event-color-loom-forecast' },
    { type: 'CLOSURE', label: 'Chiusura aziendale', colorClass: 'calendar-event-color-closure' },
  ];
  public readonly eventColorOptions: CalendarEventColorOption[] = [
    { key: 'generic', label: 'Evento generico' },
    { key: 'delivery', label: 'Consegna articolo' },
    { key: 'itemForecast', label: 'Fine prevista articolo' },
    { key: 'loomForecast', label: 'Fine prevista telaio' },
    { key: 'closure', label: 'Chiusura aziendale' },
  ];
  private readonly eventTypeVisibility = signal<Record<CalendarEventType, boolean>>({
    [CalendarEvent.TypeEnum.Generic]: true,
    [CalendarEvent.TypeEnum.Delivery]: true,
    [CalendarEvent.TypeEnum.ItemForecast]: true,
    [CalendarEvent.TypeEnum.LoomForecast]: true,
    CLOSURE: true,
  });
  private readonly customCategoryVisibility = signal<Record<string, boolean>>({});
  private initialClosureDateKeys = new Set<string>();

  public ngOnInit(): void {
    this.loadStoredEventPalette();
    this.loadCustomEventCategories();
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
    this.genericEventDate = new Date();
    this.genericEventCategoryId = '';
    this.isAddEventMenuOpen.set(false);
    this.viewMode.set('generic-event');
  }

  public openClosureEditor(): void {
    this.initializeClosureSelection();
    this.closureEditorYear.set(new Date().getFullYear());
    this.isAddEventMenuOpen.set(false);
    this.viewMode.set('closure-editor');
  }

  public openCalendarSettings(): void {
    this.isAddEventMenuOpen.set(false);
    this.viewMode.set('settings');
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
    const date = this.genericEventDate;
    const categoryId = this.genericEventCategoryId;

    if (!description || !date || Number.isNaN(date.getTime()) || this.isSavingGenericEvent()) {
      return;
    }

    if (this.isPastDate(date)) {
      this.openPastGenericEventAlert(description, date, categoryId);
      return;
    }

    this.createGenericCalendarEvent(description, date, categoryId);
  }

  private createGenericCalendarEvent(description: string, date: Date, categoryId: string = ''): void {
    const saveStartedAt = Date.now();
    this.isSavingGenericEvent.set(true);
    this.calendarEventService.createCalendarEvent({
      description,
      date: date.toISOString(),
      type: CalendarEvent.TypeEnum.Generic,
      categoryId: categoryId || undefined,
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

  private openPastGenericEventAlert(description: string, date: Date, categoryId: string): void {
    const dialogRef = this.dialog.open<DialogAlertGeneric, DialogAlertGenericData, boolean>(DialogAlertGeneric, {
      panelClass: 'loom-alert-dialog-panel',
      autoFocus: false,
      data: {
        text: "L'evento che vuoi inserire è nel passato, continuare?",
        icon: 'help',
        iconColor: 'var(--weavops-color-primary)',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.createGenericCalendarEvent(description, date, categoryId);
      }
    });
  }

  public getCalendarEventChipClass(event: CalendarEvent): string {
    if (event.categoryId) {
      return 'calendar-event-chip-custom';
    }

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

  public getCalendarEventChipColor(event: CalendarEvent): string | null {
    if (event.categoryId) {
      return this.getCustomEventCategory(event.categoryId)?.color ?? null;
    }

    switch (this.getCalendarEventType(event)) {
      case CalendarEvent.TypeEnum.Generic:
        return this.getCalendarEventColor('generic');
      case CalendarEvent.TypeEnum.Delivery:
        return this.getCalendarEventColor('delivery');
      case CalendarEvent.TypeEnum.ItemForecast:
        return this.getCalendarEventColor('itemForecast');
      case CalendarEvent.TypeEnum.LoomForecast:
        return this.getCalendarEventColor('loomForecast');
      case 'CLOSURE':
        return this.getCalendarEventColor('closure');
      default:
        return null;
    }
  }

  public getCustomEventCategory(categoryId: string | undefined): CalendarEventCategory | undefined {
    if (!categoryId) {
      return undefined;
    }

    return this.customEventCategories().find((category) => category.id === categoryId);
  }

  public isGenericCalendarEvent(event: CalendarEvent): boolean {
    return this.getCalendarEventType(event) === CalendarEvent.TypeEnum.Generic;
  }

  public isDeliveredDeliveryEvent(event: CalendarEvent): boolean {
    if (this.getCalendarEventType(event) !== CalendarEvent.TypeEnum.Delivery) {
      return false;
    }

    return (!!event.itemId && this.itemDeliveryById.get(event.itemId) === true)
      || (!!event.arrangementId && this.itemDeliveryByArrangementId.get(event.arrangementId) === true);
  }

  public isLateDeliveryEvent(event: CalendarEvent): boolean {
    if (this.getCalendarEventType(event) !== CalendarEvent.TypeEnum.Delivery) {
      return false;
    }

    return (!!event.itemId && this.itemLateById.get(event.itemId) === true)
      || (!!event.arrangementId && this.itemLateByArrangementId.get(event.arrangementId) === true);
  }

  public openCalendarEventActions(event: CalendarEvent): void {
    if (!this.isGenericCalendarEvent(event)) {
      return;
    }

    const dialogRef = this.dialog.open<DialogCalendarActions, { event: CalendarEvent }, DialogCalendarActionsResult>(DialogCalendarActions, {
      panelClass: 'calendar-actions-dialog-panel',
      data: { event },
    });

    dialogRef.afterClosed().subscribe((action) => {
      if (action === 'delete') {
        this.deleteGenericCalendarEvent(event);
        return;
      }

      if (action && action.action === 'edit') {
        this.updateGenericCalendarEvent(event, action.event);
      }
    });
  }

  public isCalendarEventTypeVisible(type: CalendarEventType): boolean {
    return this.eventTypeVisibility()[type];
  }

  public isCustomCategoryVisible(categoryId: string | undefined): boolean {
    return !categoryId || this.customCategoryVisibility()[categoryId] !== false;
  }

  public setCustomCategoryVisibility(categoryId: string | undefined, isVisible: boolean): void {
    if (!categoryId) {
      return;
    }

    this.customCategoryVisibility.update((visibility) => ({
      ...visibility,
      [categoryId]: isVisible,
    }));
    this.calendarDays.set(this.buildCalendarDays(this.currentMonth));
  }

  public setCalendarEventTypeVisibility(type: CalendarEventType, isVisible: boolean): void {
    this.eventTypeVisibility.update((visibility) => ({
      ...visibility,
      [type]: isVisible,
    }));
    this.calendarDays.set(this.buildCalendarDays(this.currentMonth));
  }

  public createCustomEventCategory(): void {
    const name = this.newEventCategoryName.trim();
    const color = this.newEventCategoryColor;

    if (!name || !this.isValidHexColor(color)) {
      return;
    }

    this.calendarEventCategoryService.create({ name, color }).subscribe({
      next: (category) => {
        this.customEventCategories.update((categories) => [...categories, category]);
        if (category.id) {
          this.setCustomCategoryVisibility(category.id, true);
        }
        this.newEventCategoryName = '';
        this.newEventCategoryColor = '#64748b';
        this.calendarDays.set(this.buildCalendarDays(this.currentMonth));
      },
      error: (error) => console.error('Error creating calendar event category:', error),
    });
  }

  public updateCustomEventCategory(category: CalendarEventCategory, changes: Partial<CalendarEventCategory>): void {
    if (!category.id || category.standard) {
      return;
    }

    const updatedCategory = {
      ...category,
      ...changes,
      name: (changes.name ?? category.name).trim(),
    };

    if (!updatedCategory.name || !this.isValidHexColor(updatedCategory.color)) {
      return;
    }

    this.calendarEventCategoryService.update(category.id, updatedCategory).subscribe({
      next: (savedCategory) => {
        this.customEventCategories.update((categories) =>
          categories.map((currentCategory) => currentCategory.id === savedCategory.id ? savedCategory : currentCategory)
        );
        this.calendarDays.set(this.buildCalendarDays(this.currentMonth));
      },
      error: (error) => console.error('Error updating calendar event category:', error),
    });
  }

  public removeCustomEventCategory(category: CalendarEventCategory): void {
    if (!category.id || category.standard) {
      return;
    }

    this.calendarEventCategoryService.remove(category.id).subscribe({
      next: () => {
        this.customEventCategories.update((categories) =>
          categories.filter((currentCategory) => currentCategory.id !== category.id)
        );
        if (this.genericEventCategoryId === category.id) {
          this.genericEventCategoryId = '';
        }
        this.customCategoryVisibility.update((visibility) => {
          const updatedVisibility = { ...visibility };
          delete updatedVisibility[category.id!];
          return updatedVisibility;
        });
        this.loadCalendarEvents();
      },
      error: (error) => console.error('Error deleting calendar event category:', error),
    });
  }

  public getCalendarEventColor(key: CalendarEventColorKey): string {
    return this.eventPalette()[key];
  }

  public setCalendarEventColor(key: CalendarEventColorKey, color: string): void {
    if (!this.isValidHexColor(color)) {
      return;
    }

    this.eventPalette.update((palette) => {
      const updatedPalette = {
        ...palette,
        [key]: color,
      };

      this.storeEventPalette(updatedPalette);
      return updatedPalette;
    });
  }

  public resetCalendarEventPalette(): void {
    const defaultPalette = { ...this.defaultEventPalette };
    this.eventPalette.set(defaultPalette);
    this.storeEventPalette(defaultPalette);
  }

  private loadCustomEventCategories(): void {
    this.calendarEventCategoryService.getAll().subscribe({
      next: (categories) => {
        const customCategories = (categories ?? []).filter((category) => category.standard !== true);
        this.customEventCategories.set(customCategories);
        this.customCategoryVisibility.update((visibility) => {
          const updatedVisibility = { ...visibility };

          for (const category of customCategories) {
            if (category.id && updatedVisibility[category.id] === undefined) {
              updatedVisibility[category.id] = true;
            }
          }

          return updatedVisibility;
        });
        this.calendarDays.set(this.buildCalendarDays(this.currentMonth));
      },
      error: (error) => console.error('Error loading calendar event categories:', error),
    });
  }

  private loadCalendarEvents(onLoaded?: () => void, onError?: () => void): void {
    forkJoin({
      calendarEvents: this.calendarEventService.getCalendarEvents(),
      currentWeekDeliveryCount: this.calendarEventService.getCurrentWeekPendingDeliveryCount().pipe(
        catchError((error) => {
          console.error('Error loading current week delivery count:', error);
          return of(0);
        }),
      ),
      overdueDeliveryCount: this.calendarEventService.getOverdueDeliveryCount().pipe(
        catchError((error) => {
          console.error('Error loading overdue delivery count:', error);
          return of(0);
        }),
      ),
      items: this.itemService.getAll().pipe(
        catchError((error) => {
          console.error('Error loading items for calendar delivery state:', error);
          return of([] as Item[]);
        }),
      ),
    }).subscribe({
      next: ({ calendarEvents, currentWeekDeliveryCount, overdueDeliveryCount, items }) => {
        const events = calendarEvents ?? [];
        this.currentWeekDeliveryCount.set(currentWeekDeliveryCount ?? 0);
        this.overdueDeliveryCount.set(overdueDeliveryCount ?? 0);
        this.setItemDeliveryMaps(items ?? []);
        this.calendarEvents.set(events);
        this.calendarEventsByDate = this.groupCalendarEventsByDate(events);
        this.calendarDays.set(this.buildCalendarDays(this.currentMonth));
        onLoaded?.();
      },
      error: (error) => {
        console.error('Error loading calendar events:', error);
        this.calendarEvents.set([]);
        this.currentWeekDeliveryCount.set(0);
        this.overdueDeliveryCount.set(0);
        this.calendarEventsByDate = new Map<string, CalendarEvent[]>();
        this.itemDeliveryById = new Map<string, boolean>();
        this.itemDeliveryByArrangementId = new Map<string, boolean>();
        this.itemLateById = new Map<string, boolean>();
        this.itemLateByArrangementId = new Map<string, boolean>();
        this.calendarDays.set(this.buildCalendarDays(this.currentMonth));
        onError?.();
      },
    });
  }

  private setItemDeliveryMaps(items: Item[]): void {
    const deliveryById = new Map<string, boolean>();
    const deliveryByArrangementId = new Map<string, boolean>();
    const lateById = new Map<string, boolean>();
    const lateByArrangementId = new Map<string, boolean>();

    for (const item of items) {
      const isDelivered = item.isDelivered === true;
      const isLate = item.isLate === true;

      if (item.id) {
        deliveryById.set(item.id, isDelivered);
        lateById.set(item.id, isLate);
      }

      if (item.arrangementId) {
        deliveryByArrangementId.set(item.arrangementId, isDelivered);
        lateByArrangementId.set(item.arrangementId, isLate);
      }
    }

    this.itemDeliveryById = deliveryById;
    this.itemDeliveryByArrangementId = deliveryByArrangementId;
    this.itemLateById = lateById;
    this.itemLateByArrangementId = lateByArrangementId;
  }

  private showSaveSuccessMessage(): void {
    this.snackBar.open('Evento aggiunto con successo', 'Chiudi', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }

  private showDeleteSuccessMessage(): void {
    this.snackBar.open('Evento eliminato con successo', 'Chiudi', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }

  private showDeleteErrorMessage(): void {
    this.snackBar.open("Errore durante l'eliminazione dell'evento", 'Chiudi', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }

  private showUpdateErrorMessage(): void {
    this.snackBar.open("Errore durante la modifica dell'evento", 'Chiudi', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }

  private deleteGenericCalendarEvent(event: CalendarEvent): void {
    if (!this.isGenericCalendarEvent(event) || this.isDeletingGenericEvent()) {
      return;
    }

    if (!event.id) {
      this.showDeleteErrorMessage();
      return;
    }

    const deleteStartedAt = Date.now();
    this.isDeletingGenericEvent.set(true);
    this.calendarEventService.deleteCalendarEvent(event.id).subscribe({
      next: () => {
        this.loadCalendarEvents(() => {
          this.finishSavingAfterMinimumDuration(deleteStartedAt, () => {
            this.isDeletingGenericEvent.set(false);
            this.showDeleteSuccessMessage();
          });
        }, () => {
          this.finishSavingAfterMinimumDuration(deleteStartedAt, () => {
            this.isDeletingGenericEvent.set(false);
          });
        });
      },
      error: (error) => {
        console.error('Error deleting generic calendar event:', error);
        this.finishSavingAfterMinimumDuration(deleteStartedAt, () => {
          this.isDeletingGenericEvent.set(false);
          this.showDeleteErrorMessage();
        });
      },
    });
  }

  private updateGenericCalendarEvent(originalEvent: CalendarEvent, updatedEvent: CalendarEvent): void {
    if (!this.isGenericCalendarEvent(originalEvent) || this.isUpdatingGenericEvent()) {
      return;
    }

    if (!originalEvent.id) {
      this.showUpdateErrorMessage();
      return;
    }

    const updateStartedAt = Date.now();
    this.isUpdatingGenericEvent.set(true);
    this.calendarEventService.updateCalendarEvent(originalEvent.id, {
      ...originalEvent,
      description: updatedEvent.description,
      date: updatedEvent.date,
      type: CalendarEvent.TypeEnum.Generic,
    }).subscribe({
      next: () => {
        this.loadCalendarEvents(() => {
          this.finishSavingAfterMinimumDuration(updateStartedAt, () => {
            this.isUpdatingGenericEvent.set(false);
            this.showSaveSuccessMessage();
          });
        }, () => {
          this.finishSavingAfterMinimumDuration(updateStartedAt, () => {
            this.isUpdatingGenericEvent.set(false);
          });
        });
      },
      error: (error) => {
        console.error('Error updating generic calendar event:', error);
        this.finishSavingAfterMinimumDuration(updateStartedAt, () => {
          this.isUpdatingGenericEvent.set(false);
          this.showUpdateErrorMessage();
        });
      },
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
          .filter((event) => this.isCalendarEventVisible(event)),
      };
    });
  }

  private isCalendarEventVisible(event: CalendarEvent): boolean {
    return this.isCalendarEventTypeVisible(this.getCalendarEventType(event))
      && this.isCustomCategoryVisible(event.categoryId);
  }

  private getCalendarEventType(event: CalendarEvent): CalendarEventType {
    return event.type ?? CalendarEvent.TypeEnum.Generic;
  }

  private loadStoredEventPalette(): void {
    try {
      const storedPalette = window.localStorage.getItem(this.calendarPaletteStorageKey);

      if (!storedPalette) {
        return;
      }

      const parsedPalette = JSON.parse(storedPalette) as Partial<Record<CalendarEventColorKey, unknown>>;
      const nextPalette = { ...this.defaultEventPalette };

      for (const key of Object.keys(this.defaultEventPalette) as CalendarEventColorKey[]) {
        const color = parsedPalette[key];

        if (typeof color === 'string' && this.isValidHexColor(color)) {
          nextPalette[key] = color;
        }
      }

      this.eventPalette.set(nextPalette);
    } catch (error) {
      console.error('Error loading calendar event palette:', error);
    }
  }

  private storeEventPalette(palette: Record<CalendarEventColorKey, string>): void {
    try {
      window.localStorage.setItem(this.calendarPaletteStorageKey, JSON.stringify(palette));
    } catch (error) {
      console.error('Error saving calendar event palette:', error);
    }
  }

  private isValidHexColor(color: string): boolean {
    return /^#[\da-f]{6}$/i.test(color);
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

  private isPastDate(date: Date): boolean {
    const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    return selectedDate < todayDate;
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
