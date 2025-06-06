// src/data/stake/evolutionSteps.js
// 8단계 STAKE 진화 시스템 데이터

export const evolutionSteps = [
  {
    id: 'virgen',
    title: 'VIRGEN',
    characterName: 'The Unknowing Masses',
    keywords: 'Not Participating, Potential',
    story: "You know nothing. But the potential is infinite.",
    description: 'The general public who have not entered the staking world. But every legend starts here.',
    infoBlock: {
      title: 'Starting Point: Everyone Begins Here',
      content: `**The Journey Starts Now**

1. No participation yet, but infinite potential awaits
2. Learn about STAKE tokens and the leaderboard system  
3. Prepare for your transformation journey
4. Every Genesis OG and Heavy Eater started here

Ready to begin your evolution?`,
      bgColor: 'from-gray-900/30 to-slate-900/30',
      borderColor: 'border-gray-500/40'
    },
    action: 'So when you gonna start?',
    tips: [
      'Learn what STAKE tokens are',
      'Understand the 7-tier system',
      'Acquire basic Web3 knowledge',
      'Prepare your wallet for the journey'
    ],
    bgGradient: 'from-gray-800/40 via-slate-700/30 to-gray-900/40',
    borderColor: 'border-gray-500/50',
    accentColor: 'gray',
    symbolColor: '#6b7280',
    tierGrade: 'None',
    multiplier: 'x0',
    requirement: 'Not participating'
  },
  {
    id: 'sizzlin-noob',
    title: 'SIZZLIN\' NOOB',
    characterName: 'The Fresh Entrant',
    keywords: 'First Stake, Entry Level',
    story: "It's not too late to start now. The first step is the most important.",
    description: 'New entrant who finally participated in staking. Everything is new but has the will to learn.',
    infoBlock: {
      title: 'Welcome to the Game!',
      content: `**Your Staking Journey Begins**

1. **Entry Level**: Up to 200K STAKE tokens
2. **x1.0 Multiplier**: Base level scoring  
3. **Growth Path**: 6 phases to reach Heavy Eater
4. **Next Goal**: Hold 1 week → Flipstarter

Small start, big dreams possible!`,
      bgColor: 'from-gray-100/10 to-white/10',
      borderColor: 'border-white/40'
    },
    action: 'At least doing something? Got it!',
    tips: [
      'Connect wallet and buy STAKE tokens',
      'Start with Entry level (up to 200K)',
      'Get x1.0 multiplier after first stake',
      'Plan for 1 week holding for next tier'
    ],
    bgGradient: 'from-gray-100/10 via-white/5 to-gray-200/10',
    borderColor: 'border-white/30',
    accentColor: 'white',
    symbolColor: '#ffffff',
    tierGrade: 'Normal',
    multiplier: 'x1.0',
    requirement: 'Entry level staking'
  },
  {
    id: 'flipstarter',
    title: 'FLIPSTARTER',
    characterName: 'The Persistence Learner',
    keywords: '1 Week Survivor, Uncommon',
    story: "One week survived. I'm learning the game rules.",
    description: 'First milestone achiever who held staking for 1 week. Starting to understand the long-term game.',
    infoBlock: {
      title: 'First Milestone Achieved!',
      content: `**1 Week Survivor Rewards**

1. **Condition**: Entry level + 1 week holding
2. **x1.1 Multiplier**: +10% bonus scoring
3. **Lesson**: Consistency over quick gains
4. **Next Goal**: 2 weeks + Mid level → Flame Juggler

Patience is starting to pay off!`,
      bgColor: 'from-green-900/30 to-emerald-900/30',
      borderColor: 'border-green-500/40'
    },
    action: '1 week? Not bad kid, got it!',
    tips: [
      'Achieved x1.1 multiplier (+10% bonus)',
      'Learned the value of patience',
      'Next: aim for Mid level (200K+ tokens)',
      'Target 2 weeks for Flame Juggler'
    ],
    bgGradient: 'from-green-800/40 via-emerald-800/30 to-green-900/40',
    borderColor: 'border-green-500/50',
    accentColor: 'green',
    symbolColor: '#22c55e',
    tierGrade: 'Uncommon',
    multiplier: 'x1.1',
    requirement: 'Entry + 1 week'
  },
  {
    id: 'flame-juggler',
    title: 'FLAME JUGGLER',
    characterName: 'The Growing Warrior',
    keywords: '2 Weeks Survivor, Rare',
    story: "Now I'm properly engaged. I've learned to handle the flames.",
    description: 'Mid-level staker who survived 2 weeks. Became a true player through consistent dedication.',
    infoBlock: {
      title: 'The Growing Power Phase',
      content: `**2 Weeks Survival Milestone**

1. **Condition**: Mid level (200K-1M) + 2 weeks holding
2. **x1.25 Multiplier**: +25% scoring power boost
3. **Market Resilience**: Survived volatility cycles
4. **Next Goal**: 1 month holding → Grilluminati

You're no longer just testing the waters!`,
      bgColor: 'from-blue-900/30 to-indigo-900/30',
      borderColor: 'border-blue-500/40'
    },
    action: 'Fire juggling pro now, got it!',
    tips: [
      'Achieved x1.25 multiplier (+25% power)',
      'Mid level staking (200K-1M tokens)',
      'Survived 2 weeks of market volatility',
      'Next milestone: 1 month holding'
    ],
    bgGradient: 'from-blue-800/40 via-indigo-800/30 to-blue-900/40',
    borderColor: 'border-blue-500/50',
    accentColor: 'blue',
    symbolColor: '#3b82f6',
    tierGrade: 'Rare',
    multiplier: 'x1.25',
    requirement: 'Mid + 2 weeks'
  },
  {
    id: 'grilluminati',
    title: 'GRILLUMINATI',
    characterName: 'The Strategic Mind',
    keywords: '1 Month Survivor, Epic',
    story: "Points are taken by those who calculate. I understand the rules of the game.",
    description: 'Strategic thinker who survived 1 month. Moves with logic, not emotion.',
    infoBlock: {
      title: 'Strategic Mastery Achieved',
      content: `**1 Month Strategic Milestone**

1. **Condition**: Mid level + 1 month strategic holding
2. **x1.4 Multiplier**: +40% strategic advantage
3. **Meta Understanding**: Beyond emotion-driven decisions
4. **Next Goal**: High level (1M+) + 2 months → Stake Wizard

Logic over impulse = consistent gains!`,
      bgColor: 'from-purple-900/30 to-violet-900/30',
      borderColor: 'border-purple-500/40'
    },
    action: 'Now I know the meta, got it!',
    tips: [
      'Achieved x1.4 multiplier (+40% advantage)',
      'Survived 1 month - strategic milestone',
      'Next: aim for High level (1M+ tokens)',
      'Target 2 months for Stake Wizard tier'
    ],
    bgGradient: 'from-purple-800/40 via-violet-800/30 to-purple-900/40',
    borderColor: 'border-purple-500/50',
    accentColor: 'purple',
    symbolColor: '#8b5cf6',
    tierGrade: 'Epic',
    multiplier: 'x1.4',
    requirement: 'Mid + 1 month'
  },
  {
    id: 'stake-wizard',
    title: 'STAKE WIZARD',
    characterName: 'The Rule Creator',
    keywords: '2 Months Survivor, Unique',
    story: "Those who design rules transcend them. Now I'm in the position of making the game.",
    description: 'High-level master who survived 2 months. Transcendent who creates strategies beyond interpreting meta.',
    infoBlock: {
      title: 'Rule Creation Mastery',
      content: `**2 Months High-Level Mastery**

1. **Condition**: High level (1M-10M) + 2 months mastery
2. **x1.6 Multiplier**: +60% rule-creation power
3. **Beyond Meta**: Creating strategies, not following them
4. **Next Goal**: Special level (10M+) + 3 months → Heavy Eater

You don't follow rules, you make them!`,
      bgColor: 'from-yellow-900/30 to-amber-900/30',
      borderColor: 'border-yellow-500/40'
    },
    action: 'Now I am the rulebook, got it!',
    tips: [
      'Achieved x1.6 multiplier (+60% mastery)',
      'High level staking (1M-10M tokens)',
      'Survived 2 months - elite status',
      'Next: aim for Special level (10M+ tokens)'
    ],
    bgGradient: 'from-yellow-800/40 via-amber-800/30 to-yellow-900/40',
    borderColor: 'border-yellow-500/50',
    accentColor: 'yellow',
    symbolColor: '#eab308',
    tierGrade: 'Unique',
    multiplier: 'x1.6',
    requirement: 'High + 2 months'
  },
  {
    id: 'heavy-eater',
    title: 'HEAVY EATER',
    characterName: 'The Ultimate Victor',
    keywords: '3 Months Survivor, Legendary',
    story: "Those who endure eat everything. Now I am the ruler of the grill.",
    description: 'Ultimate champion with Special level staking for 3+ months. The apex of the traditional tier system.',
    infoBlock: {
      title: 'Ultimate Championship Status',
      content: `**3+ Months Special Level Mastery**

1. **Condition**: Special level (10M+) + 3+ months endurance
2. **x1.8 Multiplier**: +80% ultimate domination power
3. **Grill Ruler**: Apex of traditional tier system
4. **Final Evolution**: Phase survival → Genesis OG potential

You've conquered the traditional progression!`,
      bgColor: 'from-red-900/30 to-rose-900/30',
      borderColor: 'border-red-500/40'
    },
    action: 'Now I rule the grill, got it!',
    tips: [
      'Achieved x1.8 multiplier (+80% power)',
      'Special level staking (10M+ tokens)',
      'Survived 3+ months - legendary status',
      'Phase transition can lead to Genesis OG!'
    ],
    bgGradient: 'from-red-800/40 via-rose-800/30 to-red-900/40',
    borderColor: 'border-red-500/50',
    accentColor: 'red',
    symbolColor: '#ef4444',
    tierGrade: 'Legendary',
    multiplier: 'x1.8',
    requirement: 'Special + 3 months'
  },
  {
    id: 'genesis-og',
    title: 'GENESIS OG',
    characterName: 'The Mythical Legend',
    keywords: 'Time Transcendent, Genesis',
    story: "Early or Never. A being that transcends time, itself a myth.",
    description: 'Mythical being who either participated from launch day OR achieved Heavy Eater and survived phase transitions.',
    infoBlock: {
      title: 'Mythical Legend Status',
      content: `**Time Transcendent Achievement**

1. **Dual Path**: Launch day participation OR Heavy Eater + Phase survival
2. **x2.0 Multiplier**: Maximum possible scoring power
3. **Living History**: Permanent witness of STAKE evolution
4. **Eternal Status**: This is the final evolution tier

You have transcended time itself!`,
      bgColor: 'from-emerald-900/30 to-teal-900/30',
      borderColor: 'border-emerald-500/40'
    },
    action: 'Now I am legend, got it!',
    tips: [
      'Maximum x2.0 multiplier power',
      'Two paths: Early entry OR phase survival',
      'Permanent legendary status',
      'Living witness of STAKE history'
    ],
    bgGradient: 'from-emerald-800/40 via-teal-800/30 to-emerald-900/40',
    borderColor: 'border-emerald-500/50',
    accentColor: 'emerald',
    symbolColor: '#10b981',
    tierGrade: 'Genesis',
    multiplier: 'x2.0',
    requirement: 'Launch day OR Heavy Eater + Phase survival'
  }
];

