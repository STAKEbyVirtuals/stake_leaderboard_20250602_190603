// components/howto/PhaseParticipation.jsx
import React from 'react';
import { PHASE_PARTICIPATION_RULES, PHASE_PARTICIPATION_FLOW } from '../../data/howtoData';

const PhaseParticipation = () => {
  return (
    <div className="px-4 pb-16">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-black text-center text-white mb-12">
          ⚡ Phase Participation System
        </h2>
        
        <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border-4 border-red-500/50 rounded-3xl p-8 mb-12">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-3xl font-black text-red-400 mb-4">
              Critical: Manual Participation Required
            </h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              You MUST click the "Join Phase" button at the start of each phase. 
              Auto-participation is absolutely impossible!
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {PHASE_PARTICIPATION_RULES.map((rule, index) => (
              <div
                key={index}
                className={`
                  rounded-xl p-6 border-2
                  ${rule.importance === 'critical' 
                    ? 'bg-red-900/20 border-red-500/40' 
                    : 'bg-orange-900/20 border-orange-500/40'}
                `}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{rule.icon}</div>
                  <div>
                    <h4 className={`
                      text-lg font-bold mb-2
                      ${rule.importance === 'critical' ? 'text-red-400' : 'text-orange-400'}
                    `}>
                      {rule.rule}
                    </h4>
                    <p className="text-gray-300 leading-relaxed">
                      {rule.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 참가 플로우 */}
        <div className="bg-gray-800/30 border-2 border-gray-600/30 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-center text-white mb-8">
            🔄 Phase Participation Flow
          </h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            {PHASE_PARTICIPATION_FLOW.map((flow, index) => (
              <div key={index} className="text-center relative">
                <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{flow.icon}</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">
                  {flow.step}. {flow.title}
                </h4>
                <p className="text-sm text-gray-400">
                  {flow.desc}
                </p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-6 text-emerald-400 text-xl transform -translate-x-1/2">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhaseParticipation;