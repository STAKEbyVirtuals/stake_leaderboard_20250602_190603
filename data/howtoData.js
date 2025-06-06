// data/howtoData.js - How To 페이지 모든 상수 데이터

// 🆕 완전한 프로젝트 일정 데이터
export const COMPLETE_TIMELINE = {
  phases: [
    { 
      phase: 1, 
      staking: '2025-05-27 ~ 2025-06-27', 
      snapshot: '2025-06-27 10:00 UTC',
      status: 'current'
    },
    { 
      phase: 2, 
      staking: '2025-06-27 ~ 2025-07-27', 
      snapshot: '2025-07-27 10:00 UTC',
      status: 'upcoming' 
    },
    { 
      phase: 3, 
      staking: '2025-07-27 ~ 2025-08-27', 
      snapshot: '2025-08-27 10:00 UTC',
      status: 'upcoming' 
    },
    { 
      phase: 4, 
      staking: '2025-08-27 ~ 2025-09-27', 
      snapshot: '2025-09-27 10:00 UTC',
      status: 'upcoming' 
    },
    { 
      phase: 5, 
      staking: '2025-09-27 ~ 2025-10-27', 
      snapshot: '2025-10-27 10:00 UTC',
      status: 'upcoming' 
    },
    { 
      phase: 6, 
      staking: '2025-10-27 ~ 2025-11-27', 
      snapshot: '2025-11-27 10:00 UTC',
      status: 'upcoming' 
    }
  ],
  vesting: [
    { phase: 1, unlock: '2025-12-07', distribution: '2025-12-10', newTokens: '41.67M', cumulative: '41.67M', percentage: '16.67%' },
    { phase: 2, unlock: '2026-01-07', distribution: '2026-01-10', newTokens: '41.67M', cumulative: '83.33M', percentage: '33.33%' },
    { phase: 3, unlock: '2026-02-07', distribution: '2026-02-10', newTokens: '41.67M', cumulative: '125.00M', percentage: '50.00%' },
    { phase: 4, unlock: '2026-03-07', distribution: '2026-03-10', newTokens: '41.67M', cumulative: '166.67M', percentage: '66.67%' },
    { phase: 5, unlock: '2026-04-07', distribution: '2026-04-10', newTokens: '41.67M', cumulative: '208.33M', percentage: '83.33%' },
    { phase: 6, unlock: '2026-05-07', distribution: '2026-05-10', newTokens: '41.67M', cumulative: '250.00M', percentage: '100%' }
  ]
};

// 🆕 페이즈 참가 시스템 데이터
export const PHASE_PARTICIPATION_RULES = [
  {
    rule: "Join Button Required",
    description: "You must click the 'Join Phase' button at the start of each phase.",
    icon: "🔘",
    importance: "critical"
  },
  {
    rule: "No Auto Participation",
    description: "Previous phase participation does NOT automatically join you to the next phase.",
    icon: "❌",
    importance: "critical"
  },
  {
    rule: "No Join = No Points",
    description: "If you don't click join, your staking won't accumulate any points.",
    icon: "⚠️",
    importance: "critical"
  },
  {
    rule: "Late Join Penalty",
    description: "Joining mid-phase means you lose all points from the beginning of that phase.",
    icon: "⏰",
    importance: "warning"
  }
];

// 🆕 클레임 전략 비교 데이터
export const CLAIM_STRATEGIES = [
  {
    strategy: "Immediate Claim",
    timing: "At each phase end",
    type: "warning",
    points: ["Grade reset to Virgen", "Cannot join next phase", "Miss long-term rewards", "Lose tier progression"],
    result: "Becomes Jeeted",
    color: "red"
  },
  {
    strategy: "Continue Staking",
    timing: "Hold until next phase",
    type: "benefits",
    points: ["Automatic tier upgrade", "Higher multiplier rewards", "Cumulative bonus growth", "Path to elite status"],
    result: "Achieve Higher Tiers",
    color: "green"
  },
  {
    strategy: "Genesis OG Journey",
    timing: "Complete all phases",
    type: "benefits",
    points: ["Maximum x2.0 multiplier", "Legendary status forever", "Ultimate reward potential", "Part of STAKE history"],
    result: "Genesis OG Achievement",
    color: "emerald"
  }
];

// 🆕 NFT 발행 프로세스 데이터
export const NFT_MINTING_PROCESS = [
  { step: 1, title: "All Phases Complete", desc: "6 phases finished (Nov 2025)" },
  { step: 2, title: "Final Grade Confirmed", desc: "Your highest achieved tier locked" },
  { step: 3, title: "NFT Generation", desc: "Unique artwork based on your grade" },
  { step: 4, title: "Permanent Ownership", desc: "Tradeable, collectible NFT card" }
];

// 🆕 NFT 미래 유틸리티 데이터
export const NFT_FUTURE_UTILITIES = [
  { icon: "🎮", title: "Gaming Integration", desc: "Special abilities in STAKE games" },
  { icon: "🎫", title: "Event Access", desc: "VIP access to exclusive events" },
  { icon: "💎", title: "Premium Features", desc: "Enhanced platform privileges" },
  { icon: "🤝", title: "Community Status", desc: "Verified tier in all platforms" },
  { icon: "💰", title: "Reward Boosts", desc: "Enhanced earning potential" },
  { icon: "🔮", title: "Future Content", desc: "Priority access to new products" }
];

// 🆕 페이즈 참가 플로우 데이터
export const PHASE_PARTICIPATION_FLOW = [
  { step: 1, title: "Phase Start", desc: "New phase begins", icon: "🚀" },
  { step: 2, title: "Join Modal", desc: "Participation modal appears", icon: "📋" },
  { step: 3, title: "Click Join", desc: "Click 'Join Phase' button", icon: "🔘" },
  { step: 4, title: "Start Earning", desc: "Points accumulation begins", icon: "📈" }
];

// 기존 데이터들도 필요하면 여기에 추가
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