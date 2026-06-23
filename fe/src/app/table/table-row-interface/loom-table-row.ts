import { Loom } from '../../api';

export interface LoomTableRow {
  id?: string;
  loom: Loom;
  serialNumber: string;
  status: Loom.StatusEnum;
}
