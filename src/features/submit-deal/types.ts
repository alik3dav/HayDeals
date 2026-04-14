import type { DealTypeCode } from '@/features/submit-deal/deal-type-config';

export type SubmitDealOption = {
  id: string;
  label: string;
  value: string;
};

export type SubmitDealDealType = SubmitDealOption & {
  code: DealTypeCode;
};

export type SubmitDealMeta = {
  categories: SubmitDealOption[];
  stores: SubmitDealOption[];
  dealTypes: SubmitDealDealType[];
};

export type SubmitDealActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};
