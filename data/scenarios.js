// data/scenarios.js
// 시뮬레이션 시나리오 데이터

export const smallInvestorScenario = {
  initial: { amount: 200000, tokens: 'Entry Level (200K)' },
  phases: [
    { phase: 1, allocation: 100000, cumulative: 100000, tier: 'Sizzlin\' Noob', multiplier: 'x1.0' },
    { phase: 2, allocation: 110000, cumulative: 210000, tier: 'Flipstarter', multiplier: 'x1.1' },
    { phase: 3, allocation: 125000, cumulative: 335000, tier: 'Flame Juggler', multiplier: 'x1.25' },
    { phase: 4, allocation: 140000, cumulative: 475000, tier: 'Grilluminati', multiplier: 'x1.4' },
    { phase: 5, allocation: 160000, cumulative: 635000, tier: 'Stake Wizard', multiplier: 'x1.6' },
    { phase: 6, allocation: 200000, cumulative: 835000, tier: 'Heavy Eater', multiplier: 'x1.8' }
  ],
  final: { totalStaking: 1035000, finalTier: 'Genesis OG', finalMultiplier: 'x2.0' }
};