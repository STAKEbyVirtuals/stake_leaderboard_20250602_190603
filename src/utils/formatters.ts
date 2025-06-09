/**
 * @fileoverview 데이터 포맷팅 관련 유틸리티 함수들.
 */

/**
 * 숫자를 천 단위로 콤마를 포함하여 포맷합니다.
 * @param value 포맷할 숫자 또는 문자열 숫자.
 * @returns 포맷된 문자열.
 */
export const formatNumberWithCommas = (value: number | string): string => {
  if (typeof value === 'string') {
    value = parseFloat(value);
  }
  if (isNaN(value)) {
    return 'N/A';
  }
  return value.toLocaleString('en-US'); // 한국어 로케일 'ko-KR'도 가능
};

/**
 * 큰 숫자를 K, M, B 등으로 축약하여 포맷합니다. (예: 12345 -> 12.3K)
 * @param num 포맷할 숫자.
 * @param fixed 소수점 이하 자릿수 (기본값: 1).
 * @returns 축약된 포맷의 문자열.
 */
export const formatLargeNumber = (num: number, fixed: number = 1): string => {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(fixed) + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(fixed) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(fixed) + 'K';
  }
  return num.toString();
};

/**
 * Unix 타임스탬프 (초)를 'YYYY-MM-DD HH:MM:SS' 형식의 문자열로 포맷합니다.
 * @param timestampSec Unix 타임스탬프 (초).
 * @returns 포맷된 날짜/시간 문자열.
 */
export const formatUnixTimestamp = (timestampSec: number): string => {
  const date = new Date(timestampSec * 1000); // 초를 밀리초로 변환
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // 24시간 형식
  });
};

/**
 * 퍼센트 값을 포맷합니다.
 * @param value 퍼센트 값 (예: 0.75).
 * @returns 포맷된 퍼센트 문자열 (예: "75.00%").
 */
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

export function formatNumberChange(baseNum: number, changePercent: number): { value: string; isPositive: boolean } {
  const changeAmount = (baseNum * changePercent) / 100;
  const isPositive = changeAmount >= 0;
  const formattedChange = formatLargeNumber(Math.abs(changeAmount));
  return {
    value: (isPositive ? '+' : '-') + formattedChange,
    isPositive
  };
} 