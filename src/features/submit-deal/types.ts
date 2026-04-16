import type { DealTypeCode } from '@/features/submit-deal/deal-type-config';

export type SubmitDealOption = {
  id: string;
  label: string;
  value: string;
};

export type SubmitDealDealType = SubmitDealOption & {
  code: DealTypeCode;
};


export type SubmitAvailabilityScopeOption = {
  value: 'worldwide' | 'region' | 'country';
  label: string;
};

export type SubmitDealMeta = {
  categories: SubmitDealOption[];
  stores: SubmitDealOption[];
  dealTypes: SubmitDealDealType[];
  availabilityScopes: SubmitAvailabilityScopeOption[];
  availabilityRegions: SubmitDealOption[];
  availabilityCountries: SubmitDealOption[];
};

export type SubmitDealActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};
