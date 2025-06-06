// components/howto/TierSystemOverview.jsx
import React from 'react';
import { TIER_SYSTEM } from '../../data/tierData';

const TierSystemOverview = () => {
  return (
    <div className="space-y-6 sm:space-y-8 px-1 sm:px-0">
      <h2 className="text-2xl sm:text-4xl font-black text-center text-white mb-8 sm:mb-12 px-2">
        ⭐ Complete Tier System Overview
      </h2>
      
      <div className="space-y-3 sm:space-y-4 max-w-5xl mx-auto px-1 sm:px-0">
        {TIER_SYSTEM.map((tier, index) => (
          <div
            key={index}
            className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 border border-gray-600/30 rounded-xl p-4 sm:p-6 hover:border-opacity-60 transition-all duration-300 group"
            style={{ borderColor: tier.color + '40' }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 items-center text-center md:text-left">
              {/* 티어 이름 & 등급 */}
              <div className="md:col-span-1">
                <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">{tier.grade}</div>
                <h4 className="text-lg font-bold text-white group-hover:text-gray-100 transition-colors">
                  {tier.name}
                </h4>
              </div>
              
              {/* 조건 */}
              <div className="md:col-span-2">
                <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Requirements</div>
                <div className="text-sm text-gray-300 leading-relaxed">{tier.condition}</div>
              </div>
              
              {/* 혜택 */}
              <div className="md:col-span-1">
                <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Benefit</div>
                <div className="text-sm text-gray-300">{tier.benefit}</div>
              </div>
              
              {/* 배수 */}
              <div className="md:col-span-1 text-center">
                <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Power</div>
                <div 
                  className="text-2xl font-black group-hover:scale-110 transition-transform duration-300"
                  style={{ color: tier.color }}
                >
                  {tier.multiplier}
                </div>
              </div>
            </div>
            
            {/* 호버시 나타나는 추가 정보 */}
            <div className="mt-4 p-3 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="text-xs text-gray-400 text-center">
                🎯 This tier gives you <span style={{ color: tier.color }} className="font-bold">{tier.multiplier}</span> scoring power
                {tier.name === 'Genesis OG' && ' - The ultimate achievement! 🌟'}
                {tier.name === 'VIRGEN' && ' - Your journey starts here! 🚀'}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 추가 설명 섹션 */}
      <div className="mt-12 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-2 border-purple-500/30 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-purple-400 mb-4 text-center">
          🎮 How Tier Progression Works
        </h3>
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div className="text-center">
            <h4 className="font-bold text-white mb-2">💪 Natural Progression</h4>
            <p className="text-gray-300">
              Advance through consistent staking amount and holding duration. 
              Each tier has specific requirements to unlock.
            </p>
          </div>
          <div className="text-center">
            <h4 className="font-bold text-white mb-2">⚡ Phase Bonuses</h4>
            <p className="text-gray-300">
              Complete full phases with perfect conditions to get automatic 
              tier upgrades as bonus rewards.
            </p>
          </div>
          <div className="text-center">
            <h4 className="font-bold text-white mb-2">🏆 Ultimate Goal</h4>
            <p className="text-gray-300">
              Reach Genesis OG for permanent legendary status and maximum 
              x2.0 multiplier benefits across all future content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TierSystemOverview;