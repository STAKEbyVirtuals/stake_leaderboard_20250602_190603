import axios from "axios";
import { LeaderboardItem } from './types';
import { SHEET_BEST_URL } from './constants';

export async function fetchLeaderboardData(): Promise<LeaderboardItem[]> {
  try {
    const response = await axios.get(SHEET_BEST_URL, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.data) {
      throw new Error('응답 데이터가 없습니다');
    }
    
    let rawData;
    if (response.data.leaderboard) {
      rawData = response.data.leaderboard;
    } else if (Array.isArray(response.data)) {
      rawData = response.data;
    } else {
      throw new Error('알 수 없는 데이터 형식');
    }
    
    if (!Array.isArray(rawData) || rawData.length === 0) {
      throw new Error('유효하지 않은 데이터 배열');
    }
    
    const transformedData: LeaderboardItem[] = rawData
      .filter((item: any) => item.is_active !== false && Number(item.total_staked) > 0)
      .slice(0, 100)
      .map((item: any, index: number) => ({
        name: item.address ? `${item.address.slice(0, 6)}...${item.address.slice(-4)}` : `Unknown${index}`,
        value: Number(item.airdrop_share_phase) || Math.random() * 2 + 1,
        tier: item.grade || "Sizzlin' Noob",
        change: (Math.random() * 1.5 - 0.5).toFixed(2),
        score: Number(item.time_score) || 0,
        time: Math.round(Number(item.holding_days) || 0) + "d",
        rank: Number(item.rank) || index + 1,
        total_staked: Number(item.total_staked) || 0,
        grade: item.grade || "Sizzlin' Noob",
        percentile: Number(item.percentile) || 100,
        address: item.address || "",
        stake_count: Number(item.stake_count) || 0,
        holding_days: Number(item.holding_days) || 0
      }));
    
    // 백분율 정규화
    const totalValue = transformedData.reduce((sum, item) => sum + item.value, 0);
    if (totalValue > 0) {
      transformedData.forEach(item => {
        item.value = (item.value / totalValue) * 100;
      });
    }
    
    return transformedData;
    
  } catch (err: any) {
    throw new Error(err.message);
  }
}