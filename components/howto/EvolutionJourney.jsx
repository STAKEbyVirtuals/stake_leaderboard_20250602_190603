// components/howto/EvolutionJourney.jsx
import React, { useState, useEffect } from 'react';
import { EVOLUTION_STEPS } from '../../data/evolutionData';
import { getAccentColorClasses, getTierEmoji } from '../../utils/colorUtils';

const EvolutionJourney = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const handleStepComplete = (stepIndex) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
    if (stepIndex < EVOLUTION_STEPS.length - 1) {
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

  const progressPercentage = ((completedSteps.size) / EVOLUTION_STEPS.length) * 100;

  return (
    <div className="space-y-6 sm:space-y-8 px-1 sm:px-0">
      {/* Event Header */}
      <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border-4 border-orange-500/50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-center">
        <div className="text-6xl mb-4">🎁</div>
        <h2 className="text-2xl sm:text-4xl font-black text-orange-400 mb-4">
          Special Event: Evolution Challenge
        </h2>
        <p className="text-lg sm:text-xl text-gray-300 mb-6 max-w-3xl mx-auto px-2">
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

        {completedSteps.size === EVOLUTION_STEPS.length && (
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
        {EVOLUTION_STEPS.map((step, index) => {
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
                
                <div className="grid lg:grid-cols-2 gap-4 sm:gap-8 p-4 sm:p-8">
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
                            {getTierEmoji(step.id)}
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
      {completedSteps.size === EVOLUTION_STEPS.length && (
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
};

export default EvolutionJourney;