/**
 * @fileoverview 특정 목표 시간까지 남은 시간을 계산하고 업데이트하는 커스텀 훅.
 */

import { useState, useEffect } from 'react';

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isFinished: boolean;
}

/**
 * 특정 목표 시간(Unix 타임스탬프, 초 단위)까지 남은 시간을 계산하고 반환합니다.
 * @param targetTimestampSec 목표 시간의 Unix 타임스탬프 (초 단위).
 * @returns Countdown 인터페이스를 따르는 객체.
 */
export const useCountdown = (targetTimestampSec: number): Countdown => {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    const now = Math.floor(Date.now() / 1000); // 현재 시간 (초 단위)
    return Math.max(0, targetTimestampSec - now);
  });

  useEffect(() => {
    if (remainingSeconds <= 0) {
      return;
    }

    const intervalId = setInterval(() => {
      setRemainingSeconds(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [remainingSeconds, targetTimestampSec]);

  const days = Math.floor(remainingSeconds / (60 * 60 * 24));
  const hours = Math.floor((remainingSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);
  const seconds = Math.floor(remainingSeconds % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds: remainingSeconds,
    isFinished: remainingSeconds <= 0,
  };
}; 