// 색상 매핑 유틸리티
export const getAccentColorClasses = (color) => {
  const colorMap = {
    gray: { text: 'text-gray-400', bg: 'bg-gray-500', ring: 'ring-gray-500' },
    white: { text: 'text-white', bg: 'bg-white', ring: 'ring-white' },
    green: { text: 'text-green-400', bg: 'bg-green-500', ring: 'ring-green-500' },
    blue: { text: 'text-blue-400', bg: 'bg-blue-500', ring: 'ring-blue-500' },
    purple: { text: 'text-purple-400', bg: 'bg-purple-500', ring: 'ring-purple-500' },
    yellow: { text: 'text-yellow-400', bg: 'bg-yellow-500', ring: 'ring-yellow-500' },
    red: { text: 'text-red-400', bg: 'bg-red-500', ring: 'ring-red-500' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500', ring: 'ring-emerald-500' }
  };
  return colorMap[color] || colorMap.gray;
};

// 티어 시스템 요약 (간단한 조회용)
export const tierSystem = [
  { name: 'VIRGEN', condition: 'Not participating', benefit: 'Unlimited potential', multiplier: 'x0', color: '#6b7280', grade: 'None' },
  { name: 'Sizzlin\' Noob', condition: 'Entry level staking', benefit: 'Basic participation', multiplier: 'x1.0', color: '#ffffff', grade: 'Normal' },
  { name: 'Flipstarter', condition: 'Entry + 1 week', benefit: 'Consistency bonus', multiplier: 'x1.1', color: '#22c55e', grade: 'Uncommon' },
  { name: 'Flame Juggler', condition: 'Mid + 2 weeks', benefit: 'Growing power', multiplier: 'x1.25', color: '#3b82f6', grade: 'Rare' },
  { name: 'Grilluminati', condition: 'Mid + 1 month', benefit: 'Strategic advantage', multiplier: 'x1.4', color: '#8b5cf6', grade: 'Epic' },
  { name: 'Stake Wizard', condition: 'High + 2 months', benefit: 'Rule creation', multiplier: 'x1.6', color: '#eab308', grade: 'Unique' },
  { name: 'Heavy Eater', condition: 'Special + 3 months', benefit: 'Ultimate domination', multiplier: 'x1.8', color: '#ef4444', grade: 'Legendary' },
  { name: 'Genesis OG', condition: 'Launch day OR Phase survival', benefit: 'Mythical legend', multiplier: 'x2.0', color: '#10b981', grade: 'Genesis' }
];