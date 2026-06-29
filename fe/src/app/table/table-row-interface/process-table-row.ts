import {Item } from '../../api';

export interface ProcessTableRow {
  id?: string;
  item: Item;
  loomId?: string;
  days?: number;
  metersRun?: number;
  metersToGo?: number;
  expectedEndDate?: string;
}