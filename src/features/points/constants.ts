export const POINTS_ACTIONS = {
  DEAL_CREATED: 'deal_created',
} as const;

export type PointsActionType = (typeof POINTS_ACTIONS)[keyof typeof POINTS_ACTIONS];

export const POINTS_RULES: Record<PointsActionType, number> = {
  [POINTS_ACTIONS.DEAL_CREATED]: 10,
};
