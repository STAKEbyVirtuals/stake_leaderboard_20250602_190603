// components/howto/CompleteTimeline.jsx
import React from 'react';
import { COMPLETE_TIMELINE } from '../../data/howtoData';

const CompleteTimeline = () => {
  return (
    <div className="px-4 pb-16">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-black text-center text-white mb-12">
          📅 Complete Project Timeline
        </h2>
        
        {/* 페이즈 타임라인 */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center text-emerald-400 mb-8">
            🎯 6-Phase Staking Schedule
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {COMPLETE_TIMELINE.phases.map((phase, index) => (
              <div
                key={phase.phase}
                className={`
                  rounded-2xl p-6 border-2 transition-all duration-300
                  ${phase.status === 'current' 
                    ? 'bg-emerald-900/30 border-emerald-500/50 ring-2 ring-emerald-500/30' 
                    : 'bg-gray-800/30 border-gray-600/30 hover:border-gray-500/50'}
                `}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`
                    text-2xl font-black
                    ${phase.status === 'current' ? 'text-emerald-400' : 'text-gray-400'}
                  `}>
                    Phase {phase.phase}
                  </span>
                  {phase.status === 'current' && (
                    <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-400">Staking Period:</span>
                    <div className="text-white font-bold">{phase.staking}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Snapshot:</span>
                    <div className="text-white font-bold">{phase.snapshot}</div>
                  </div>
                </div>
                
                {phase.status === 'current' && (
                  <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                    <div className="text-xs text-emerald-400 font-bold">
                      🔥 Active Phase - Join Now!
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 베스팅 & 분배 일정 */}
        <div>
          <h3 className="text-2xl font-bold text-center text-orange-400 mb-8">
            💰 Token Unlock & Distribution Schedule
          </h3>
          
          <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-2 border-orange-500/30 rounded-3xl p-8">
            <div className="text-center mb-8">
              <h4 className="text-xl font-bold text-orange-400 mb-4">
                📊 Monthly Vesting (6 Months)
              </h4>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Virtual Protocol unlocks tokens monthly, with actual distribution 3 days later.
              </p>
              <div className="mt-4 space-y-1">
                <div className="text-sm text-white font-bold">
                  Total Supply: 1,000,000,000 STAKE (1B)
                </div>
                <div className="text-sm text-emerald-400 font-bold">
                  Airdrop Pool: 250,000,000 STAKE (25%)
                </div>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {COMPLETE_TIMELINE.vesting.map((vest, index) => (
                <div
                  key={vest.phase}
                  className="bg-gray-800/50 rounded-xl p-6 border border-orange-500/20"
                >
                  <div className="text-center">
                    <div className="text-2xl font-black text-orange-400 mb-2">
                      Phase {vest.phase}
                    </div>
                    <div className="text-lg font-bold text-white mb-2">
                      {vest.percentage}
                    </div>
                    
                    {/* 신규 할당량 */}
                    <div className="mb-3">
                      <div className="text-xs text-gray-400 mb-1">New Release:</div>
                      <div className="text-lg font-bold text-emerald-400">
                        {vest.newTokens} STAKE
                      </div>
                    </div>
                    
                    {/* 누적 총량 */}
                    <div className="mb-4">
                      <div className="text-xs text-gray-400 mb-1">Total Released:</div>
                      <div className="text-sm font-bold text-blue-400">
                        {vest.cumulative} STAKE
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Unlock:</span>
                        <div className="text-white font-bold">{vest.unlock}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Distribution:</span>
                        <div className="text-emerald-400 font-bold">{vest.distribution}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-6 bg-orange-500/10 rounded-xl border border-orange-500/30">
              <h5 className="text-lg font-bold text-orange-400 mb-3">⏰ Distribution Timeline</h5>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Virtual Protocol Unlock:</span>
                  <div className="text-white font-bold">7th of each month (last: 7th)</div>
                </div>
                <div>
                  <span className="text-gray-400">User Distribution:</span>
                  <div className="text-emerald-400 font-bold">Unlock +3 days</div>
                </div>
                <div>
                  <span className="text-gray-400">Preparation Period:</span>
                  <div className="text-white font-bold">Review & setup time</div>
                </div>
                <div>
                  <span className="text-gray-400">Total Duration:</span>
                  <div className="text-white font-bold">6 months (2025.12 ~ 2026.05)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteTimeline;