// components/howto/NFTSection.jsx
import React from 'react';
import { NFT_MINTING_PROCESS, NFT_FUTURE_UTILITIES } from '../../data/howtoData';

const NFTSection = () => {
  return (
    <div className="space-y-6 sm:space-y-8 px-1 sm:px-0">
      <h3 className="text-xl sm:text-2xl font-bold text-center text-purple-400 mb-6 sm:mb-8 px-2">
        🎨 Final Grade NFT & Future Utility
      </h3>
      
      <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-2 border-purple-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-8 mx-1 sm:mx-0">
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-4xl sm:text-6xl mb-4">🎯</div>
          <h4 className="text-xl sm:text-2xl font-bold text-purple-400 mb-4">
            Permanent Grade NFT Minting
          </h4>
          <p className="text-gray-300 max-w-3xl mx-auto text-base sm:text-lg px-2">
            After all phases complete, your final confirmed grade will be minted as an NFT. 
            This will be a powerful card utilized across all future STAKE Foundation content.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* NFT 발행 프로세스 */}
          <div className="bg-gray-800/30 border border-purple-500/20 rounded-xl p-4 sm:p-6">
            <h5 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
              🖼️ NFT Minting Process
            </h5>
            
            <div className="space-y-4">
              {NFT_MINTING_PROCESS.map((item, index) => (
                <div key={index} className="flex items-start gap-3 sm:gap-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500/20 border border-purple-500/50 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-purple-400 flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">{item.title}</div>
                    <div className="text-gray-400 text-xs">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 미래 유틸리티 */}
          <div className="bg-gray-800/30 border border-purple-500/20 rounded-xl p-4 sm:p-6">
            <h5 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
              🚀 Future Utility & Benefits
            </h5>
            
            <div className="space-y-3">
              {NFT_FUTURE_UTILITIES.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <div>
                    <div className="text-white font-bold text-sm">{item.title}</div>
                    <div className="text-gray-400 text-xs">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 특별 강조 */}
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-xl">
          <div className="text-center">
            <h5 className="text-lg sm:text-xl font-bold text-purple-400 mb-3">
              🌟 Your Journey Becomes Permanent Legacy
            </h5>
            <p className="text-gray-300 leading-relaxed text-sm sm:text-base px-2">
              This NFT represents your complete STAKE journey - from your starting point to your final achievement. 
              Whether you reach Genesis OG or Heavy Eater, your grade NFT will be a permanent badge of honor 
              that unlocks exclusive benefits across the entire STAKE ecosystem for years to come.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTSection;