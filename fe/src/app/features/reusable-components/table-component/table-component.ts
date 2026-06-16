import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export interface TableColumn<T = any> {
  header: string;
  field?: keyof T | string;
  value?: (row: T) => string | number | null | undefined;
}

export interface TableAction<T = any> {
  id: string;
  label: string;
  icon?: string;
  iconColor?: string;
  visible?: boolean | ((row: T) => boolean);
  disabled?: boolean | ((row: T) => boolean);
}

export interface TableActionClick<T = any> {
  action: TableAction<T>;
  row: T;
  rowIndex: number;
}

@Component({
  selector: 'app-table-component',
  imports: [MatIconModule],
  templateUrl: './table-component.html',
  styleUrl: './table-component.scss',
  standalone: true,
})
export class TableComponent {

  @Input() columns: Array<string | TableColumn> = [];
  @Input() actions: TableAction[] = [];
  @Input() actionColumnHeader: string = 'Azioni';
  @Input() actionIconColor: string = 'var(--weavops-color-primary)';
  @Input() pageSizeOptions: number[] = [10, 15, 20, 50];
  @Input() showPagination: boolean = true;
  @Input()
  set rows(value: any[] | null | undefined) {
    this._rows = value ?? [];
    this.currentPage = 1;
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
  @Output() pageSizeChange = new EventEmitter<number>();

  private _rows: any[] = [];
  private _pageSize: number = 10;

  public currentPage: number = 1;

  public get paginatedRows(): any[] {
    if (!this.showPagination) {
      return this.rows;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.rows.slice(startIndex, startIndex + this.pageSize);
  }

  public get totalRows(): number {
    return this.rows.length;
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
    return this.showPagination && this.totalRows > 0;
  }

  public get isPreviousPageDisabled(): boolean {
    return this.currentPage <= 1;
  }

  public get isNextPageDisabled(): boolean {
    return this.currentPage >= this.totalPages;
  }

  public getColumnHeader(column: string | TableColumn): string {
    return typeof column === 'string' ? column : column.header;
  }

  public getCellValue(row: any, column: string | TableColumn, columnIndex: number): string | number {
    const value = this.resolveCellValue(row, column, columnIndex);
    return value ?? '';
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

  public getActionIconColor(action: TableAction): string {
    return action.iconColor ?? this.actionIconColor;
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

  private clampCurrentPage(): void {
    this.currentPage = Math.min(Math.max(this.currentPage, 1), this.totalPages);
  }
}
