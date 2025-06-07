// components/StakeHowToPage.jsx - 리팩토링된 메인 컨테이너
import React, { useState, useEffect, useRef } from 'react';

// 새로 분리된 컴포넌트들 import
import EvolutionJourney from './howto/EvolutionJourney';
import TierSystemOverview from './howto/TierSystemOverview';
import StakingLevels from './howto/StakingLevels';
import HybridSystem from './howto/HybridSystem';

// 기존 컴포넌트들 import
import CompleteTimeline from './howto/CompleteTimeline';
import PhaseParticipation from './howto/PhaseParticipation';
import ClaimStrategies from './howto/ClaimStrategies';
import NFTSection from './howto/NFTSection';

const StakeHowToPage = () => {
  const [activeSection, setActiveSection] = useState('evolution');
  const [isVisible, setIsVisible] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // 자동 스크롤 함수 (고정 상단바 고려)
  const scrollToContent = () => {
    if (contentRef.current) {
      const headerHeight = 80; // 상단바 높이 (필요에 따라 조정)
      const elementPosition = contentRef.current.offsetTop - headerHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  // 섹션 정의
  const sections = [
    {
      id: 'evolution',
      title: '🔥 Evolution Journey - Complete 8 Tiers & Earn 50,000 stSTAKE!',
      isEvent: true
    },
    {
      id: 'tiers',
      title: 'Complete Tier System Overview - All 8 Grades Explained',
      isEvent: false
    },
    {
      id: 'levels',
      title: 'Staking Levels - Entry to Special Tier Guide',
      isEvent: false
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
      id: 'nft',
      title: 'NFT & Future Utility - Your Permanent Legacy',
      isEvent: false
    }
  ];

  // 컨텐츠 렌더링 함수
  const renderContent = () => {
    switch (activeSection) {
      case 'evolution':
        return <EvolutionJourney />;
      case 'tiers':
        return <TierSystemOverview />;
      case 'levels':
        return <StakingLevels />;
      case 'hybrid':
        return <HybridSystem />;
      case 'timeline':
        return <CompleteTimeline />;
      case 'participation':
        return <PhaseParticipation />;
      case 'strategies':
        return <ClaimStrategies />;
      case 'nft':
        return <NFTSection />;
      default:
        return <EvolutionJourney />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
     {/* Hero Section */}
<div className="relative px-4 py-16 text-center">
  <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
    
    {/* 🔕 GEN 강조된 메인 타이틀 - 주석처리
    <h1 className="text-6xl md:text-8xl font-black mb-8">
      <span className="bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400 bg-clip-text text-transparent">
        VIR
      </span>
      <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-400 bg-clip-text text-transparent">
        GEN
      </span>
      <span className="bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400 bg-clip-text text-transparent mx-4">
        →
      </span>
      <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-400 bg-clip-text text-transparent">
        GEN
      </span>
      <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
        ESIS
      </span>
      <span className="bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent ml-2">
        OG
      </span>
    </h1>
    */}
    
    {/* 🔕 서브타이틀 with 연결고리 강조 - 주석처리
    <div className="mb-8 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 max-w-4xl mx-auto">
      <p className="text-xl md:text-2xl text-emerald-400 font-bold mb-2">
        🔗 The Hidden Evolution Pattern
      </p>
      <p className="text-lg text-gray-300 leading-relaxed">
        From the moment you become a <span className="text-white font-bold">VIR<span className="text-emerald-400 bg-emerald-500/20 px-1 rounded">GEN</span></span>, 
        the seed of <span className="text-emerald-300 font-bold"><span className="text-emerald-400 bg-emerald-500/20 px-1 rounded">GEN</span>ESIS</span> already lives within you
      </p>
    </div>
    */}
    
    {/* 🔕 기본 설명 문구 - 주석처리
    <p className="text-2xl md:text-3xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
      Master the complete STAKE evolution system and earn rewards along the way
    </p>
    */}
  </div>
</div>

      {/* Accordion Navigation */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 pb-16">
        <div className="space-y-2 mb-8">
          {sections.map((section) => (
            <div key={section.id} className="border border-gray-600/30 rounded-lg overflow-hidden">
              <button
                onClick={() => {
                  const newSection = activeSection === section.id ? '' : section.id;
                  setActiveSection(newSection);
                  if (newSection) {
                    setTimeout(() => scrollToContent(), 100); // 약간의 딜레이 후 스크롤
                  }
                }}
                className="w-full flex items-center justify-between p-3 sm:p-4 bg-gray-800/30 hover:bg-gray-700/30 transition-all duration-200 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">
                    {activeSection === section.id ? '▼' : '▶'}
                  </span>
                  <span className="text-white font-bold text-sm sm:text-base">{section.title}</span>
                  {section.isEvent && (
                    <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs font-bold ml-2">
                      EVENT
                    </span>
                  )}
                </div>
                <span className="text-gray-500 text-sm">#</span>
              </button>
              
              {activeSection === section.id && (
                <div ref={contentRef} className="border-t border-gray-600/30 bg-gray-900/20 p-3 sm:p-6">
                  {renderContent()}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-gray-800/20 to-gray-900/20 rounded-2xl border border-gray-600/20">
          <h3 className="text-xl font-bold text-white mb-4">
            🚀 Ready to Start Your Evolution?
          </h3>
          <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Whether you're a complete beginner (VIRGEN) or aiming for legendary status (GENESIS OG), 
            your STAKE journey begins with a single step. Choose your path and start building your legacy today!
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
            <div className="bg-green-500/10 text-green-400 px-4 py-2 rounded-full border border-green-500/30">
              💪 8 Tiers Available
            </div>
            <div className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full border border-blue-500/30">
              ⚡ 2 Upgrade Paths
            </div>
            <div className="bg-purple-500/10 text-purple-400 px-4 py-2 rounded-full border border-purple-500/30">
              🎯 6 Phase System
            </div>
            <div className="bg-orange-500/10 text-orange-400 px-4 py-2 rounded-full border border-orange-500/30">
              🏆 Max x2.0 Multiplier
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakeHowToPage;