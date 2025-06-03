// 데이터 타입 정의
export interface LeaderboardItem {
  name: string;
  value: number;
  tier: string;
  change: string;
  score: number;
  time: string;
  rank: number;
  total_staked: number;
  grade: string;
  percentile: number;
  address: string;
  stake_count: number;
  holding_days: number;
}

export type BoxSize = "tiny" | "small" | "medium" | "large" | "xlarge";

export interface WindowSize {
  width: number;
  height: number;
}