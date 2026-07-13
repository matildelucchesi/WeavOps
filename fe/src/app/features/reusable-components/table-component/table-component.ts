import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { AddButtonComponent } from '../button/add-button-component/add-button-component';
import { DialogDelete } from '../dialog/dialog-delete/dialog-delete';
import type { DialogDeleteData } from '../dialog/dialog-delete/dialog-delete';
import { FilterButtonComponent, type FilterOption, type FilterValues } from '../button/filter-button-component/filter-button-component';
import { forkJoin, type Observable } from 'rxjs';

export interface TableColumn<T = any> {
  header: string;
  field?: keyof T | string;
  value?: (row: T) => string | number | null | undefined;
  chip?: boolean | TableChipConfig<T>;
  icon?: TableIconConfig<T>;
  checkbox?: TableCheckboxConfig<T>;
}

export interface TableCheckboxConfig<T = any> {
  checked: (row: T) => boolean;
  disabled?: boolean | ((row: T) => boolean);
  ariaLabel?: string | ((row: T) => string);
  onChange?: (row: T, checked: boolean) => void;
}

export interface TableIconConfig<T = any> {
  name: string | ((row: T) => string);
  color?: string | ((row: T) => string);
  tooltip?: string | ((row: T) => string);
  visible?: boolean | ((row: T) => boolean);
}

export interface TableChipConfig<T = any> {
  label?: (value: string | number, row: T) => string;
  styles?: Record<string, TableChipStyle<T>>;
  defaultStyle?: TableChipStyle<T>;
}

export interface TableChipStyle<T = any> {
  label?: string | ((row: T) => string);
  backgroundColor?: string | ((row: T) => string);
  color?: string | ((row: T) => string);
  borderColor?: string | ((row: T) => string);
  width?: string | ((row: T) => string);
  minWidth?: string | ((row: T) => string);
  height?: string | ((row: T) => string);
}

export interface TableAction<T = any> {
  id: string;
  label: string;
  icon?: string;
  imageIcon?: string | ((row: T) => string | undefined);
  imageAlt?: string;
  iconColor?: string;
  visible?: boolean | ((row: T) => boolean);
  disabled?: boolean | ((row: T) => boolean);
  deleteItem?: (row: T) => Observable<unknown>;
  deleteItems?: (rows: T[]) => Observable<unknown>;
  deleteItemName?: (row: T) => string | undefined;
  deleteDialogTitle?: string | ((row: T) => string);
  deleteDialogMessage?: string | ((row: T) => string);
  deleteSuccessMessage?: string | ((row: T) => string);
  deleteErrorMessage?: string | ((row: T) => string);
}

export interface TableActionClick<T = any> {
  action: TableAction<T>;
  row: T;
  rowIndex: number;
}

export interface TableBulkActionClick<T = any> {
  action: TableAction<T>;
  rows: T[];
  rowIndexes: number[];
}

export interface TableAddButtonConfig {
  label?: string;
  icon?: string;
  ariaLabel?: string;
  route?: string | any[];
  queryParams?: Record<string, unknown>;
  state?: Record<string, unknown>;
  visible?: boolean;
}

export interface TableFilterButtonConfig {
  label?: string;
  icon?: string;
  ariaLabel?: string;
  filters?: FilterOption[];
  visible?: boolean;
}

