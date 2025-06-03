import { LeaderboardItem, BoxSize } from './types';
import { gradeAvatars, rankColors } from './constants';

// 랭킹 배지
export function getRankBadge(rank: number): string {
  if (rank === 1) return "👑";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  if (rank <= 10) return "🔥";
  return "⭐";
}

// 트렌드 아이콘
export function getTrendIcon(change: string): string {
  const changeNum = parseFloat(change);
  if (changeNum > 5) return "🚀";
  if (changeNum > 2) return "📈";
  if (changeNum > 0) return "⬆️";
  if (changeNum === 0) return "➡️";
  if (changeNum > -2) return "⬇️";
  if (changeNum > -5) return "📉";
  return "💀";
}

// 등급별 아바타
export function getGradeAvatar(grade: string): string {
  return gradeAvatars[grade] || "❓";
}

// 박스 크기 계산
export function getBoxSize(width: number, height: number): BoxSize {
  const area = width * height;
  if (area < 3000) return "tiny";
  if (area < 8000) return "small"; 
  if (area < 15000) return "medium";
  if (area < 25000) return "large";
  return "xlarge";
}

// 순위별 배경색 가져오기
export function getBackgroundColor(rank: number): string {
  if (rank <= 5) return rankColors[rank];
  if (rank <= 10) return "#64748b"; // 중간 회색
  return "#475569"; // 진한 회색
}

// 미니 차트 생성
export function generateMiniChart(item: LeaderboardItem): string {
  const points: number[] = [];
  const baseValue = item.value;
  
  // 30일 간의 모의 데이터 생성
  for (let i = 0; i < 30; i++) {
    const volatility = 0.1;
    const trend = parseFloat(item.change) / 100;
    const dailyChange = (Math.random() - 0.5) * volatility + trend / 30;
    const prevValue = i === 0 ? baseValue * 0.9 : points[i - 1];
    points.push(Math.max(0.1, prevValue * (1 + dailyChange)));
  }

  const width = 60;
  const height = 20;
  const minValue = Math.min(...points);
  const maxValue = Math.max(...points);
  const range = maxValue - minValue || 1;

  const pathData = points
    .map((value, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((value - minValue) / range) * height;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const isPositive = parseFloat(item.change) >= 0;
  const strokeColor = isPositive ? '#4ade80' : '#f87171';

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="gradient-${item.rank}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${strokeColor};stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:${strokeColor};stop-opacity:0" />
        </linearGradient>
      </defs>
      <path d="${pathData} L ${width} ${height} L 0 ${height} Z" 
            fill="url(#gradient-${item.rank})" />
      <path d="${pathData}" 
            stroke="${strokeColor}" 
            stroke-width="1.5" 
            fill="none" 
            opacity="0.8" />
    </svg>
  `;
}

// 단순화된 차트 생성 (Treemap용)
export function generateSimpleChart(item: LeaderboardItem, chartHeight: number): string {
  const points = [];
  const steps = 20;
  
  for (let i = 0; i < steps; i++) {
    const noise = Math.random() * 0.3 - 0.15;
    const trend = parseFloat(item.change) / 100 / steps * i;
    points.push(0.5 + trend + noise);
  }
  
  const pathData = points
    .map((val, i) => {
      const x = (i / (steps - 1)) * 100;
      const y = (1 - val) * chartHeight;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const isPositive = parseFloat(item.change) >= 0;
  const color = isPositive ? "#4ade80" : "#ef4444";
  
  return `
    <svg width="100%" height="${chartHeight}" viewBox="0 0 100 ${chartHeight}" preserveAspectRatio="none">
      <path d="${pathData}" stroke="${color}" stroke-width="2" fill="none" opacity="0.8" />
    </svg>
  `;
}

// 화폐 형식 포맷팅
export function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
}

// 큰 숫자 형식 포맷팅 (K, M 단위)
export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
}