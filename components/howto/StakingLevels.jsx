// components/howto/StakingLevels.jsx
import React from 'react';
import { STAKING_LEVELS } from '../../data/tierData';

const StakingLevels = () => {
  return (
    <div className="space-y-6 sm:space-y-8 px-1 sm:px-0">
      <h2 className="text-2xl sm:text-4xl font-black text-center text-white mb-8 sm:mb-12 px-2">
        💰 Staking Amount Levels
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto px-1 sm:px-0">
        {STAKING_LEVELS.map((level, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-600/30 rounded-xl p-6 sm:p-8 text-center hover:border-emerald-500/50 transition-all duration-300"
          >
            <div className="text-4xl mb-4">
              {level.level.split(' ')[0]} {/* 이모지 부분 */}
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">
              {level.level.split(' ')[1]} {/* 레벨 이름 */}
            </h4>
            <p className="text-emerald-400 font-bold text-lg mb-3">{level.range}</p>
            <p className="text-sm text-gray-400">{level.description}</p>
          </div>
        ))}
      </div>

      {/* 추가 설명 섹션 */}
      <div className="mt-12 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-2 border-blue-500/30 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-blue-400 mb-4 text-center">
          📊 How Staking Levels Work
        </h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div className="text-center">
            <h4 className="font-bold text-white mb-2">🎯 Level Requirements</h4>
            <p className="text-gray-300">
              Your staking level is determined by the total amount of STAKE tokens you hold. 
              Higher levels unlock access to better tier progressions.
            </p>
          </div>
          <div className="text-center">
            <h4 className="font-bold text-white mb-2">⏰ Time + Amount</h4>
            <p className="text-gray-300">
              Tier advancement requires both sufficient staking level AND holding duration. 
              Both conditions must be met to upgrade your tier.
            </p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <h5 className="text-lg font-bold text-blue-400 mb-3 text-center">💡 Pro Tips</h5>
          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-400">Smart Strategy:</span>
              <div className="text-white">Start with Entry level, gradually increase your stake</div>
            </div>
            <div>
              <span className="text-gray-400">Whale Path:</span>
              <div className="text-white">Jump to Special level for fastest tier progression</div>
            </div>
            <div>
              <span className="text-gray-400">Patience Pays:</span>
              <div className="text-white">Time requirements are just as important as amounts</div>
            </div>
            <div>
              <span className="text-gray-400">Flexibility:</span>
              <div className="text-white">You can increase your stake level anytime</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakingLevels;