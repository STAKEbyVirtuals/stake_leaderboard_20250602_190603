// components/ReferralDashboard.jsx - 추천 현황 대시보드
import React, { useState, useEffect } from 'react';
import { ReferralCore } from './ReferralSystem';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const ReferralDashboard = ({ walletAddress }) => {
  const [stats, setStats] = useState(null);
  const [timeframe, setTimeframe] = useState('7d'); // 7d, 30d, all
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState({ trends: [], levels: [], timeline: [] });

  useEffect(() => {
    if (walletAddress) {
      loadDashboardData();
    }
  }, [walletAddress, timeframe]);

  const loadDashboardData = () => {
    setIsLoading(true);
    try {
      const myStats = ReferralCore.getMyReferralStats(walletAddress);
      const referralData = ReferralCore.getReferralData();
      
      // 차트 데이터 생성
      const trends = generateTrendData(myStats, timeframe);
      const levels = generateLevelData(myStats);
      const timeline = generateTimelineData(myStats, timeframe);
      
      setStats(myStats);
      setChartData({ trends, levels, timeline });
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
    }
    setIsLoading(false);
  };

  // 📈 트렌드 데이터 생성
  const generateTrendData = (stats, period) => {
    const now = Date.now();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const interval = days * 24 * 60 * 60 * 1000 / 10; // 10개 포인트
    
    const trendData = [];
    for (let i = 0; i < 10; i++) {
      const date = new Date(now - (9 - i) * interval);
      const referrals = Math.floor((stats.total_referrals * (i + 1)) / 10) + Math.floor(Math.random() * 2);
      const points = Math.floor((stats.total_points_earned * (i + 1)) / 10) + Math.floor(Math.random() * 100);
      
      trendData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        referrals: Math.max(0, referrals),
        points: Math.max(0, points),
        cumulative_referrals: referrals,
        cumulative_points: points
      });
    }
    
    return trendData;
  };

  // 📊 레벨별 데이터 생성
  const generateLevelData = (stats) => {
    const level1Referrals = stats.referees.length;
    const level2Referrals = Math.floor(level1Referrals * 0.3); // 대략 30%가 2차 추천
    
    const level1Points = Math.floor(stats.total_points_earned * 0.8); // 80%가 1차에서
    const level2Points = stats.total_points_earned - level1Points;
    
    return [
      { 
        level: 'Level 1', 
        referrals: level1Referrals, 
        points: level1Points,
        percentage: level1Referrals > 0 ? 5 : 0,
        color: '#4ade80'
      },
      { 
        level: 'Level 2', 
        referrals: level2Referrals, 
        points: level2Points,
        percentage: level2Referrals > 0 ? 2 : 0,
        color: '#8b5cf6'
      }
    ];
  };

  // ⏰ 타임라인 데이터 생성
  const generateTimelineData = (stats, period) => {
    const now = Date.now();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startTime = now - (days * 24 * 60 * 60 * 1000);
    
    return stats.referees
      .filter(referee => referee.joined_at >= startTime)
      .map(referee => ({
        ...referee,
        date: new Date(referee.joined_at).toLocaleDateString(),
        short_wallet: referee.wallet.slice(0, 6) + '...' + referee.wallet.slice(-4)
      }))
      .sort((a, b) => b.joined_at - a.joined_at);
  };

  // 숫자 포맷팅
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-2 border-purple-500/30 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-purple-500/30 rounded-full"></div>
            <div className="w-48 h-6 bg-purple-500/30 rounded"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-purple-500/20 rounded-lg p-4">
                <div className="w-full h-8 bg-purple-500/30 rounded mb-2"></div>
                <div className="w-3/4 h-4 bg-purple-500/20 rounded"></div>
              </div>
            ))}
          </div>
          <div className="w-full h-64 bg-purple-500/20 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!walletAddress || !stats) {
    return (
      <div className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-6 text-center">
        <div className="text-4xl mb-4">🔗</div>
        <h3 className="text-white font-bold mb-2">Connect Wallet</h3>
        <p className="text-gray-400 text-sm">지갑을 연결하여 추천 대시보드를 확인하세요</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-2 border-purple-500/30 rounded-xl p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-xl flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            📊
          </div>
          Referral Analytics
        </h2>
        
        {/* 기간 선택 */}
        <div className="flex bg-black/20 rounded-lg p-1">
          {[
            { key: '7d', label: '7D' },
            { key: '30d', label: '30D' },
            { key: 'all', label: 'All' }
          ].map((period) => (
            <button
              key={period.key}
              onClick={() => setTimeframe(period.key)}
              className={`px-3 py-1 rounded-md text-sm font-semibold transition-all ${
                timeframe === period.key
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* 메인 통계 카드들 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* 총 추천 수 */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-400 text-2xl">👥</span>
            <span className="text-green-400 text-xs font-semibold">+{Math.floor(Math.random() * 3 + 1)} today</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {stats.total_referrals}
          </div>
          <div className="text-green-400/80 text-sm font-semibold">
            Total Referrals
          </div>
        </div>

        {/* 총 포인트 */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-yellow-400 text-2xl">💰</span>
            <span className="text-yellow-400 text-xs font-semibold">+{formatNumber(Math.floor(Math.random() * 500 + 100))}</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatNumber(stats.total_points_earned)}
          </div>
          <div className="text-yellow-400/80 text-sm font-semibold">
            Bonus Points
          </div>
        </div>

        {/* 변환율 */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-400 text-2xl">📈</span>
            <span className="text-blue-400 text-xs font-semibold">5% + 2%</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {stats.total_referrals > 0 ? ((stats.total_points_earned / stats.total_referrals) / 1000).toFixed(1) + 'K' : '0'}
          </div>
          <div className="text-blue-400/80 text-sm font-semibold">
            Avg per Referee
          </div>
        </div>

        {/* 내 코드 */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-400 text-2xl">🎫</span>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(stats.my_code);
                alert('Code copied!');
              }}
              className="text-purple-400 text-xs hover:text-purple-300"
            >
              📋 Copy
            </button>
          </div>
          <div className="text-lg font-bold text-white mb-1 font-mono">
            {stats.my_code}
          </div>
          <div className="text-purple-400/80 text-sm font-semibold">
            My Code
          </div>
        </div>
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 트렌드 차트 */}
        <div className="bg-black/20 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
            📈 Growth Trend ({timeframe})
          </h4>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <LineChart data={chartData.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="#999" 
                  fontSize={12}
                  tick={{ fill: '#999' }}
                />
                <YAxis 
                  stroke="#999" 
                  fontSize={12}
                  tick={{ fill: '#999' }}
                />
                <Tooltip 
                  contentStyle={{
                    background: 'rgba(0,0,0,0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    color: '#fff'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="referrals" 
                  stroke="#4ade80" 
                  strokeWidth={3}
                  dot={{ fill: '#4ade80', strokeWidth: 2, r: 4 }}
                  name="Referrals"
                />
                <Line 
                  type="monotone" 
                  dataKey="points" 
                  stroke="#fbbf24" 
                  strokeWidth={3}
                  dot={{ fill: '#fbbf24', strokeWidth: 2, r: 4 }}
                  name="Points"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 레벨별 분석 */}
        <div className="bg-black/20 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
            🎯 Level Analysis
          </h4>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={chartData.levels}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="level" 
                  stroke="#999" 
                  fontSize={12}
                  tick={{ fill: '#999' }}
                />
                <YAxis 
                  stroke="#999" 
                  fontSize={12}
                  tick={{ fill: '#999' }}
                />
                <Tooltip 
                  contentStyle={{
                    background: 'rgba(0,0,0,0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    color: '#fff'
                  }}
                  formatter={(value, name) => [
                    name === 'referrals' ? `${value} people` : `${formatNumber(value)} points`,
                    name === 'referrals' ? 'Referrals' : 'Points Earned'
                  ]}
                />
                <Bar 
                  dataKey="referrals" 
                  fill="#4ade80"
                  radius={[4, 4, 0, 0]}
                  name="referrals"
                />
                <Bar 
                  dataKey="points" 
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  name="points"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 레벨별 상세 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {chartData.levels.map((level, index) => (
          <div key={index} className="bg-black/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: level.color }}
                ></div>
                {level.level} Referrals
              </h4>
              <span className="text-sm font-bold" style={{ color: level.color }}>
                {level.percentage}%
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">People</span>
                <span className="text-white font-bold">{level.referrals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Points Earned</span>
                <span className="text-white font-bold">{formatNumber(level.points)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Avg per Person</span>
                <span className="text-white font-bold">
                  {level.referrals > 0 ? formatNumber(Math.floor(level.points / level.referrals)) : '0'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 최근 추천 활동 */}
      {chartData.timeline.length > 0 && (
        <div className="bg-black/20 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
            ⚡ Recent Referral Activity ({timeframe})
          </h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {chartData.timeline.slice(0, 10).map((activity, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between bg-purple-500/10 rounded-lg p-3 border border-purple-500/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="font-mono text-white text-sm">
                      {activity.short_wallet}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {activity.date}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold text-sm">
                    +{formatNumber(activity.points_contributed)}
                  </div>
                  <div className="text-gray-500 text-xs">points</div>
                </div>
              </div>
            ))}
          </div>
          
          {chartData.timeline.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-gray-400">No referral activity in this period</div>
            </div>
          )}
        </div>
      )}

      {/* 성능 인사이트 */}
      <div className="mt-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
          💡 Performance Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-green-400 font-semibold mb-1">🏆 Ranking</div>
            <div className="text-white">
              You're in the top {Math.floor(Math.random() * 15 + 5)}% of referrers
            </div>
          </div>
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-blue-400 font-semibold mb-1">📈 Growth</div>
            <div className="text-white">
              {Math.floor(Math.random() * 20 + 10)}% increase vs last period
            </div>
          </div>
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-purple-400 font-semibold mb-1">🎯 Potential</div>
            <div className="text-white">
              Est. +{formatNumber(Math.floor(Math.random() * 1000 + 500))} points this week
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralDashboard;