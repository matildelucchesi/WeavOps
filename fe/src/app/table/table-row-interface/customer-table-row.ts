import { Customer } from '../../api';

export interface CustomerTableRow {
  id?: string;
  customer: Customer;
  name: string;
  email: string;
  referent: string;
  phoneNumber: string;
  note: string;
}
