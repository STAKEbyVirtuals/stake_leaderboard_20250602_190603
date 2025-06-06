// data/evolutionData.js - 진화 여정 관련 모든 데이터

export const EVOLUTION_STEPS = [
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
      title: 'Mid-Level Mastery',
      content: `**Flame Handling Skills Unlocked**

1. **Condition**: Mid level (200K-1M) + 2 weeks
2. **x1.25 Multiplier**: +25% scoring power
3. **Achievement**: True player status
4. **Next Goal**: 1 month → Grilluminati

The flames no longer burn you!`,
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
      title: 'Strategic Mastery Unlocked',
      content: `**The Game Meta Revealed**

1. **Condition**: Mid level + 1 month holding
2. **x1.4 Multiplier**: +40% scoring advantage  
3. **Skill**: Strategic thinking over emotions
4. **Next Goal**: High level + 2 months → Stake Wizard

You now see the bigger picture!`,
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
      title: 'Wizard Powers Awakened',
      content: `**Rule Creator Status Achieved**

1. **Condition**: High level (1M-10M) + 2 months
2. **x1.6 Multiplier**: +60% scoring mastery
3. **Power**: Creating new strategies
4. **Next Goal**: Special level + 3 months → Heavy Eater

You now shape the game itself!`,
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
      title: 'Ultimate Dominance Achieved',
      content: `**Legendary Status Unlocked**

1. **Condition**: Special level (10M+) + 3 months
2. **x1.8 Multiplier**: +80% legendary power
3. **Status**: Traditional system apex
4. **Special**: Phase transition → Genesis OG possible!

You rule the traditional tier system!`,
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
      title: 'Mythical Genesis Powers',
      content: `**Two Paths to Legend**

1. **Original Path**: Launch day participant + no jeet
2. **New Path**: Heavy Eater → Phase transition
3. **x2.0 Multiplier**: Maximum scoring power
4. **Status**: Mythical ecosystem legend

Time mastery = Ultimate rewards!`,
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