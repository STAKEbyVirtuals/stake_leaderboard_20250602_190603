// data/tierData.js - 티어 시스템 관련 모든 데이터

export const TIER_SYSTEM = [
  { name: 'VIRGEN', condition: 'Not participating', benefit: 'Unlimited potential', multiplier: 'x0', color: '#6b7280', grade: 'None' },
  { name: 'Sizzlin\' Noob', condition: 'Entry level staking', benefit: 'Basic participation', multiplier: 'x1.0', color: '#ffffff', grade: 'Normal' },
  { name: 'Flipstarter', condition: 'Entry + 1 week', benefit: 'Consistency bonus', multiplier: 'x1.1', color: '#22c55e', grade: 'Uncommon' },
  { name: 'Flame Juggler', condition: 'Mid + 2 weeks', benefit: 'Growing power', multiplier: 'x1.25', color: '#3b82f6', grade: 'Rare' },
  { name: 'Grilluminati', condition: 'Mid + 1 month', benefit: 'Strategic advantage', multiplier: 'x1.4', color: '#8b5cf6', grade: 'Epic' },
  { name: 'Stake Wizard', condition: 'High + 2 months', benefit: 'Rule creation', multiplier: 'x1.6', color: '#eab308', grade: 'Unique' },
  { name: 'Heavy Eater', condition: 'Special + 3 months', benefit: 'Ultimate domination', multiplier: 'x1.8', color: '#ef4444', grade: 'Legendary' },
  { name: 'Genesis OG', condition: 'Launch day OR Phase survival', benefit: 'Mythical legend', multiplier: 'x2.0', color: '#10b981', grade: 'Genesis' }
];

export const STAKING_LEVELS = [
  { level: '🔹 Entry', range: 'Up to 200K STAKE', description: 'Perfect for beginners' },
  { level: '🔸 Mid', range: '200K - 1M STAKE', description: 'Serious participants' },
  { level: '🔶 High', range: '1M - 10M STAKE', description: 'Dedicated investors' },
  { level: '💎 Special', range: '10M+ STAKE', description: 'Elite whale tier' }
];

export const HYBRID_TIER_SYSTEM = {
  naturalUpgrade: [
    { from: "Sizzlin' Noob", to: "Flipstarter", condition: "Entry level + 1 week" },
    { from: "Flipstarter", to: "Flame Juggler", condition: "Mid level + 2 weeks" },
    { from: "Flame Juggler", to: "Grilluminati", condition: "Mid level + 1 month" },
    { from: "Grilluminati", to: "Stake Wizard", condition: "High level + 2 months" },
    { from: "Stake Wizard", to: "Heavy Eater", condition: "Special level + 3 months" },
    { from: "Heavy Eater", to: "Genesis OG", condition: "Launch day OR Phase survival" }
  ],
  phaseUpgrade: {
    requirements: [
      "Join within 24 hours of phase start",
      "Make at least 1 additional staking transaction during the phase",
      "Maintain stake without any unstaking (even partial) until phase end"
    ],
    result: "Automatic +1 tier upgrade",
    note: "Whichever upgrade path is faster applies first"
  }
};