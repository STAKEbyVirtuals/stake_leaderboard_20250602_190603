// components/howto/HybridSystem.jsx
import React from 'react';
import { HYBRID_TIER_SYSTEM } from '../../data/tierData';

const HybridSystem = () => {
  return (
    <div className="space-y-6 sm:space-y-8 px-1 sm:px-0">
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 px-2">Hybrid Tier Upgrade System</h2>
      
      <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-4 border-blue-500/50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 mb-8 sm:mb-12">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⚡</div>
          <h3 className="text-2xl sm:text-3xl font-black text-blue-400 mb-4">
            Two Paths to Tier Advancement
          </h3>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto px-2">
            Upgrade your tier through traditional requirements OR phase completion rewards. 
            Whichever path is faster applies first!
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 px-1 sm:px-0">
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
};

export default HybridSystem;