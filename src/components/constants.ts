// API URL
export const SHEET_BEST_URL = '/leaderboard.json';

// 등급별 색상 시스템
export const tierColors: Record<string, string> = {
  "Genesis OG": "#4ade80",
  "Smoke Flexer": "#22d3ee", 
  "Steak Wizard": "#818cf8",
  "Grilluminati": "#f472b6",
  "Flame Juggler": "#fb923c",
  "Flipstarter": "#64748b",
  "Sizzlin' Noob": "#475569",
  "Jeeted": "#ef4444",
};

// 등급별 아바타
export const gradeAvatars: Record<string, string> = {
  "Genesis OG": "🌌",
  "Smoke Flexer": "💨",
  "Steak Wizard": "🧙",
  "Grilluminati": "👁️",
  "Flame Juggler": "🔥",
  "Flipstarter": "🥩",
  "Sizzlin' Noob": "🆕",
  "Jeeted": "💀"
};

// 순위별 배경 색상 (Treemap용)
export const rankColors: Record<number, string> = {
  1: "#4ade80", // 밝은 초록
  2: "#22d3ee", // 밝은 청록
  3: "#818cf8", // 밝은 보라
  4: "#f472b6", // 밝은 핑크
  5: "#fb923c", // 밝은 주황
};

// 상수 값들
export const CONSTANTS = {
  TOTAL_PHASE_REWARD: 41670000,
  VIRTUAL_RATE: 0.32,
  STAKE_PRICE: 0.52,
  REFRESH_INTERVAL: 30 * 60 * 1000, // 30분
  DESKTOP_BREAKPOINT: 1024,
  MOBILE_BREAKPOINT: 768,
  SIDEBAR_WIDTH_DESKTOP: 240,
  SIDEBAR_WIDTH_MOBILE: 280,
} as const;