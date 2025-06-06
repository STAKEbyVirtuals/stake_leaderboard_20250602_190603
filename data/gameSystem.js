// data/gameSystem.js
// 게임 시스템 관련 데이터 (티어, 레벨, 페이즈, 색상 등)

export const tierSystem = [
  { tier: '🐸', name: 'VIRGEN', condition: 'Not participating', benefit: 'Unlimited potential', multiplier: 'x0', color: '#6b7280', grade: 'None' },
  { tier: '🆕', name: 'Sizzlin\' Noob', condition: 'Entry level staking', benefit: 'Basic participation', multiplier: 'x1.0', color: '#ffffff', grade: 'Normal' },
  { tier: '🔁', name: 'Flipstarter', condition: 'Entry + 1 week', benefit: 'Consistency bonus', multiplier: 'x1.1', color: '#22c55e', grade: 'Uncommon' },
  { tier: '🔥', name: 'Flame Juggler', condition: 'Mid + 2 weeks', benefit: 'Growing power', multiplier: 'x1.25', color: '#3b82f6', grade: 'Rare' },
  { tier: '🧠', name: 'Grilluminati', condition: 'Mid + 1 month', benefit: 'Strategic advantage', multiplier: 'x1.4', color: '#8b5cf6', grade: 'Epic' },
  { tier: '🧙‍♂️', name: 'Stake Wizard', condition: 'High + 2 months', benefit: 'Rule creation', multiplier: 'x1.6', color: '#eab308', grade: 'Unique' },
  { tier: '🥩', name: 'Heavy Eater', condition: 'Special + 3 months', benefit: 'Ultimate domination', multiplier: 'x1.8', color: '#ef4444', grade: 'Legendary' },
  { tier: '🌌', name: 'Genesis OG', condition: 'Launch day OR Phase survival', benefit: 'Mythical legend', multiplier: 'x2.0', color: '#10b981', grade: 'Genesis' }
];

export const stakingLevels = [
  { level: '🔹 Entry', range: 'Up to 200K STAKE', description: 'Perfect for beginners' },
  { level: '🔸 Mid', range: '200K - 1M STAKE', description: 'Serious participants' },
  { level: '🔶 High', range: '1M - 10M STAKE', description: 'Dedicated investors' },
  { level: '💎 Special', range: '10M+ STAKE', description: 'Elite whale tier' }
];

export const phaseProgression = [
  { phase: 'Phase 1', tier: 'Sizzlin\' Noob', multiplier: 'x1.0' },
  { phase: 'Phase 2', tier: 'Flipstarter', multiplier: 'x1.1' },
  { phase: 'Phase 3', tier: 'Flame Juggler', multiplier: 'x1.25' },
  { phase: 'Phase 4', tier: 'Grilluminati', multiplier: 'x1.4' },
  { phase: 'Phase 5', tier: 'Stake Wizard', multiplier: 'x1.6' },
  { phase: 'Phase 6', tier: 'Heavy Eater', multiplier: 'x1.8' },
  { phase: 'Claim', tier: 'Genesis OG', multiplier: 'x2.0' }
];

export const colorMap = {
  gray: { text: 'text-gray-400', bg: 'bg-gray-500', ring: 'ring-gray-500', hover: 'hover:bg-gray-600' },
  white: { text: 'text-white', bg: 'bg-white', ring: 'ring-white', hover: 'hover:bg-gray-100' },
  green: { text: 'text-green-400', bg: 'bg-green-500', ring: 'ring-green-500', hover: 'hover:bg-green-600' },
  blue: { text: 'text-blue-400', bg: 'bg-blue-500', ring: 'ring-blue-500', hover: 'hover:bg-blue-600' },
  purple: { text: 'text-purple-400', bg: 'bg-purple-500', ring: 'ring-purple-500', hover: 'hover:bg-purple-600' },
  yellow: { text: 'text-yellow-400', bg: 'bg-yellow-500', ring: 'ring-yellow-500', hover: 'hover:bg-yellow-600' },
  red: { text: 'text-red-400', bg: 'bg-red-500', ring: 'ring-red-500', hover: 'hover:bg-red-600' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500', ring: 'ring-emerald-500', hover: 'hover:bg-emerald-600' }
};