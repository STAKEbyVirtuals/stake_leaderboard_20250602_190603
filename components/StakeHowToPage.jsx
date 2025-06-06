import React, { useState, useEffect } from 'react';

const StakeHowToPage = () => {
  const [activeSection, setActiveSection] = useState('evolution');
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Complete project timeline data
  const COMPLETE_TIMELINE = {
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

  // Phase participation rules
  const PHASE_PARTICIPATION_RULES = [
    {
      rule: "Join Button Required",
      description: "You must click the 'Join Phase' button at the start of each phase.",
      icon: "Click",
      importance: "critical"
    },
    {
      rule: "No Auto Participation",
      description: "Previous phase participation does NOT automatically join you to the next phase.",
      icon: "Manual",
      importance: "critical"
    },
    {
      rule: "No Join = No Points",
      description: "If you don't click join, your staking won't accumulate any points.",
      icon: "Warning",
      importance: "critical"
    },
    {
      rule: "Late Join Penalty",
      description: "Joining mid-phase means you lose all points from the beginning of that phase.",
      icon: "Time",
      importance: "warning"
    }
  ];

  // Hybrid tier upgrade system
  const HYBRID_TIER_SYSTEM = {
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

  // Updated claim strategies
  const CLAIM_STRATEGIES = [
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

  // Evolution steps for the event
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
    { name: 'VIRGEN', condition: 'Not participating', benefit: 'Unlimited potential', multiplier: 'x0', color: '#6b7280', grade: 'None' },
    { name: 'Sizzlin\' Noob', condition: 'Entry level staking', benefit: 'Basic participation', multiplier: 'x1.0', color: '#ffffff', grade: 'Normal' },
    { name: 'Flipstarter', condition: 'Entry + 1 week', benefit: 'Consistency bonus', multiplier: 'x1.1', color: '#22c55e', grade: 'Uncommon' },
    { name: 'Flame Juggler', condition: 'Mid + 2 weeks', benefit: 'Growing power', multiplier: 'x1.25', color: '#3b82f6', grade: 'Rare' },
    { name: 'Grilluminati', condition: 'Mid + 1 month', benefit: 'Strategic advantage', multiplier: 'x1.4', color: '#8b5cf6', grade: 'Epic' },
    { name: 'Stake Wizard', condition: 'High + 2 months', benefit: 'Rule creation', multiplier: 'x1.6', color: '#eab308', grade: 'Unique' },
    { name: 'Heavy Eater', condition: 'Special + 3 months', benefit: 'Ultimate domination', multiplier: 'x1.8', color: '#ef4444', grade: 'Legendary' },
    { name: 'Genesis OG', condition: 'Launch day OR Phase survival', benefit: 'Mythical legend', multiplier: 'x2.0', color: '#10b981', grade: 'Genesis' }
  ];

  const stakingLevels = [
    { level: 'Entry', range: 'Up to 200K STAKE', description: 'Perfect for beginners' },
    { level: 'Mid', range: '200K - 1M STAKE', description: 'Serious participants' },
    { level: 'High', range: '1M - 10M STAKE', description: 'Dedicated investors' },
    { level: 'Special', range: '10M+ STAKE', description: 'Elite whale tier' }
  ];

  const sections = [
    {
      id: 'evolution',
      title: '🔥 Evolution Journey - Complete 8 Tiers & Earn 50K STAKE!',
      isEvent: true
    },
    {
      id: 'hybrid',
      title: 'Hybrid Tier System - Two Paths to Advancement',
      isEvent: false
    },
    {
      id: 'timeline',
      title: 'Project Timeline - 6 Phases & Token Distribution',
      isEvent: false
    },
    {
      id: 'participation',
      title: 'Phase Participation - Manual Join Requirements',
      isEvent: false
    },
    {
      id: 'strategies',
      title: 'Claim Strategies - When to Hold vs When to Cash Out',
      isEvent: false
    },
    {
      id: 'levels',
      title: 'Staking Levels - Entry to Special Tier Guide',
      isEvent: false
    },
    {
      id: 'nft',
      title: 'NFT & Future Utility - Your Permanent Legacy',
      isEvent: false
    }
  ];

  const handleStepComplete = (stepIndex) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
    if (stepIndex < evolutionSteps.length - 1) {
      setTimeout(() => setCurrentStep(stepIndex + 1), 1000);
    }
  };

  const handleShareOnX = () => {
    const tweetText = encodeURIComponent(
      `🔥 I just completed the STAKE Evolution Challenge! 🚀\n\n` +
      `✅ Mastered all 8 tiers from VIRGEN to GENESIS OG\n` +
      `💰 Earned 50,000 STAKE tokens!\n\n` +
      `Join the evolution: [Your-Link-Here]\n\n` +
      `#STAKEEvolution #Web3Gaming #STAKEProtocol`
    );
    
    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(tweetUrl, '_blank');
  };

  const progressPercentage = ((completedSteps.size) / evolutionSteps.length) * 100;

  const getAccentColorClasses = (color) => {
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

  // Evolution Journey Content
  const renderEvolutionJourney = () => (
    <div className="space-y-8">
      {/* Event Header */}
      <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border-4 border-orange-500/50 rounded-3xl p-8 text-center">
        <div className="text-6xl mb-4">🎁</div>
        <h2 className="text-4xl font-black text-orange-400 mb-4">
          Special Event: Evolution Challenge
        </h2>
        <p className="text-xl text-gray-300 mb-6 max-w-3xl mx-auto">
          Complete all 8 tier steps, share your achievement on X, and earn <span className="text-orange-400 font-bold">50,000 STAKE tokens!</span>
        </p>
        
        {/* Progress Tracker */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex justify-between text-lg text-gray-400 mb-4">
            <span className="font-bold">Progress</span>
            <span className="font-bold text-orange-400">{completedSteps.size}/8 Completed</span>
            <span className="font-bold">50K STAKE</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-6 shadow-inner">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-6 rounded-full transition-all duration-1000 shadow-lg flex items-center justify-center"
              style={{ width: `${progressPercentage}%` }}
            >
              {progressPercentage > 10 && (
                <span className="text-white font-bold text-sm">{Math.round(progressPercentage)}%</span>
              )}
            </div>
          </div>
        </div>

        {completedSteps.size === evolutionSteps.length && (
          <button 
            onClick={handleShareOnX}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 px-8 rounded-2xl text-xl hover:scale-105 transition-all duration-300 shadow-lg"
          >
            🐦 Share on X & Claim 50K STAKE!
          </button>
        )}
      </div>

      {/* Evolution Steps */}
      <div className="space-y-12">
        {evolutionSteps.map((step, index) => {
          const accentColors = getAccentColorClasses(step.accentColor);
          const isCompleted = completedSteps.has(index);
          const isActive = index === currentStep;
          const isSpecial = step.id === 'genesis-og';
          
          return (
            <div
              key={step.id}
              className={`
                max-w-7xl mx-auto transition-all duration-1000 transform
                ${isCompleted ? 'opacity-100 scale-100' : isActive ? 'opacity-100 scale-100' : 'opacity-60 scale-95'}
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
                ${isActive ? `ring-4 ${accentColors.ring}/30 shadow-2xl` : ''}
                ${isCompleted ? 'ring-4 ring-green-500/50 shadow-2xl shadow-green-500/20' : ''}
                ${isSpecial ? 'ring-4 ring-emerald-500/50 shadow-2xl shadow-emerald-500/20' : ''}
                transition-all duration-700
              `}>
                
                <div className="grid lg:grid-cols-2 gap-8 p-8">
                  {/* Character Visual */}
                  <div className="flex flex-col items-center">
                    <div className={`
                      relative w-full max-w-md aspect-square rounded-3xl overflow-hidden mb-6
                      ${isCompleted ? 'ring-4 ring-green-500 shadow-2xl shadow-green-500/30' : `ring-2 ${accentColors.ring}/50`}
                      ${isSpecial ? 'ring-4 ring-emerald-500 shadow-2xl shadow-emerald-500/30' : ''}
                      transition-all duration-500
                    `}>
                      <div className={`w-full h-full bg-gradient-to-br ${step.bgGradient} relative overflow-hidden`}>
                        {/* Character image/emoji with overlay text */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        
                        {/* Character emoji */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-8xl" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>
                            {step.id === 'virgen' ? '🐸' :
                             step.id === 'sizzlin-noob' ? '🆕' :
                             step.id === 'flipstarter' ? '🔁' :
                             step.id === 'flame-juggler' ? '🔥' :
                             step.id === 'grilluminati' ? '🧠' :
                             step.id === 'stake-wizard' ? '🧙‍♂️' :
                             step.id === 'heavy-eater' ? '🥩' :
                             '🌌'}
                          </div>
                        </div>

                        {/* Text overlay at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-center text-white">
                          <h3 className="text-2xl md:text-3xl font-black mb-2 drop-shadow-2xl">
                            {step.title}
                          </h3>
                          <p className="text-sm text-gray-200 opacity-90 mb-2 drop-shadow-lg">
                            {step.characterName}
                          </p>
                          <div className="text-xs text-gray-300 bg-black/40 rounded-full px-3 py-1 backdrop-blur-sm inline-block">
                            {step.keywords}
                          </div>
                        </div>
                          
                        {/* Tier info overlay - top right */}
                        <div className="absolute top-4 right-4 bg-black/70 rounded-lg backdrop-blur-sm p-3">
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

                        {/* Completion overlay */}
                        {isCompleted && (
                          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center backdrop-blur-sm">
                            <div className="text-6xl animate-pulse drop-shadow-2xl">✅</div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`
                      px-8 py-3 rounded-full text-sm font-bold border-2 transition-all duration-300
                      ${isCompleted 
                        ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                        : isActive
                        ? 'bg-opacity-20 border-opacity-50 animate-pulse'
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/50'}
                    `}
                    style={{
                      backgroundColor: isActive && !isCompleted ? step.symbolColor + '20' : undefined,
                      borderColor: isActive && !isCompleted ? step.symbolColor + '80' : undefined,
                      color: isActive && !isCompleted ? step.symbolColor : undefined
                    }}>
                      {isCompleted ? '✅ TIER UNLOCKED' : 
                       isActive ? '🔥 CURRENT TIER' : 
                       '🔒 LOCKED'}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex flex-col justify-center space-y-6">
                    {/* Story Quote */}
                    <div className="relative">
                      <div className="bg-black/50 rounded-2xl p-6 border border-gray-700/50 relative overflow-hidden">
                        <p className="text-xl font-bold text-center leading-relaxed relative z-10">
                          "{step.story}"
                        </p>
                      </div>
                    </div>

                    {/* Tier Requirements */}
                    <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-600/30">
                      <h4 className="text-lg font-bold text-white mb-4">Tier Requirements</h4>
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
                    <p className="text-lg text-gray-300 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Tips */}
                    <div>
                      <h4 className="text-lg font-bold mb-4 flex items-center gap-3" style={{ color: step.symbolColor }}>
                        💡 Key Strategies
                      </h4>
                      <div className="space-y-3">
                        {step.tips.map((tip, tipIndex) => (
                          <div key={tipIndex} className="flex items-start gap-3 group">
                            <span className="text-sm mt-1 group-hover:scale-125 transition-transform" style={{ color: step.symbolColor }}>▶</span>
                            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <button
                      onClick={() => handleStepComplete(index)}
                      disabled={index > currentStep || isCompleted}
                      className={`
                        w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 relative overflow-hidden
                        ${index === currentStep && !isCompleted
                          ? 'text-black shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95'
                          : isCompleted
                          ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50 cursor-not-allowed'
                          : 'bg-gray-700/50 text-gray-500 cursor-not-allowed border-2 border-gray-600/30'
                        }
                      `}
                      style={{
                        backgroundColor: index === currentStep && !isCompleted ? step.symbolColor : undefined
                      }}
                    >
                      {isCompleted ? '✅ Tier Mastered' : 
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

      {/* Completion Celebration */}
      {completedSteps.size === evolutionSteps.length && (
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-emerald-900/30 via-teal-900/20 to-emerald-900/30 backdrop-blur-xl border-4 border-emerald-500/40 rounded-3xl p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 animate-pulse"></div>
          
          <div className="relative z-10">
            <div className="text-9xl mb-8 animate-bounce">🏆</div>
            <h2 className="text-5xl md:text-6xl font-black text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-clip-text mb-8">
              EVOLUTION COMPLETE!
            </h2>
            <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              You've mastered all 8 tiers! Now share your achievement on X to claim your <span className="text-orange-400 font-bold">50,000 STAKE</span> reward!
            </p>
            
            <button 
              onClick={handleShareOnX}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-6 px-12 rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg text-2xl"
            >
              🐦 Share Achievement & Claim Reward
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Hybrid System Content
  const renderHybridSystem = () => (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white mb-8">Hybrid Tier Upgrade System</h2>
      
      <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-4 border-blue-500/50 rounded-3xl p-8 mb-12">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⚡</div>
          <h3 className="text-3xl font-black text-blue-400 mb-4">
            Two Paths to Tier Advancement
          </h3>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Upgrade your tier through traditional requirements OR phase completion rewards. 
            Whichever path is faster applies first!
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Natural upgrade path */}
          <div className="bg-gray-800/30 border-2 border-green-500/30 rounded-2xl p-8">
            <h4 className="text-2xl font-bold text-green-400 mb-6 text-center">
              Path A: Natural Progression
            </h4>
            
            <div className="space-y-4">
              {HYBRID_TIER_SYSTEM.naturalUpgrade.map((upgrade, index) => (
                <div key={index} className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-bold text-sm">{upgrade.from}</span>
                    <span className="text-green-400">→</span>
                    <span className="text-green-400 font-bold text-sm">{upgrade.to}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {upgrade.condition}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <h5 className="text-sm font-bold text-green-400 mb-2">How it works:</h5>
              <p className="text-xs text-gray-300">
                Traditional requirements based on staking amount and holding period. 
                The longer you hold and the more you stake, the faster you advance.
              </p>
            </div>
          </div>
          
          {/* Phase upgrade path */}
          <div className="bg-gray-800/30 border-2 border-purple-500/30 rounded-2xl p-8">
            <h4 className="text-2xl font-bold text-purple-400 mb-6 text-center">
              Path B: Phase Completion Rewards
            </h4>
            
            <div className="space-y-4 mb-6">
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
                <h5 className="text-white font-bold text-sm mb-3">Requirements (ALL must be met):</h5>
                <div className="space-y-2">
                  {HYBRID_TIER_SYSTEM.phaseUpgrade.requirements.map((req, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-purple-400 text-xs mt-1">•</span>
                      <span className="text-xs text-gray-300">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
                <h5 className="text-purple-400 font-bold text-sm mb-1">Result:</h5>
                <span className="text-white font-bold">{HYBRID_TIER_SYSTEM.phaseUpgrade.result}</span>
              </div>
            </div>
            
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <h5 className="text-sm font-bold text-purple-400 mb-2">How it works:</h5>
              <p className="text-xs text-gray-300">
                Complete a full phase with perfect conditions to get an automatic tier boost. 
                Great for late joiners to catch up quickly!
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl text-center">
          <h5 className="text-xl font-bold text-blue-400 mb-3">
            Fastest Path Wins
          </h5>
          <p className="text-gray-300 leading-relaxed">
            {HYBRID_TIER_SYSTEM.phaseUpgrade.note}
          </p>
        </div>
      </div>

      {/* Phase upgrade requirements detail */}
      <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border-2 border-red-500/30 rounded-3xl p-8">
        <h3 className="text-2xl font-bold text-center text-red-400 mb-8">
          Phase Upgrade Requirements (Detailed)
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-800/30 border border-red-500/20 rounded-xl p-6">
            <h4 className="text-lg font-bold text-red-400 mb-4">
              1. Early Bird (24h)
            </h4>
            <div className="space-y-2 text-sm">
              <div className="text-gray-300">• Join within 24 hours of phase start</div>
              <div className="text-gray-300">• No exceptions for late entry</div>
              <div className="text-gray-300">• Timestamp recorded on blockchain</div>
            </div>
          </div>
          
          <div className="bg-gray-800/30 border border-orange-500/20 rounded-xl p-6">
            <h4 className="text-lg font-bold text-orange-400 mb-4">
              2. Active Staking
            </h4>
            <div className="space-y-2 text-sm">
              <div className="text-gray-300">• At least 1 additional staking transaction</div>
              <div className="text-gray-300">• Must happen during the phase period</div>
              <div className="text-gray-300">• Any amount counts (even small amounts)</div>
            </div>
          </div>
          
          <div className="bg-gray-800/30 border border-yellow-500/20 rounded-xl p-6">
            <h4 className="text-lg font-bold text-yellow-400 mb-4">
              3. Diamond Hands
            </h4>
            <div className="space-y-2 text-sm">
              <div className="text-gray-300">• No unstaking until phase ends</div>
              <div className="text-gray-300">• Even partial unstaking disqualifies</div>
              <div className="text-gray-300">• Hold strong until snapshot</div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
          <h5 className="text-lg font-bold text-red-400 mb-3">Important Notes</h5>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Qualification Check:</span>
              <div className="text-white">Automated verification at phase end</div>
            </div>
            <div>
              <span className="text-gray-400">Failure Penalty:</span>
              <div className="text-white">No tier upgrade, regular rules apply</div>
            </div>
            <div>
              <span className="text-gray-400">Multiple Phases:</span>
              <div className="text-white">Each phase is independent</div>
            </div>
            <div>
              <span className="text-gray-400">Maximum Benefit:</span>
              <div className="text-white">+1 tier per successful phase</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Other section renders would go here...
  const renderTimeline = () => (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white mb-8">Project Timeline</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {COMPLETE_TIMELINE.phases.map((phase) => (
          <div
            key={phase.phase}
            className={`rounded-2xl p-6 border-2 ${
              phase.status === 'current' 
                ? 'bg-emerald-900/30 border-emerald-500/50' 
                : 'bg-gray-800/30 border-gray-600/30'
            }`}
          >
            <div className="text-2xl font-black mb-4">Phase {phase.phase}</div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">Period:</span>
                <div className="text-white font-bold">{phase.staking}</div>
              </div>
              <div>
                <span className="text-gray-400">Snapshot:</span>
                <div className="text-white font-bold">{phase.snapshot}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPhaseParticipation = () => (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white mb-8">Phase Participation System</h2>
      <div className="text-white">Manual participation required for each phase. Auto-participation is not supported.</div>
    </div>
  );

  const renderClaimStrategies = () => (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white mb-8">Claim Strategy Guide</h2>
      <div className="grid lg:grid-cols-3 gap-8">
        {CLAIM_STRATEGIES.map((strategy, index) => (
          <div
            key={index}
            className={`rounded-3xl p-8 border-2 ${
              strategy.color === 'red' ? 'bg-red-900/20 border-red-500/40' :
              strategy.color === 'green' ? 'bg-green-900/20 border-green-500/40' :
              'bg-emerald-900/20 border-emerald-500/40'
            }`}
          >
            <h3 className={`text-2xl font-black mb-4 ${
              strategy.color === 'red' ? 'text-red-400' :
              strategy.color === 'green' ? 'text-green-400' :
              'text-emerald-400'
            }`}>
              {strategy.strategy}
            </h3>
            <div className="text-white">{strategy.result}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStakingLevels = () => (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white mb-8">Staking Amount Levels</h2>
      <div className="grid md:grid-cols-4 gap-6">
        {stakingLevels.map((level, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-600/30 rounded-xl p-6 text-center"
          >
            <h4 className="text-lg font-bold text-white mb-2">{level.level}</h4>
            <p className="text-emerald-400 font-bold mb-3">{level.range}</p>
            <p className="text-sm text-gray-400">{level.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNFTContent = () => (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white mb-8">NFT & Future Utility</h2>
      <div className="text-white">Your final tier will be minted as a permanent NFT with future utility across the STAKE ecosystem.</div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'evolution':
        return renderEvolutionJourney();
      case 'hybrid':
        return renderHybridSystem();
      case 'timeline':
        return renderTimeline();
      case 'participation':
        return renderPhaseParticipation();
      case 'strategies':
        return renderClaimStrategies();
      case 'levels':
        return renderStakingLevels();
      case 'nft':
        return renderNFTContent();
      default:
        return renderEvolutionJourney();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative px-4 py-16 text-center">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-6xl md:text-8xl font-black mb-8 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
            VIRGEN → LEGEND
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Master the complete STAKE evolution system and earn rewards along the way
          </p>
        </div>
      </div>

      {/* Accordion Navigation */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="space-y-2 mb-8">
          {sections.map((section) => (
            <div key={section.id} className="border border-gray-600/30 rounded-lg overflow-hidden">
              <button
                onClick={() => setActiveSection(activeSection === section.id ? '' : section.id)}
                className="w-full flex items-center justify-between p-4 bg-gray-800/30 hover:bg-gray-700/30 transition-all duration-200 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">
                    {activeSection === section.id ? '▼' : '▶'}
                  </span>
                  <span className="text-white font-bold">{section.title}</span>
                </div>
                <span className="text-gray-500 text-sm">#</span>
              </button>
              
              {activeSection === section.id && (
                <div className="border-t border-gray-600/30 bg-gray-900/20 p-6">
                  {renderContent()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StakeHowToPage;