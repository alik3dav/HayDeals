import { POINTS_ACTIONS, POINTS_RULES } from '@/features/points/constants';
import { awardPointsLogEntry } from '@/features/points/repository';

export async function awardPointsForDealCreation(profileId: string, dealId: string): Promise<boolean> {
  return awardPointsLogEntry({
    profileId,
    actionType: POINTS_ACTIONS.DEAL_CREATED,
    pointsAmount: POINTS_RULES[POINTS_ACTIONS.DEAL_CREATED],
    relatedEntityType: 'deal',
    relatedEntityId: dealId,
  });
}
