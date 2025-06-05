import React, { useState, useEffect } from 'react';

const StakeHowToPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [showPhaseStrategy, setShowPhaseStrategy] = useState(false);
  const [showSmallInvestorPath, setShowSmallInvestorPath] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const evolutionSteps = [
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

  const tierSystem = [
    { tier: '🐸', name: 'VIRGEN', condition: 'Not participating', benefit: 'Unlimited potential', multiplier: 'x0', color: '#6b7280', grade: 'None' },
    { tier: '🆕', name: 'Sizzlin\' Noob', condition: 'Entry level staking', benefit: 'Basic participation', multiplier: 'x1.0', color: '#ffffff', grade: 'Normal' },
    { tier: '🔁', name: 'Flipstarter', condition: 'Entry + 1 week', benefit: 'Consistency bonus', multiplier: 'x1.1', color: '#22c55e', grade: 'Uncommon' },
    { tier: '🔥', name: 'Flame Juggler', condition: 'Mid + 2 weeks', benefit: 'Growing power', multiplier: 'x1.25', color: '#3b82f6', grade: 'Rare' },
    { tier: '🧠', name: 'Grilluminati', condition: 'Mid + 1 month', benefit: 'Strategic advantage', multiplier: 'x1.4', color: '#8b5cf6', grade: 'Epic' },
    { tier: '🧙‍♂️', name: 'Stake Wizard', condition: 'High + 2 months', benefit: 'Rule creation', multiplier: 'x1.6', color: '#eab308', grade: 'Unique' },
    { tier: '🥩', name: 'Heavy Eater', condition: 'Special + 3 months', benefit: 'Ultimate domination', multiplier: 'x1.8', color: '#ef4444', grade: 'Legendary' },
    { tier: '🌌', name: 'Genesis OG', condition: 'Launch day OR Phase survival', benefit: 'Mythical legend', multiplier: 'x2.0', color: '#10b981', grade: 'Genesis' }
  ];

  const stakingLevels = [
    { level: '🔹 Entry', range: 'Up to 200K STAKE', description: 'Perfect for beginners' },
    { level: '🔸 Mid', range: '200K - 1M STAKE', description: 'Serious participants' },
    { level: '🔶 High', range: '1M - 10M STAKE', description: 'Dedicated investors' },
    { level: '💎 Special', range: '10M+ STAKE', description: 'Elite whale tier' }
  ];

  const phaseProgression = [
    { phase: 'Phase 1', tier: 'Sizzlin\' Noob', multiplier: 'x1.0' },
    { phase: 'Phase 2', tier: 'Flipstarter', multiplier: 'x1.1' },
    { phase: 'Phase 3', tier: 'Flame Juggler', multiplier: 'x1.25' },
    { phase: 'Phase 4', tier: 'Grilluminati', multiplier: 'x1.4' },
    { phase: 'Phase 5', tier: 'Stake Wizard', multiplier: 'x1.6' },
    { phase: 'Phase 6', tier: 'Heavy Eater', multiplier: 'x1.8' },
    { phase: 'Claim', tier: 'Genesis OG', multiplier: 'x2.0' }
  ];

  const smallInvestorScenario = {
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

  const handleStepComplete = (stepIndex) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
    if (stepIndex < evolutionSteps.length - 1) {
      setTimeout(() => setCurrentStep(stepIndex + 1), 1000);
    }
  };

  const progressPercentage = ((currentStep + 1) / evolutionSteps.length) * 100;

  const getAccentColorClasses = (color) => {
    const colorMap = {
      gray: { text: 'text-gray-400', bg: 'bg-gray-500', ring: 'ring-gray-500', hover: 'hover:bg-gray-600' },
      white: { text: 'text-white', bg: 'bg-white', ring: 'ring-white', hover: 'hover:bg-gray-100' },
      green: { text: 'text-green-400', bg: 'bg-green-500', ring: 'ring-green-500', hover: 'hover:bg-green-600' },
      blue: { text: 'text-blue-400', bg: 'bg-blue-500', ring: 'ring-blue-500', hover: 'hover:bg-blue-600' },
      purple: { text: 'text-purple-400', bg: 'bg-purple-500', ring: 'ring-purple-500', hover: 'hover:bg-purple-600' },
      yellow: { text: 'text-yellow-400', bg: 'bg-yellow-500', ring: 'ring-yellow-500', hover: 'hover:bg-yellow-600' },
      red: { text: 'text-red-400', bg: 'bg-red-500', ring: 'ring-red-500', hover: 'hover:bg-red-600' },
      emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500', ring: 'ring-emerald-500', hover: 'hover:bg-emerald-600' }
    };
    return colorMap[color] || colorMap.gray;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative px-4 py-16 text-center">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-6xl md:text-8xl font-black mb-8 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
            🔥 VIRGEN → LEGEND
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-6 max-w-4xl mx-auto leading-relaxed">
            From <span className="text-red-400 font-bold">200K Entry</span> to <span className="text-emerald-400 font-bold">Genesis OG</span> - Everyone can reach the top!
          </p>
          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
            <strong>Revolutionary System:</strong> Small investors can reach <strong>Heavy Eater status</strong> through 6-phase journey
          </p>
          
          {/* Enhanced Progress Bar */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="flex justify-between text-lg text-gray-400 mb-4">
              <span className="font-bold">🐸 VIRGEN</span>
              <span className="font-bold text-orange-400">{Math.round(progressPercentage)}% Evolution</span>
              <span className="font-bold">🌌 LEGEND</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-5 shadow-inner">
              <div 
                className="bg-gradient-to-r from-gray-500 via-orange-500 to-emerald-500 h-5 rounded-full transition-all duration-1000 shadow-lg"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Key Innovation Callouts */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-gradient-to-r from-emerald-900/30 to-green-900/30 border border-emerald-500/30 rounded-xl p-6">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="text-xl font-bold text-emerald-400 mb-2">Small Investor Dream</h3>
              <p className="text-gray-300">200K entry → 6 phases → Heavy Eater level rewards</p>
            </div>
            <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/30 rounded-xl p-6">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-xl font-bold text-orange-400 mb-2">Phase Tier Boost</h3>
              <p className="text-gray-300">Each phase survival = automatic tier upgrade</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center text-white mb-12">
            🎯 Revolutionary Features
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <button
              onClick={() => setShowSmallInvestorPath(!showSmallInvestorPath)}
              className="bg-gradient-to-br from-emerald-900/40 to-green-900/40 border-2 border-emerald-500/50 rounded-2xl p-8 hover:scale-105 transition-all duration-300 text-left"
            >
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-2xl font-bold text-emerald-400 mb-4">Small Investor Path</h3>
              <p className="text-gray-300 mb-4">See how 200K entry can reach Heavy Eater through 6-phase journey</p>
              <div className="text-emerald-400 font-bold">Click to explore →</div>
            </button>

            <button
              onClick={() => setShowPhaseStrategy(!showPhaseStrategy)}
              className="bg-gradient-to-br from-orange-900/40 to-red-900/40 border-2 border-orange-500/50 rounded-2xl p-8 hover:scale-105 transition-all duration-300 text-left"
            >
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-2xl font-bold text-orange-400 mb-4">Phase Strategy</h3>
              <p className="text-gray-300 mb-4">Learn when to claim vs. when to continue staking</p>
              <div className="text-orange-400 font-bold">Click to learn →</div>
            </button>

            <div className="bg-gradient-to-br from-purple-900/40 to-violet-900/40 border-2 border-purple-500/50 rounded-2xl p-8">
              <div className="text-4xl mb-4">🧮</div>
              <h3 className="text-2xl font-bold text-purple-400 mb-4">Staking Calculator</h3>
              <p className="text-gray-300 mb-4">Calculate your potential rewards based on amount and phases</p>
              <div className="text-purple-400 font-bold">Coming soon →</div>
            </div>
          </div>
        </div>
      </div>

      {/* Small Investor Path Modal */}
      {showSmallInvestorPath && (
        <>
          {/* 모달 배경 - 하단 네비게이션 영역 제외 */}
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-40"
            style={{ paddingBottom: '100px' }}
            onClick={() => setShowSmallInvestorPath(false)}
          />
          {/* 모달 컨텐츠 */}
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ paddingBottom: '100px', pointerEvents: 'none' }}>
            <div 
              className="bg-gradient-to-br from-gray-900 to-black border-2 border-emerald-500/50 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              style={{ pointerEvents: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-4xl font-black text-emerald-400">🌱 Small Investor Dream Path</h2>
                  <button
                    onClick={() => setShowSmallInvestorPath(false)}
                    className="text-4xl text-gray-400 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6">🎯 The Journey: 200K → Heavy Eater</h3>
                    <div className="space-y-4">
                      {smallInvestorScenario.phases.map((phase, index) => (
                        <div key={index} className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/30">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xl font-bold text-emerald-400">Phase {phase.phase}</span>
                            <span className="text-lg font-bold text-white">{phase.tier}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Allocation:</span>
                              <div className="text-white font-bold">{phase.allocation.toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-gray-400">Cumulative:</span>
                              <div className="text-emerald-400 font-bold">{phase.cumulative.toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-gray-400">Tier:</span>
                              <div className="text-white font-bold">{phase.tier}</div>
                            </div>
                            <div>
                              <span className="text-gray-400">Multiplier:</span>
                              <div className="text-orange-400 font-bold">{phase.multiplier}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6">🏆 Final Achievement</h3>
                    <div className="bg-gradient-to-br from-emerald-900/50 to-green-900/50 border-2 border-emerald-500/50 rounded-2xl p-8">
                      <div className="text-center mb-6">
                        <div className="text-6xl mb-4">🥩→🌌</div>
                        <h4 className="text-3xl font-black text-emerald-400 mb-2">GENESIS OG</h4>
                        <p className="text-xl text-white">From Small Start to Legend</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Initial Staking:</span>
                          <span className="text-white font-bold">200K STAKE</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Total Accumulated:</span>
                          <span className="text-emerald-400 font-bold">835K STAKE</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Final Staking Power:</span>
                          <span className="text-emerald-400 font-bold">1,035K STAKE</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-emerald-500/30 pt-4">
                          <span className="text-gray-300">Final Multiplier:</span>
                          <span className="text-yellow-400 font-black text-2xl">x2.0</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 bg-orange-900/30 border border-orange-500/30 rounded-xl p-6">
                      <h4 className="text-lg font-bold text-orange-400 mb-3">💡 Key Insights</h4>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li>• Small investors can reach elite status through patience</li>
                        <li>• Each phase survival increases tier automatically</li>
                        <li>• 6-phase journey: 4x initial investment growth</li>
                        <li>• Final result: Special-level rewards with Genesis multiplier</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Phase Strategy Modal */}
      {showPhaseStrategy && (
        <>
          {/* 모달 배경 - 하단 네비게이션 영역 제외 */}
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-40"
            style={{ paddingBottom: '100px' }}
            onClick={() => setShowPhaseStrategy(false)}
          />
          {/* 모달 컨텐츠 */}
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ paddingBottom: '100px', pointerEvents: 'none' }}>
            <div 
              className="bg-gradient-to-br from-gray-900 to-black border-2 border-orange-500/50 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              style={{ pointerEvents: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-4xl font-black text-orange-400">📈 Phase Transition Strategy</h2>
                  <button
                    onClick={() => setShowPhaseStrategy(false)}
                    className="text-4xl text-gray-400 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6">🎯 Two Strategic Choices</h3>
                    
                    <div className="space-y-6">
                      <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-6">
                        <h4 className="text-xl font-bold text-red-400 mb-4">🔘 Immediate Claim</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Result:</span>
                            <span className="text-white">Instant token reward</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Tier Status:</span>
                            <span className="text-red-400">Reset to Virgen</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Next Phase:</span>
                            <span className="text-red-400">Cannot participate</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Best For:</span>
                            <span className="text-white">Quick profit seekers</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-6">
                        <h4 className="text-xl font-bold text-emerald-400 mb-4">🔘 Continue Staking</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Result:</span>
                            <span className="text-white">Allocation added to stake</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Tier Status:</span>
                            <span className="text-emerald-400">Upgrade +1 tier</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Next Phase:</span>
                            <span className="text-emerald-400">Higher tier entry</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Best For:</span>
                            <span className="text-white">Long-term maximizers</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6">🏆 Phase Progression Rewards</h3>
                    
                    <div className="space-y-3">
                      {phaseProgression.map((phase, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4 border border-gray-600/30"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-bold text-orange-400">{phase.phase}</span>
                            <span className="text-white">{phase.tier}</span>
                          </div>
                          <span 
                            className="font-bold px-3 py-1 rounded-full text-sm"
                            style={{
                              backgroundColor: index === phaseProgression.length - 1 ? '#10b98120' : '#eab30820',
                              color: index === phaseProgression.length - 1 ? '#10b981' : '#eab308'
                            }}
                          >
                            {phase.multiplier}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 bg-purple-900/30 border border-purple-500/30 rounded-xl p-6">
                      <h4 className="text-lg font-bold text-purple-400 mb-3">⚡ Special Upgrade Path</h4>
                      <div className="text-sm text-gray-300 space-y-2">
                        <p><strong className="text-white">Heavy Eater</strong> → Phase transition → <strong className="text-emerald-400">Genesis OG</strong></p>
                        <p>This is the <span className="text-emerald-400">new path to Genesis</span> for non-launch participants!</p>
                        <p>Patience and phase survival = Ultimate tier access</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Staking Levels Section */}
      <div className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center text-white mb-12">
            💰 Staking Amount Levels
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {stakingLevels.map((level, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-600/30 rounded-xl p-6 text-center hover:scale-105 transition-all duration-300"
              >
                <div className="text-3xl mb-4">{level.level.split(' ')[0]}</div>
                <h4 className="text-lg font-bold text-white mb-2">{level.level.split(' ')[1]}</h4>
                <p className="text-emerald-400 font-bold mb-3">{level.range}</p>
                <p className="text-sm text-gray-400">{level.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Evolution Steps */}
      <div className="px-4 pb-16 space-y-12">
        {evolutionSteps.map((step, index) => {
          const accentColors = getAccentColorClasses(step.accentColor);
          const isSpecial = step.id === 'genesis-og';
          
          return (
            <div
              key={step.id}
              className={`
                max-w-7xl mx-auto transition-all duration-1000 transform
                ${index <= currentStep ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-12'}
                ${index === currentStep ? 'scale-[1.02]' : 'scale-100'}
                ${isSpecial ? 'border-4 border-emerald-500/50 rounded-3xl p-4' : ''}
              `}
            >
              {isSpecial && (
                <div className="text-center mb-6">
                  <div className="inline-block bg-gradient-to-r from-emerald-400 to-teal-400 text-black px-6 py-2 rounded-full font-black text-lg">
                    🌌 Mythical Tier: Time Transcendent
                  </div>
                </div>
              )}
              
              <div className={`
                bg-gradient-to-br ${step.bgGradient} backdrop-blur-xl
                border-2 ${step.borderColor} rounded-3xl overflow-hidden
                ${index === currentStep ? `ring-4 ${accentColors.ring}/30 shadow-2xl` : ''}
                ${isSpecial ? 'ring-4 ring-emerald-500/50 shadow-2xl shadow-emerald-500/20' : ''}
                transition-all duration-700
              `}>
                
                {/* Character Section */}
                <div className="grid lg:grid-cols-2 gap-8 p-8">
                  
                  {/* Character Visual */}
                  <div className="flex flex-col items-center">
                    <div className={`
                      relative w-full max-w-md aspect-square rounded-3xl overflow-hidden mb-6
                      ${completedSteps.has(index) ? 'ring-4 ring-green-500 shadow-2xl shadow-green-500/30' : `ring-2 ${accentColors.ring}/50`}
                      ${isSpecial ? 'ring-4 ring-emerald-500 shadow-2xl shadow-emerald-500/30' : ''}
                      transition-all duration-500
                    `}>
                      {/* Character Image Container */}
                      <div className={`w-full h-full bg-gradient-to-br ${step.bgGradient} relative overflow-hidden`}>
                        <div 
                          className="w-full h-full bg-cover bg-center"
                          style={{ 
                            backgroundImage: `url('/images/character/${step.id}.png')`,
                            backgroundColor: step.symbolColor + '20'
                          }}
                        >
                          <div className="w-full h-full bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
                        </div>
                        
                        {/* Text Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 md:p-6">
                          <div className="text-center px-2 md:px-0">
                            <h3 className="text-2xl md:text-3xl font-black text-white mb-2 drop-shadow-2xl">
                              {step.title}
                            </h3>
                            <p className="text-sm text-gray-200 opacity-90 mb-2 drop-shadow-lg">
                              {step.characterName}
                            </p>
                            <div className="text-xs text-gray-300 bg-black/40 rounded-full px-3 py-1 backdrop-blur-sm">
                              {step.keywords}
                            </div>
                          </div>
                        </div>

                        {/* Evolution Number */}
                        <div 
                          className={`
                            absolute -top-6 -left-6 w-16 h-16 rounded-full
                            flex items-center justify-center font-black text-white text-xl
                            shadow-lg border-4 border-gray-900
                          `}
                          style={{ backgroundColor: step.symbolColor }}
                        >
                          {isSpecial ? '🌌' : index + 1}
                        </div>

                        {/* Tier Info Overlay */}
                        <div className="absolute top-4 right-4 bg-black/70 rounded-lg p-3 backdrop-blur-sm">
                          <div className="text-center">
                            <div className="text-xs text-gray-400 mb-1">Tier</div>
                            <div className="text-sm font-bold" style={{ color: step.symbolColor }}>
                              {step.tierGrade}
                            </div>
                            <div className="text-xs text-gray-400 mb-1">Multiplier</div>
                            <div className="text-lg font-black text-white">
                              {step.multiplier}
                            </div>
                          </div>
                        </div>

                        {/* Status Overlay */}
                        {completedSteps.has(index) && (
                          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center backdrop-blur-sm">
                            <div className="text-6xl animate-pulse drop-shadow-2xl">✅</div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`
                      px-8 py-3 rounded-full text-sm font-bold border-2 transition-all duration-300
                      ${completedSteps.has(index) 
                        ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                        : index === currentStep
                        ? `bg-opacity-20 border-opacity-50 animate-pulse`
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/50'}
                    `}
                    style={{
                      backgroundColor: index === currentStep ? step.symbolColor + '20' : undefined,
                      borderColor: index === currentStep ? step.symbolColor + '80' : undefined,
                      color: index === currentStep ? step.symbolColor : undefined
                    }}>
                      {completedSteps.has(index) ? '✓ TIER UNLOCKED' : 
                       index === currentStep ? '🔥 CURRENT TIER' : 
                       '🔒 LOCKED'}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex flex-col justify-center space-y-8">
                    
                    {/* Story Quote */}
                    <div className="relative">
                      <div className="bg-black/50 rounded-2xl p-6 md:p-8 border border-gray-700/50 relative overflow-hidden">
                        <div 
                          className="absolute top-4 left-4 md:left-6 text-4xl md:text-5xl opacity-20"
                          style={{ color: step.symbolColor }}
                        >"</div>
                        <div 
                          className="absolute bottom-4 right-4 md:right-6 text-4xl md:text-5xl opacity-20"
                          style={{ color: step.symbolColor }}
                        >"</div>
                        
                        <p className="text-lg md:text-2xl font-bold text-center leading-relaxed relative z-10 px-4 md:px-8">
                          {step.story}
                        </p>
                      </div>
                    </div>

                    {/* Tier Requirements */}
                    <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-600/30">
                      <h4 className="text-lg font-bold text-white mb-4">🎯 Tier Requirements</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Condition:</span>
                          <span className="text-white font-bold">{step.requirement}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Multiplier:</span>
                          <span style={{ color: step.symbolColor }} className="font-bold">{step.multiplier}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Grade:</span>
                          <span className="text-white font-bold">{step.tierGrade}</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <p className="text-lg text-gray-300 leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Tips */}
                    <div>
                      <h4 
                        className="text-lg font-bold mb-4 flex items-center gap-3"
                        style={{ color: step.symbolColor }}
                      >
                        <span>💡</span> Key Strategies
                      </h4>
                      <div className="space-y-3">
                        {step.tips.map((tip, tipIndex) => (
                          <div key={tipIndex} className="flex items-start gap-3 group">
                            <span 
                              className="text-sm mt-1 group-hover:scale-125 transition-transform"
                              style={{ color: step.symbolColor }}
                            >▶</span>
                            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <button
                      onClick={() => handleStepComplete(index)}
                      disabled={index > currentStep || completedSteps.has(index)}
                      className={`
                        w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 relative overflow-hidden
                        ${index === currentStep && !completedSteps.has(index)
                          ? 'text-black shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95'
                          : completedSteps.has(index)
                          ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50 cursor-not-allowed'
                          : 'bg-gray-700/50 text-gray-500 cursor-not-allowed border-2 border-gray-600/30'
                        }
                      `}
                      style={{
                        backgroundColor: index === currentStep && !completedSteps.has(index) ? step.symbolColor : undefined
                      }}
                      onMouseEnter={(e) => {
                        if (index === currentStep && !completedSteps.has(index)) {
                          e.target.style.backgroundColor = step.symbolColor + 'cc';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (index === currentStep && !completedSteps.has(index)) {
                          e.target.style.backgroundColor = step.symbolColor;
                        }
                      }}
                    >
                      {completedSteps.has(index) ? '✅ Tier Mastered' : 
                       index === currentStep ? step.action : 
                       '🔒 Complete Previous Tiers'}
                    </button>
                  </div>
                </div>

                {/* Info Block */}
                {step.infoBlock && (
                  <div className="mx-8 mb-8">
                    <div className={`
                      bg-gradient-to-br ${step.infoBlock.bgColor} backdrop-blur-lg
                      border-2 ${step.infoBlock.borderColor} rounded-2xl p-8
                    `}>
                      <h4 className="text-2xl font-black text-white mb-6 text-center">
                        {step.infoBlock.title}
                      </h4>
                      <div className="text-gray-200 leading-relaxed whitespace-pre-line">
                        {step.infoBlock.content}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete Tier System Overview */}
      <div className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center text-white mb-12">
            Complete Tier System Overview
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {tierSystem.map((tier, index) => (
              <div
                key={tier.name}
                className={`
                  backdrop-blur-lg border rounded-xl p-6 transition-all duration-300
                  hover:scale-105 hover:shadow-xl
                  ${tier.grade === 'Genesis' ? 'ring-2 ring-emerald-500/50' : ''}
                  ${tier.grade === 'Legendary' ? 'ring-2 ring-red-500/50' : ''}
                  ${tier.grade === 'Unique' ? 'ring-2 ring-yellow-500/50' : ''}
                  ${tier.grade === 'Epic' ? 'ring-2 ring-purple-500/50' : ''}
                `}
                style={{
                  backgroundColor: tier.color + '15',
                  borderColor: tier.color + '40'
                }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{tier.tier}</div>
                  <h4 className="font-bold text-white mb-2">{tier.name}</h4>
                  <div 
                    className="text-xs font-bold px-2 py-1 rounded-full mb-3"
                    style={{
                      backgroundColor: tier.color + '20',
                      color: tier.color,
                      border: `1px solid ${tier.color}40`
                    }}
                  >
                    {tier.grade}
                  </div>
                  <div className="text-sm text-gray-400 mb-3">{tier.condition}</div>
                  <div className="text-sm text-gray-300 mb-3">{tier.benefit}</div>
                  <div 
                    className="text-lg font-black px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: tier.color + '20',
                      color: tier.color
                    }}
                  >
                    {tier.multiplier}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Completion Celebration */}
      {completedSteps.size === evolutionSteps.length && (
        <div className="px-4 pb-16">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-emerald-900/30 via-teal-900/20 to-emerald-900/30 backdrop-blur-xl border-4 border-emerald-500/40 rounded-3xl p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 animate-pulse"></div>
            
            <div className="relative z-10">
              <div className="text-9xl mb-8 animate-bounce">🏆</div>
              <h2 className="text-5xl md:text-6xl font-black text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-clip-text mb-8">
                TIER MASTERY COMPLETE!
              </h2>
              <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                You now understand the complete journey from <span className="text-red-400 font-bold">VIRGEN to GENESIS OG</span>. 
                <br/>Time to write your own legend on the leaderboard!
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-6 px-10 rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 text-xl">
                  <span className="flex items-center justify-center gap-4">
                    <span className="text-2xl">🚀</span>
                    <span>Start Your Journey</span>
                  </span>
                </button>
                <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-6 px-10 rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-orange-500/30 text-xl">
                  <span className="flex items-center justify-center gap-4">
                    <span className="text-2xl">🥩</span>
                    <span>Join Leaderboard</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex space-x-2 bg-black/90 backdrop-blur-xl rounded-full p-3 border border-gray-700/50 shadow-2xl">
          {evolutionSteps.map((step, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`
                w-4 h-4 rounded-full transition-all duration-300 relative
                ${index <= currentStep ? '' : 'bg-gray-600'}
                ${index === currentStep ? 'scale-150 ring-4 ring-white/30' : 'scale-100'}
                ${completedSteps.has(index) ? 'bg-green-500 ring-2 ring-green-400/50' : ''}
                hover:scale-125 cursor-pointer
              `}
              style={{
                backgroundColor: index <= currentStep && !completedSteps.has(index) ? step.symbolColor : undefined
              }}
              title={`${index + 1}. ${step.title}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StakeHowToPage;