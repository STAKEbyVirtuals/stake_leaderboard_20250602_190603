export type StakeTier =
  | 'Rare'
  | 'Medium'
  | 'Medium Rare'
  | 'Well-done'
  | 'Charred';

export function getStakeTier(stakeStartDate: string, unstaked: boolean): StakeTier {
  const now = new Date();
  const start = new Date(stakeStartDate);
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  if (unstaked) return 'Charred';
  if (diffDays >= 56) return 'Well-done';        // 8주 이상
  if (diffDays >= 28) return 'Medium Rare';     // 4주 이상
  if (diffDays >= 7) return 'Medium';           // 1주 이상
  return 'Rare';
}
