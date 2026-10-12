export type RatePricingType = 'FIXED' | 'PER_THREAD' | 'ON_REQUEST';

export interface Rate {
  readonly id?: string;
  serviceId: string;
  minimum?: number | null;
  hours?: number | null;
  maximum?: number | null;
  amount?: number | null;
  pricingType?: RatePricingType;
  description?: string | null;
}
