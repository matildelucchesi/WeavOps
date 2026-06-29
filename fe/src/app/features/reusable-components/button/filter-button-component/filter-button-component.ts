import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { InputComponent } from "../../input-component/input-component";
import { ButtonGeneralActionComponent } from "../button-general-action-component/button-general-action-component";

export interface FilterOption {
  id: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
}

export type FilterValues = Record<string, string>;

@Component({
  selector: 'app-filter-button-component',
  imports: [MatIcon, InputComponent, ButtonGeneralActionComponent],
  standalone: true,
  templateUrl: './filter-button-component.html',
  styleUrl: './filter-button-component.scss',
})
export class FilterButtonComponent {
  @Input() label: string = 'Filtri';
  @Input() icon: string = 'search';
  @Input() ariaLabel: string = 'Filtri';
  @Input() filters: FilterOption[] = [];

  @Output() filterSelected = new EventEmitter<FilterValues>();

  public isPanelOpen: boolean = false;
  public filterValues: FilterValues = {};

  public togglePanel(): void {
    if (this.filters.length === 0) {
      return;
    }

    this.isPanelOpen = !this.isPanelOpen;
  }

  public closePanel(): void {
    this.isPanelOpen = false;
  }

  public setFilterValue(filterId: string, value: string): void {
    this.filterValues = {
      ...this.filterValues,
      [filterId]: value,
    };
  }

  public getFilterValue(filterId: string): string {
    return this.filterValues[filterId] ?? '';
  }

  public applyFilters(): void {
    this.filterSelected.emit({ ...this.filterValues });
    this.isPanelOpen = false;
  }

  public clearFilters(): void {
    this.filterValues = {};
    this.isPanelOpen = false;
  }
}
