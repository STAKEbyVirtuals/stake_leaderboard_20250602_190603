/**
 * @fileoverview 차트 데이터 생성 및 가공 관련 유틸리티 함수들.
 */

import { LeaderboardItem } from '../types';

/**
 * 더미 차트 데이터를 생성합니다. (개발 또는 테스트용)
 * 실제 데이터는 백엔드 API에서 받아와야 합니다.
 * @param count 생성할 데이터 포인트 수.
 * @returns 차트 데이터 배열.
 */
export const generateDummyChartData = (count: number = 7) => {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data = Array.from({ length: count }, (_, i) => Math.floor(Math.random() * 1000) + 100);

  return {
    labels: labels.slice(0, count),
    datasets: [
      {
        label: 'Daily Points',
        data: data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };
};

/**
 * 특정 사용자의 일일 포인트 기록을 기반으로 차트 데이터를 준비합니다.
 * @param user LeaderboardItem 객체.
 * @returns 차트 라이브러리에 적합한 데이터 구조.
 */
export const prepareDailyPointsChartData = (user: LeaderboardItem) => {
  // TODO: user 객체에 일일 포인트 기록 필드가 있다면 해당 데이터를 사용
  // 현재 LeaderboardItem에 cumulative_daily_points만 있으므로 예시 데이터로 구성
  // 실제 API 응답에 daily_points_history 같은 배열이 필요합니다.
  
  const labels = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7']; // 실제 날짜로 대체
  const data = [
    Math.round(user.cumulative_daily_points * 0.1),
    Math.round(user.cumulative_daily_points * 0.2),
    Math.round(user.cumulative_daily_points * 0.3),
    Math.round(user.cumulative_daily_points * 0.4),
    Math.round(user.cumulative_daily_points * 0.5),
    Math.round(user.cumulative_daily_points * 0.6),
    user.cumulative_daily_points, // 마지막은 총 누적 포인트
  ];

  return {
    labels: labels,
    datasets: [
      {
        label: `${user.discordUsername || user.walletAddress}'s Daily Points`,
        data: data,
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      },
    ],
  };
};

// 필요한 다른 차트 데이터 관련 함수들을 여기에 추가할 수 있습니다.
// 예: 티어별 사용자 분포, 스테이킹량 분포 등. 