@Component({
  selector: 'app-table-component',
  imports: [
    AddButtonComponent,
    FilterButtonComponent,
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './table-component.html',
  styleUrl: './table-component.scss',
  standalone: true,
})
export class TableComponent {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  @Input() columns: Array<string | TableColumn> = [];
  @Input() actions: TableAction[] = [];
  @Input() addButton: TableAddButtonConfig | null = null;
  @Input() filterButton: TableFilterButtonConfig | null = null;
  @Input() actionColumnHeader: string = 'Azioni';
  @Input() actionIconColor: string = 'var(--weavops-color-primary)';
  @Input() pageSizeOptions: number[] = [10, 15, 20, 50];
  @Input() sortByCreationDate: boolean = true;
  @Input() showPagination: boolean = true;
  @Input() enableMultiSelection: boolean = true;
  @Input()
  set rows(value: any[] | null | undefined) {
    this._rows = value ?? [];
    this.currentPage = 1;
    this.clearSelection();
    this.clampCurrentPage();
  }
  get rows(): any[] {
    return this._rows;
  }

  @Input()
  set pageSize(value: number | string) {
    const parsedValue = Number(value);
    this._pageSize = Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 10;
    this.currentPage = 1;
    this.clampCurrentPage();
  }
  get pageSize(): number {
    return this._pageSize;
  }

  @Output() actionClick = new EventEmitter<TableActionClick>();
  @Output() addButtonClick = new EventEmitter<void>();
  @Output() bulkActionClick = new EventEmitter<TableBulkActionClick>();
  @Output() filterSelected = new EventEmitter<FilterValues>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() selectedRowsChange = new EventEmitter<any[]>();

  private _rows: any[] = [];
  private _pageSize: number = 10;
  private activeFilterValues: FilterValues = {};
  private readonly selectedRows = new Set<any>();

  public currentPage: number = 1;

  public get paginatedRows(): any[] {
    if (!this.showPagination) {
      return this.sortedRows;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.sortedRows.slice(startIndex, startIndex + this.pageSize);
  }

  public get totalRows(): number {
    return this.sortedRows.length;
  }

  public get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalRows / this.pageSize));
  }

  public get firstVisibleItem(): number {
    return this.totalRows === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  public get lastVisibleItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRows);
  }

  public get shouldShowPagination(): boolean {
    return this.showPagination;
  }

  public get shouldShowEmptyState(): boolean {
    return this.totalRows === 0;
  }

  public get emptyStateColumnSpan(): number {
    const selectionColumnCount = this.enableMultiSelection ? 1 : 0;
    const actionsColumnCount = this.actions.length > 0 ? 1 : 0;

    return Math.max(1, this.columns.length + selectionColumnCount + actionsColumnCount);
  }

  public get isPreviousPageDisabled(): boolean {
    return this.currentPage <= 1;
  }

  public get isNextPageDisabled(): boolean {
    return this.currentPage >= this.totalPages;
  }

  public get selectedRowsCount(): number {
    return this.selectedRows.size;
  }

  public get hasSelectedRows(): boolean {
    return this.selectedRowsCount > 0;
  }

  public get areAllRowsSelected(): boolean {
    return this.totalRows > 0 && this.selectedRowsCount === this.totalRows;
  }

  public get isSelectionIndeterminate(): boolean {
    return this.hasSelectedRows && !this.areAllRowsSelected;
  }

  public get selectedRowsList(): any[] {
    return this.sortedRows.filter((row) => this.selectedRows.has(row));
  }

  public get selectedDeleteAction(): TableAction | undefined {
    return this.actions.find((action) => action.id === 'delete' && (action.deleteItem || action.deleteItems));
  }

  public get shouldShowBulkDeleteButton(): boolean {
    return this.enableMultiSelection && this.hasSelectedRows && Boolean(this.selectedDeleteAction);
  }

  public get shouldShowAddButton(): boolean {
    return Boolean(this.addButton && this.addButton.visible !== false);
  }

  public get shouldShowFilterButton(): boolean {
    return Boolean(this.filterButton && this.filterButton.visible !== false);
  }

  public get shouldShowTableToolbar(): boolean {
    return this.shouldShowFilterButton || this.shouldShowAddButton || this.shouldShowBulkDeleteButton;
  }

  public get addButtonLabel(): string {
    return this.addButton?.label ?? 'Aggiungi Nuovo';
  }

  public get addButtonIcon(): string {
    return this.addButton?.icon ?? 'add';
  }

  public get addButtonAriaLabel(): string {
    return this.addButton?.ariaLabel ?? this.addButtonLabel;
  }

  public get filterButtonLabel(): string {
    return this.filterButton?.label ?? 'Filtri';
  }

  public get filterButtonIcon(): string {
    return this.filterButton?.icon ?? 'search';
  }

  public get filterButtonAriaLabel(): string {
    return this.filterButton?.ariaLabel ?? this.filterButtonLabel;
  }

  public get filterOptions(): FilterOption[] {
    return this.filterButton?.filters ?? [];
  }

  public get hasActiveFilters(): boolean {
    return Object.values(this.activeFilterValues).some((value) => value.trim().length > 0);
  }

  private get sortedRows(): any[] {
    if (!this.sortByCreationDate) {
      return this.rows;
    }

    return [...this.rows].sort((firstRow, secondRow) => {
      const firstCreatedAt = this.resolveCreationTimestamp(firstRow);
      const secondCreatedAt = this.resolveCreationTimestamp(secondRow);

      if (firstCreatedAt === null && secondCreatedAt === null) {
        return 0;
      }

      if (firstCreatedAt === null) {
        return 1;
      }

      if (secondCreatedAt === null) {
        return -1;
      }

      return secondCreatedAt - firstCreatedAt;
    });
  }

  public getColumnHeader(column: string | TableColumn): string {
    return typeof column === 'string' ? column : column.header;
  }

  public getCellValue(row: any, column: string | TableColumn, columnIndex: number): string | number {
    const value = this.resolveCellValue(row, column, columnIndex);
    return value ?? '';
  }

  public isChipColumn(column: string | TableColumn): boolean {
    return typeof column !== 'string' && Boolean(column.chip);
  }

  public isIconColumn(column: string | TableColumn): boolean {
    return typeof column !== 'string' && Boolean(column.icon);
  }

  public isCheckboxColumn(column: string | TableColumn): boolean {
    return typeof column !== 'string' && Boolean(column.checkbox);
  }

  public isColumnCheckboxChecked(row: any, column: string | TableColumn): boolean {
    return typeof column !== 'string' && Boolean(column.checkbox?.checked(row));
  }

  public isColumnCheckboxDisabled(row: any, column: string | TableColumn): boolean {
    const disabled = typeof column === 'string' ? undefined : column.checkbox?.disabled;
    return this.resolveColumnState(disabled, row, false);
  }

  public getColumnCheckboxAriaLabel(row: any, column: string | TableColumn): string {
    const ariaLabel = typeof column === 'string' ? undefined : column.checkbox?.ariaLabel;
    return this.resolveColumnText(ariaLabel, row, 'Seleziona valore');
  }

  public handleColumnCheckboxChange(row: any, column: string | TableColumn, checked: boolean): void {
    if (typeof column === 'string' || this.isColumnCheckboxDisabled(row, column)) {
      return;
    }

    column.checkbox?.onChange?.(row, checked);
  }

  public isColumnIconVisible(row: any, column: string | TableColumn): boolean {
    const visible = typeof column === 'string' ? undefined : column.icon?.visible;

    return this.resolveColumnState(visible, row, true);
  }

  public getColumnIconName(row: any, column: string | TableColumn): string {
    const name = typeof column === 'string' ? undefined : column.icon?.name;

    return typeof name === 'function' ? name(row) : name ?? '';
  }

  public getColumnIconColor(row: any, column: string | TableColumn): string {
    const color = typeof column === 'string' ? undefined : column.icon?.color;

    return this.resolveColumnText(color, row, 'var(--weavops-color-primary)');
  }

  public getColumnIconTooltip(row: any, column: string | TableColumn): string {
    const tooltip = typeof column === 'string' ? undefined : column.icon?.tooltip;

    return this.resolveColumnText(tooltip, row, '');
  }

  public getChipLabel(row: any, column: string | TableColumn, columnIndex: number): string {
    const value = this.getCellValue(row, column, columnIndex);
    const chipConfig = this.getChipConfig(column);
    const chipStyle = this.getChipStyle(row, column, columnIndex);

    if (typeof chipStyle?.label === 'function') {
      return chipStyle.label(row);
    }

    if (typeof chipStyle?.label === 'string') {
      return chipStyle.label;
    }

    if (chipConfig?.label) {
      return chipConfig.label(value, row);
    }

    return String(value);
  }

  public getChipBackgroundColor(row: any, column: string | TableColumn, columnIndex: number): string {
    return this.resolveChipStyleValue(
      this.getChipStyle(row, column, columnIndex)?.backgroundColor,
      row,
      'var(--weavops-color-primary-soft)',
    );
  }

  public getChipTextColor(row: any, column: string | TableColumn, columnIndex: number): string {
    return this.resolveChipStyleValue(
      this.getChipStyle(row, column, columnIndex)?.color,
      row,
      'var(--weavops-color-primary)',
    );
  }

  public getChipBorderColor(row: any, column: string | TableColumn, columnIndex: number): string {
    return this.resolveChipStyleValue(
      this.getChipStyle(row, column, columnIndex)?.borderColor,
      row,
      this.getChipTextColor(row, column, columnIndex),
    );
  }

  public getChipWidth(row: any, column: string | TableColumn, columnIndex: number): string {
    return this.resolveChipStyleValue(
      this.getChipStyle(row, column, columnIndex)?.width,
      row,
      'auto',
    );
  }

  public getChipMinWidth(row: any, column: string | TableColumn, columnIndex: number): string {
    return this.resolveChipStyleValue(
      this.getChipStyle(row, column, columnIndex)?.minWidth,
      row,
      '104px',
    );
  }

  public getChipHeight(row: any, column: string | TableColumn, columnIndex: number): string {
    return this.resolveChipStyleValue(
      this.getChipStyle(row, column, columnIndex)?.height,
      row,
      '28px',
    );
  }

  public isActionVisible(action: TableAction, row: any): boolean {
    return this.resolveActionState(action.visible, row, true);
  }

  public isActionDisabled(action: TableAction, row: any): boolean {
    return this.resolveActionState(action.disabled, row, false);
  }

  public emitActionClick(action: TableAction, row: any, rowIndex: number): void {
    const absoluteRowIndex = (this.currentPage - 1) * this.pageSize + rowIndex;
    this.actionClick.emit({ action, row, rowIndex: absoluteRowIndex });
  }

  public handleActionClick(action: TableAction, row: any, rowIndex: number): void {
    if (action.id !== 'delete') {
      this.emitActionClick(action, row, rowIndex);
      return;
    }

    const dialogRef = this.dialog.open(DialogDelete, {
      panelClass: 'delete-dialog-panel',
      data: this.buildDeleteDialogData(action, row),
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.emitActionClick(action, row, rowIndex);
      }
    });
  }

  public handleAddButtonClick(): void {
    this.addButtonClick.emit();

    const route = this.addButton?.route;

    if (!route) {
      return;
    }

    this.router.navigate(Array.isArray(route) ? route : [route], {
      queryParams: this.addButton?.queryParams,
      state: this.addButton?.state,
    });
  }

  public handleFilterSelected(filters: FilterValues): void {
    this.activeFilterValues = filters;
    this.currentPage = 1;
    this.filterSelected.emit(filters);
  }

  public clearFilters(filterButtonComponent?: FilterButtonComponent): void {
    filterButtonComponent?.clearFilters();
    this.activeFilterValues = {};
    this.currentPage = 1;
    this.filterSelected.emit({});
  }

  public getActionIconColor(action: TableAction): string {
    return this.actionIconColor;
  }

  public isEditAction(action: TableAction): boolean {
    return action.id === 'edit';
  }

  public isDeleteAction(action: TableAction): boolean {
    return action.id === 'delete';
  }

  public getActionImageIcon(action: TableAction, row: any): string | undefined {
    if (typeof action.imageIcon === 'function') {
      return action.imageIcon(row);
    }

    return action.imageIcon;
  }

  public goToPreviousPage(): void {
    if (this.isPreviousPageDisabled) {
      return;
    }

    this.currentPage -= 1;
  }

  public goToNextPage(): void {
    if (this.isNextPageDisabled) {
      return;
    }

    this.currentPage += 1;
  }

  public onPageSizeChange(event: Event): void {
    const selectedPageSize = Number((event.target as HTMLSelectElement).value);
    if (!Number.isFinite(selectedPageSize) || selectedPageSize <= 0) {
      return;
    }

    this.pageSize = selectedPageSize;
    this.pageSizeChange.emit(this.pageSize);
  }

  public isRowSelected(row: any): boolean {
    return this.selectedRows.has(row);
  }

  public toggleRowSelection(row: any, isChecked: boolean): void {
    if (isChecked) {
      this.selectedRows.add(row);
    } else {
      this.selectedRows.delete(row);
    }

    this.emitSelectedRows();
  }

  public clearSelection(): void {
    if (this.selectedRows.size === 0) {
      return;
    }

    this.selectedRows.clear();
    this.emitSelectedRows();
  }

  public selectAllRows(): void {
    this.sortedRows.forEach((row) => this.selectedRows.add(row));
    this.emitSelectedRows();
  }

  public toggleAllRowsSelection(isChecked: boolean): void {
    if (isChecked) {
      this.selectAllRows();
      return;
    }

    this.clearSelection();
  }

  public handleSelectedRowsDelete(): void {
    const deleteAction = this.selectedDeleteAction;
    const selectedRows = this.selectedRowsList;

    if ((!deleteAction?.deleteItem && !deleteAction?.deleteItems) || selectedRows.length === 0) {
      return;
    }

    const rowIndexes = selectedRows.map((row) => this.sortedRows.indexOf(row));
    const dialogRef = this.dialog.open(DialogDelete, {
      panelClass: 'delete-dialog-panel',
      data: this.buildBulkDeleteDialogData(deleteAction, selectedRows),
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.clearSelection();
      this.bulkActionClick.emit({ action: deleteAction, rows: selectedRows, rowIndexes });
    });
  }

  private resolveCellValue(
    row: any,
    column: string | TableColumn,
    columnIndex: number,
  ): string | number | null | undefined {
    if (Array.isArray(row)) {
      return row[columnIndex];
    }

    if (!row || typeof row !== 'object') {
      return columnIndex === 0 ? row : '';
    }

    if (typeof column !== 'string') {
      if (column.value) {
        return column.value(row);
      }

      if (column.field) {
        return row[column.field as string];
      }
    }

    return Object.values(row)[columnIndex] as string | number | null | undefined;
  }

  private getChipConfig(column: string | TableColumn): TableChipConfig | null {
    if (typeof column === 'string' || !column.chip || column.chip === true) {
      return null;
    }

    return column.chip;
  }

  private getChipStyle(row: any, column: string | TableColumn, columnIndex: number): TableChipStyle | undefined {
    const chipConfig = this.getChipConfig(column);
    const value = this.getCellValue(row, column, columnIndex);
    const valueStyle = chipConfig?.styles?.[String(value)];

    return {
      ...chipConfig?.defaultStyle,
      ...valueStyle,
    };
  }

  private resolveChipStyleValue(
    value: string | ((row: any) => string) | undefined,
    row: any,
    fallback: string,
  ): string {
    if (typeof value === 'function') {
      return value(row);
    }

    return value ?? fallback;
  }

  private resolveActionState(
    state: boolean | ((row: any) => boolean) | undefined,
    row: any,
    defaultValue: boolean,
  ): boolean {
    if (typeof state === 'function') {
      return state(row);
    }

    return state ?? defaultValue;
  }

  private resolveColumnState(
    state: boolean | ((row: any) => boolean) | undefined,
    row: any,
    defaultValue: boolean,
  ): boolean {
    if (typeof state === 'function') {
      return state(row);
    }

    return state ?? defaultValue;
  }

  private resolveColumnText(
    value: string | ((row: any) => string) | undefined,
    row: any,
    fallback: string,
  ): string {
    return typeof value === 'function' ? value(row) : value ?? fallback;
  }

  private resolveCreationTimestamp(row: any): number | null {
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      return null;
    }

    const dateValue = this.findFirstValue(row, [
      'createdAt',
      'createdDate',
      'creationDate',
      'dateCreated',
      'created_at',
      'created',
    ]);
    const dateTimestamp = this.toTimestamp(dateValue);

    if (dateTimestamp !== null) {
      return dateTimestamp;
    }

    const idValue = this.findFirstValue(row, ['id', '_id']);

    if (typeof idValue === 'string') {
      return this.getTimestampFromMongoId(idValue);
    }

    return null;
  }

  private findFirstValue(row: Record<string, any>, keys: string[]): unknown {
    for (const key of keys) {
      if (row[key] !== null && row[key] !== undefined) {
        return row[key];
      }

      const nestedCustomer = row['customer'];

      if (nestedCustomer && typeof nestedCustomer === 'object' && key in nestedCustomer) {
        return nestedCustomer[key];
      }
    }

    return null;
  }

  private toTimestamp(value: unknown): number | null {
    if (value instanceof Date) {
      return value.getTime();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value !== 'string' || value.trim() === '') {
      return null;
    }

    const timestamp = Date.parse(value);

    return Number.isNaN(timestamp) ? null : timestamp;
  }

  private getTimestampFromMongoId(id: string): number | null {
    if (!/^[a-f\d]{24}$/i.test(id)) {
      return null;
    }

    return Number.parseInt(id.slice(0, 8), 16) * 1000;
  }

  private buildDeleteDialogData(action: TableAction, row: any): DialogDeleteData {
    const deleteItem = action.deleteItem;

    return {
      title: this.resolveDeleteActionText(action.deleteDialogTitle, row),
      message: this.resolveDeleteActionText(action.deleteDialogMessage, row),
      item: row,
      itemName: this.resolveDeleteItemName(action, row),
      successMessage: this.resolveDeleteActionText(action.deleteSuccessMessage, row),
      errorMessage: this.resolveDeleteActionText(action.deleteErrorMessage, row),
      deleteItem: deleteItem ? (item) => deleteItem(item) : undefined,
    };
  }

  private buildBulkDeleteDialogData(action: TableAction, rows: any[]): DialogDeleteData<any[]> {
    const deleteItem = action.deleteItem;
    const deleteItems = action.deleteItems;
    const selectedCount = rows.length;

    return {
      title: 'Elimina elementi',
      message: selectedCount === 1
        ? "Vuoi eliminare l'elemento selezionato?"
        : `Vuoi eliminare ${selectedCount} elementi selezionati?`,
      item: rows,
      successMessage: selectedCount === 1
        ? 'Elemento eliminato con successo'
        : `${selectedCount} elementi eliminati con successo`,
      errorMessage: "Errore durante l'eliminazione degli elementi",
      deleteItem: (selectedRows) => {
        if (deleteItems) {
          return deleteItems(selectedRows);
        }

        if (!deleteItem) {
          return forkJoin([]);
        }

        return forkJoin(selectedRows.map((row) => deleteItem(row)));
      },
    };
  }

  private resolveDeleteItemName(action: TableAction, row: any): string | undefined {
    const configuredItemName = action.deleteItemName?.(row);

    if (typeof configuredItemName === 'string' && configuredItemName.trim()) {
      return configuredItemName.trim();
    }

    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      return undefined;
    }

    const itemName = row.name ?? row.serialNumber ?? row.customer?.name ?? row.id ?? row._id;

    return typeof itemName === 'string' && itemName.trim() ? itemName.trim() : undefined;
  }

  private resolveDeleteActionText(
    text: string | ((row: any) => string) | undefined,
    row: any,
  ): string | undefined {
    return typeof text === 'function' ? text(row) : text;
  }

  private emitSelectedRows(): void {
    this.selectedRowsChange.emit(this.sortedRows.filter((row) => this.selectedRows.has(row)));
  }

  private clampCurrentPage(): void {
    this.currentPage = Math.min(Math.max(this.currentPage, 1), this.totalPages);
  }
}
