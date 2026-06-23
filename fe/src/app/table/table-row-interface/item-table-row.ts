import { Arrangement, Customer, Item } from '../../api';

export interface ItemTableRow {
  id?: string;
  item: Item;
  state?: Item.StateEnum;
  arrangement?: Arrangement;
  customer?: Customer;
}
