export type SubmitDealOption = {
  id: string;
  label: string;
  value: string;
};

export type SubmitDealDealType = SubmitDealOption & {
  code: string;
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
