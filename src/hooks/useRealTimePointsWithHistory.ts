/**
 * @fileoverview 실시간 포인트 변화를 추적하고 이력을 관리하는 커스텀 훅.
 * 이 훅은 주로 시뮬레이션 또는 프론트엔드에서 실시간 업데이트를 처리하는 데 사용될 수 있습니다.
 * 실제 포인트는 백엔드 API에서 제공되어야 합니다.
 */

import { useState, useEffect, useRef } from 'react';
import { LeaderboardItem } from '../types';

interface PointHistoryEntry {
  timestamp: number; // Unix timestamp in milliseconds
  points: number;
}

interface UseRealTimePointsOptions {
  initialPoints: number; // 초기 포인트
  updateIntervalMs?: number; // 포인트 업데이트 간격 (밀리초)
  historyLength?: number; // 유지할 이력 길이
}

/**
 * 실시간 포인트와 해당 이력을 관리하는 커스텀 훅.
 * @param options 초기 포인트, 업데이트 간격, 이력 길이 등의 옵션.
 * @returns 현재 포인트, 포인트 이력, 그리고 포인트 업데이트 함수를 포함하는 객체.
 */
export const useRealTimePointsWithHistory = (
  options: UseRealTimePointsOptions
) => {
  const { initialPoints, updateIntervalMs = 60000, historyLength = 24 } = options;

  const [currentPoints, setCurrentPoints] = useState<number>(initialPoints);
  const [pointHistory, setPointHistory] = useState<PointHistoryEntry[]>([
    { timestamp: Date.now(), points: initialPoints },
  ]);

  // 외부에서 포인트를 업데이트할 수 있도록 함수 제공
  const updatePoints = (newPoints: number) => {
    setCurrentPoints(newPoints);
    setPointHistory(prevHistory => {
      const newHistory = [...prevHistory, { timestamp: Date.now(), points: newPoints }];
      // historyLength를 초과하면 가장 오래된 항목 제거
      if (newHistory.length > historyLength) {
        return newHistory.slice(newHistory.length - historyLength);
      }
      return newHistory;
    });
  };

  useEffect(() => {
    // 주기적으로 포인트 업데이트 (예시: 여기서는 랜덤 값으로 업데이트)
    // 실제 앱에서는 API 호출 등을 통해 업데이트될 것입니다.
    const interval = setInterval(() => {
      // simulate point increase or decrease for demonstration
      const randomChange = (Math.random() - 0.5) * 100; // -50 ~ +50
      setCurrentPoints(prev => {
        const newPoints = Math.max(0, prev + randomChange); // 포인트가 0 이하로 내려가지 않도록
        // 이력 업데이트
        setPointHistory(prevHistory => {
          const newHistory = [...prevHistory, { timestamp: Date.now(), points: newPoints }];
          if (newHistory.length > historyLength) {
            return newHistory.slice(newHistory.length - historyLength);
          }
          return newHistory;
        });
        return newPoints;
      });
    }, updateIntervalMs);

    return () => clearInterval(interval);
  }, [updateIntervalMs, historyLength]); // 의존성 배열에 옵션 포함

  return {
    currentPoints,
    pointHistory,
    updatePoints,
  };
};

// 이 훅은 리더보드 데이터가 주기적으로 업데이트될 때,
// 개별 유저의 포인트 변화를 추적하는 데 사용될 수 있습니다.
// 예를 들어, useLeaderboardData 훅에서 데이터를 받아온 후,
// 각 유저별로 이 훅을 사용하여 포인트를 업데이트할 수 있습니다. 