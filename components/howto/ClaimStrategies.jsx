// components/howto/ClaimStrategies.jsx
import React from 'react';
import { CLAIM_STRATEGIES } from '../../data/howtoData';

const ClaimStrategies = () => {
  return (
    <div className="space-y-6 sm:space-y-8 px-1 sm:px-0">
      <h2 className="text-2xl sm:text-4xl font-black text-center text-white mb-8 sm:mb-12 px-2">
        Claim Strategy Guide
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 px-1 sm:px-0">
        {CLAIM_STRATEGIES.map((strategy, index) => (
          <div
            key={index}
            className={`
              rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 relative overflow-hidden
              ${strategy.color === 'red' ? 'bg-red-900/20 border-red-500/40' :
                strategy.color === 'green' ? 'bg-green-900/20 border-green-500/40' :
                'bg-emerald-900/20 border-emerald-500/40'}
            `}
          >
            {/* 배경 효과 */}
            <div className={`
              absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 rounded-full blur-xl opacity-20
              ${strategy.color === 'red' ? 'bg-red-500' :
                strategy.color === 'green' ? 'bg-green-500' :
                'bg-emerald-500'}
            `} />
            
            <div className="relative z-10">
              <h3 className={`
                text-xl sm:text-2xl font-black mb-4
                ${strategy.color === 'red' ? 'text-red-400' :
                  strategy.color === 'green' ? 'text-green-400' :
                  'text-emerald-400'}
              `}>
                {strategy.strategy}
              </h3>
              
              <div className="mb-6">
                <span className="text-gray-400 text-sm">Timing:</span>
                <div className="text-white font-bold">{strategy.timing}</div>
              </div>
              
              {/* 단점 (즉시 클레임) 또는 장점 (나머지) */}
              <div className="mb-6">
                <h4 className={`
                  text-sm font-bold mb-3
                  ${strategy.type === 'warning' ? 'text-red-400' : 'text-green-400'}
                `}>
                  {strategy.type === 'warning' ? '⚠️ Why You Should Avoid This' : '🚀 Why This Path Rocks'}
                </h4>
                <ul className="space-y-2">
                  {strategy.points.map((point, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className={`mt-1 ${strategy.type === 'warning' ? 'text-red-400' : 'text-green-400'}`}>
                        {strategy.type === 'warning' ? '•' : '✓'}
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* 결과 */}
              <div className={`
                p-4 rounded-xl border text-center
                ${strategy.color === 'red' ? 'bg-red-500/10 border-red-500/30' :
                  strategy.color === 'green' ? 'bg-green-500/10 border-green-500/30' :
                  'bg-emerald-500/10 border-emerald-500/30'}
              `}>
                <span className="text-gray-400 text-xs">Result:</span>
                <div className={`
                  font-bold
                  ${strategy.color === 'red' ? 'text-red-400' :
                    strategy.color === 'green' ? 'text-green-400' :
                    'text-emerald-400'}
                `}>
                  {strategy.result}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 추가 팁 */}
      <div className="mt-8 sm:mt-12 bg-purple-900/20 border-2 border-purple-500/30 rounded-xl sm:rounded-2xl p-6 sm:p-8 mx-1 sm:mx-0">
        <h3 className="text-lg sm:text-xl font-bold text-purple-400 mb-4 text-center">
          💡 Pro Tips for Maximum Rewards
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-sm">
          <div>
            <h4 className="font-bold text-white mb-2">🎯 For Small Investors (Entry Level)</h4>
            <p className="text-gray-300">
              Continue staking through all 6 phases to reach Heavy Eater status. 
              Small beginnings can achieve elite tier through patience and persistence.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-2">🐋 For Whales (Special Level)</h4>
            <p className="text-gray-300">
              Special level from start makes Genesis OG achievement easier. 
              Target long-term strategy for maximum x2.0 multiplier benefits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimStrategies;