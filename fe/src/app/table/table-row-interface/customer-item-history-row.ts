import { Arrangement, Customer, CustomerItemHistory, Item } from '../../api';

export interface CustomerItemHistoryRow {
  id?: string;
  history: CustomerItemHistory;
  item?: Item;
  arrangement?: Arrangement;
  customer?: Customer;
  itemName: string;
  customerName: string;
  state?: Item.StateEnum;
  stateLabel: string;
  piecesCount: string;
  pieceLength: string;
  totalMeters: string;
  metersRun: string;
  completionPercentage: string;
  startDate: string;
  expectedEndDate: string;
  deliveryDate: string;
  deliveryStatus: 'DELIVERED' | 'LATE' | 'PENDING';
  deliveryStatusLabel: string;
}
