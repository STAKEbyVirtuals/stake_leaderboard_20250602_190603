"use client";
import { useEffect, useState } from "react";
import React from "react";
import { treemap, hierarchy } from "d3-hierarchy";
import axios from "axios";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Image from 'next/image';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from 'recharts';
import StakeHowToPage from '../components/StakeHowToPage';

// JSON API URL (구글시트 or GitHub JSON)
const SHEET_BEST_URL = '/leaderboard.json';

// 1. 실제 STAKE 프로젝트 페이즈 일정 (파일 상단에 추가)
const PHASE_SCHEDULE = {
  PHASE_1_END: new Date('2025-06-30T23:59:59Z'),
  PHASE_2_START: new Date('2025-07-01T00:00:00Z'),
  PHASE_3_START: new Date('2025-08-01T00:00:00Z'),
  PHASE_4_START: new Date('2025-09-01T00:00:00Z'),
  PHASE_5_START: new Date('2025-10-01T00:00:00Z'),
  PHASE_6_START: new Date('2025-11-01T00:00:00Z'),
};

// --- 유틸리티 및 타입 ---
const tierColors: Record<string, string> = {
  "Genesis OG": "#10b981",        // 민트
  "Heavy Eater": "#ef4444",       // 레전드 빨강 (기존 Smoke Flexer 대신)
  "Steak Wizard": "#fbbf24",      // 유니크 노랑
  "Grilluminati": "#9333ea",      // 에픽 보라
  "Flame Juggler": "#3b82f6",     // 레어 파랑
  "Flipstarter": "#22c55e",       // 언커먼 초록
  "Sizzlin' Noob": "#9ca3af",     // 노말 회색흰색
  "Jeeted": "#1e1e1e",            // 리타이어 검은색
};

// 실시간 포인트 변화 훅 (이전값 추적)
function useRealTimePointsWithHistory(initialPoints: number) {
  const [points, setPoints] = useState(initialPoints);
  const [prevPoints, setPrevPoints] = useState(initialPoints);
  const [isIncreasing, setIsIncreasing] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setPoints(prev => {
        setPrevPoints(prev); // 이전값 저장
        const change = Math.floor(Math.random() * 1000) + 1;
        const shouldIncrease = Math.random() > 0.3;
        setIsIncreasing(shouldIncrease);
        return shouldIncrease ? prev + change : Math.max(0, prev - change);
      });
    }, 2000 + Math.random() * 3000);

    return () => clearInterval(interval);
  }, []);

  return { points, prevPoints, isIncreasing };
}

// 롤링 숫자 컴포넌트
function RollingNumber({ value, prevValue, fontSize = 10 }: { 
  value: number; 
  prevValue: number; 
  fontSize?: number; 
}) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  };

  const currentStr = formatNumber(value);
  const prevStr = formatNumber(prevValue || value);
  
  // 문자열을 개별 문자로 분할
  const renderDigit = (char: string, index: number, isChanged: boolean) => {
    return (
      <div key={`${index}-${char}`} style={{
        position: 'relative',
        display: 'inline-block',
        overflow: 'hidden',
        height: `${fontSize}px`,
        width: char === '.' ? `${fontSize * 0.3}px` : `${fontSize * 0.6}px`,
        fontSize: `${fontSize}px`,
        fontFamily: 'monospace',
        fontWeight: 600
      }}>
        <div style={{
          position: 'absolute',
          transition: isChanged ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          transform: isChanged ? `translateY(-${fontSize}px)` : 'translateY(0)',
          color: '#fff'
        }}>
          <div style={{ height: `${fontSize}px`, lineHeight: `${fontSize}px` }}>
            {prevStr[index] || '0'}
          </div>
          <div style={{ height: `${fontSize}px`, lineHeight: `${fontSize}px` }}>
            {char}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      height: `${fontSize}px`,
      overflow: 'hidden'
    }}>
      {currentStr.split('').map((char, index) => {
        const isChanged = prevStr[index] !== char;
        return renderDigit(char, index, isChanged);
      })}
    </div>
  );
}

// 실시간 포인트 표시 컴포넌트
function RealTimePoints({ initialPoints, size, isMobile }: { 
  initialPoints: number; 
  size: 'large' | 'medium' | 'small' | 'tiny';
  isMobile: boolean;
}) {
  const { points, prevPoints, isIncreasing } = useRealTimePointsWithHistory(initialPoints);
  
  if (size === 'tiny') return null;
  
  const fontSize = isMobile ? 
    (size === 'large' ? 9 : size === 'medium' ? 8 : 7) :
    (size === 'large' ? 11 : size === 'medium' ? 10 : 8);

  return (
    <div style={{
      position: 'absolute',
      bottom: isMobile ? 3 : (size === 'large' ? 40 : size === 'medium' ? 28 : 20),
      right: isMobile ? 3 : (size === 'large' ? 8 : 6),
      background: 'rgba(0,0,0,0.8)',
      borderRadius: isMobile ? 4 : 6,
      padding: isMobile ? '2px 4px' : (size === 'large' ? '4px 8px' : '3px 6px'),
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? 2 : 4,
      backdropFilter: 'blur(4px)',
      border: '1px solid rgba(255,255,255,0.1)',
      zIndex: 3,
      minHeight: `${fontSize + (isMobile ? 4 : 6)}px`
    }}>
      {/* 상승/하락 표시 */}
      <div style={{
        fontSize: fontSize - 1,
        color: isIncreasing ? '#4ade80' : '#ef4444',
        lineHeight: 1,
        opacity: 0.8
      }}>
        {isIncreasing ? '↗' : '↘'}
      </div>
      
      {/* 롤링 숫자 */}
      <RollingNumber 
        value={points} 
        prevValue={prevPoints}
        fontSize={fontSize}
      />
    </div>
  );
}


// 숫자 포맷팅 함수들
function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K';
  }
  return num.toLocaleString();
}


function formatNumberChange(baseNum: number, changePercent: number): { value: string; isPositive: boolean } {
  const changeAmount = (baseNum * changePercent) / 100;
  const isPositive = changeAmount >= 0;
  const formattedChange = formatLargeNumber(Math.abs(changeAmount));
  return {
    value: (isPositive ? '+' : '-') + formattedChange,
    isPositive
  };
}

// 3. 등급 이미지 경로 함수 추가 (기존 getGradeImagePath 찾아서 교체)
function getGradeImagePath(grade: string): string {
  const gradeImages: Record<string, string> = {
    "Genesis OG": "/images/grades/genesis-og.png",
    "Heavy Eater": "/images/grades/heavy-eater.png",  // 새로운!
    "Steak Wizard": "/images/grades/steak-wizard.png",
    "Grilluminati": "/images/grades/grilluminati.png",
    "Flame Juggler": "/images/grades/flame-juggler.png",
    "Flipstarter": "/images/grades/flipstarter.png",
    "Sizzlin' Noob": "/images/grades/sizzlin-noob.png",
    "Jeeted": "/images/grades/jeeted.png"
  };
  return gradeImages[grade] || "/images/grades/default.png";
}

// Next.js Image 최적화 아바타 컴포넌트
function OptimizedGradeAvatar({ 
  grade, 
  isMobile
}: { 
  grade: string; 
  isMobile: boolean;
}) {
  const [imageError, setImageError] = useState(false);
  const size = isMobile ? 36 : 42;

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 8,
      background: `linear-gradient(135deg, ${tierColors[grade] || "#475569"}, ${tierColors[grade] || "#475569"}88)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "2px solid rgba(255,255,255,0.1)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* 배경 패턴 효과 */}
      <div style={{
        position: "absolute",
        top: -10,
        right: -10,
        width: 20,
        height: 20,
        background: "rgba(255,255,255,0.1)",
        borderRadius: "50%",
        opacity: 0.6
      }} />
      <div style={{
        position: "absolute",
        bottom: -5,
        left: -5,
        width: 15,
        height: 15,
        background: "rgba(255,255,255,0.05)",
        borderRadius: "50%"
      }} />
      
      {/* Next.js 최적화 이미지 */}
      {!imageError && typeof window !== 'undefined' && (
        <img
          src={getGradeImagePath(grade)}
          alt={grade}
          width={size}
          height={size}
          style={{
            borderRadius: 6,
            objectFit: "cover",
            width: "100%",
            height: "100%"
          }}
          loading="lazy"
          onError={() => setImageError(true)}
        />
      )}
      
      {/* 백업 아바타 (이미지 실패 시 또는 SSR) */}
      {(imageError || typeof window === 'undefined') && (
        <span style={{ 
          fontSize: isMobile ? 18 : 22,
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
          zIndex: 1
        }}>
          {getGradeAvatar(grade)}
        </span>
      )}
    </div>
  );
}

// 타입 정의
interface LeaderboardItem {
  name: string;
  value: number;
  tier: string;
  change: string;
  score: number;
  time: string;
  rank: number;
  total_staked: number;
  grade: string;
  percentile: number;
  address: string;
  stake_count: number;
  holding_days: number;
}

// d3 treemap 레이아웃
function useTreemapLayout(data: LeaderboardItem[], width: number, height: number) {
  if (!data || data.length === 0) return [];
  const root = hierarchy({ children: data } as any)
    .sum((d: any) => d.value)
    .sort((a, b) => (b.value as number) - (a.value as number));
  treemap().size([width, height]).paddingInner(2).paddingOuter(3)(root);
  return root.leaves();
}

// --- 유틸 함수 ---
function getRankBadge(rank: number) {
  if (rank === 1) return "👑";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  if (rank <= 10) return `🔥`;
  return "⭐";
}
function getGradeAvatar(grade: string) {
  const avatars: Record<string, string> = {
    "Genesis OG": "🌌",
    "Smoke Flexer": "💨",
    "Steak Wizard": "🧙",
    "Grilluminati": "👁️",
    "Flame Juggler": "🔥",
    "Flipstarter": "🥩",
    "Sizzlin' Noob": "🆕",
    "Jeeted": "💀"
  };
  return avatars[grade] || "❓";
}

// TreemapBox 컴포넌트 - pages/index.tsx에서 기존 TreemapBox 함수를 이것으로 교체하세요!

// 📍 pages/index.tsx에서 기존 TreemapBox 함수를 이 전체 코드로 교체하세요!

// 박스 크기 계산 유틸리티 (기준값 조정)
function getBoxSize(width: number, height: number): 'large' | 'medium' | 'small' | 'tiny' {
  const area = width * height;
  if (area > 20000) return 'large';   // 기준 상향 조정
  if (area > 12000) return 'medium';  // 기준 상향 조정
  if (area > 5000) return 'small';    // 기준 상향 조정
  return 'tiny';
}

// 등급별 색상 매핑 (더 세련되게)
const gradeColorMap: Record<string, string> = {
  "Genesis OG": "rgba(74,222,128,0.12)",
  "Heavy Eater": "rgba(239,68,68,0.12)",
  "Steak Wizard": "rgba(251,191,36,0.12)",
  "Grilluminati": "rgba(147,51,234,0.12)",
  "Flame Juggler": "rgba(59,130,246,0.12)",
  "Flipstarter": "rgba(34,197,94,0.12)",
  "Sizzlin' Noob": "rgba(107,114,128,0.12)",
  "Jeeted": "rgba(107,114,128,0.12)",
};

const gradeTextColor: Record<string, string> = {
  "Genesis OG": "#4ade80",
  "Heavy Eater": "#ef4444", 
  "Steak Wizard": "#fbbf24",
  "Grilluminati": "#9333ea",
  "Flame Juggler": "#3b82f6",
  "Flipstarter": "#22c55e",
  "Sizzlin' Noob": "#9ca3af",
  "Jeeted": "#6b7280",
};

// 등급 이모지 매핑
const gradeEmoji: Record<string, string> = {
  "Genesis OG": "🌌",
  "Heavy Eater": "💨", 
  "Steak Wizard": "🧙",
  "Grilluminati": "👁️",
  "Flame Juggler": "🔥",
  "Flipstarter": "🥩",
  "Sizzlin' Noob": "🆕",
  "Jeeted": "💀",
};

// 더미 차트 데이터 생성 (버그 수정)
function generateChartData(seed: string): { path: string; isPositive: boolean } {
  const hash = seed.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const points: number[] = [];
  let currentValue = 50;
  
  for (let i = 0; i < 6; i++) { // 포인트 수 줄임
    const randomValue = ((Math.abs(hash + i * 1234) % 100)) / 100;
    const change = (randomValue - 0.5) * 25;
    currentValue = Math.max(20, Math.min(80, currentValue + change));
    points.push(currentValue);
  }
  
  const trend = points[points.length - 1] - points[0];
  const isPositive = trend > 0;
  
  return { path: generateSVGPath(points, 32, 16), isPositive }; // 크기 고정
}

// SVG 패스 생성 (버그 수정)
function generateSVGPath(points: number[], width: number = 32, height: number = 16): string {
  if (points.length < 2) return '';
  
  const stepX = width / (points.length - 1);
  const minY = Math.min(...points);
  const maxY = Math.max(...points);
  const range = maxY - minY || 1;
  
  const pathPoints = points.map((point, index) => {
    const x = index * stepX;
    const y = height - ((point - minY) / range) * (height * 0.7) - (height * 0.15);
    return index === 0 ? `M${x.toFixed(1)},${y.toFixed(1)}` : `L${x.toFixed(1)},${y.toFixed(1)}`;
  });
  
  return pathPoints.join(' ');
}

// 순위 인디케이터 컴포넌트 (더 세련되게)
function RankIndicator({ rank, size }: { rank: number; size: 'large' | 'medium' | 'small' | 'tiny' }) {
  if (size === 'tiny' || size === 'small') return null;
  
  const getRankStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      top: 2,
      left: 2,
      width: 14,
      height: 14,
      borderRadius: '0 0 8px 0',
      opacity: 0.85,
      zIndex: 3,
    };
    
    if (rank === 1) {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffc107 100%)',
        boxShadow: '0 0 8px rgba(255,215,0,0.4), 0 0 16px rgba(255,215,0,0.2)',
        animation: 'goldGlow 2s ease-in-out infinite',
      };
    } else if (rank === 2) {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #e8e8e8 0%, #c0c0c0 50%, #a8a8a8 100%)',
        boxShadow: '0 0 6px rgba(200,200,200,0.4), 0 0 12px rgba(200,200,200,0.2)',
        animation: 'silverGlow 2.2s ease-in-out infinite',
      };
    } else if (rank === 3) {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #cd7f32 0%, #b8860b 50%, #a0522d 100%)',
        boxShadow: '0 0 6px rgba(205,127,50,0.4), 0 0 12px rgba(205,127,50,0.2)',
        animation: 'bronzeGlow 2.4s ease-in-out infinite',
      };
    } else {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, rgba(107,114,128,0.4), rgba(75,85,99,0.3))',
        boxShadow: '0 0 4px rgba(107,114,128,0.2)',
      };
    }
  };
  
  return <div style={getRankStyle()} />;
}

// MiniChart 컴포넌트 - isMobile props 추가
function MiniChart({ size, isPositive, isMobile }: { 
  size: 'large' | 'medium' | 'small' | 'tiny'; 
  isPositive: boolean;
  isMobile: boolean;
}) {
  if (size === 'tiny') return null;
  
  const points = Array.from({length: 6}, () => Math.random() * 100);
  const chartWidth = isMobile ? 
    (size === 'large' ? 40 : size === 'medium' ? 30 : 20) :
    (size === 'large' ? 60 : size === 'medium' ? 40 : 24);
  const chartHeight = isMobile ?
    (size === 'large' ? 20 : size === 'medium' ? 15 : 10) :
    (size === 'large' ? 30 : size === 'medium' ? 20 : 12);
  
  const path = points.map((point, index) => {
    const x = (index / (points.length - 1)) * chartWidth;
    const y = chartHeight - (point / 100) * chartHeight;
    return index === 0 ? `M${x},${y}` : `L${x},${y}`;
  }).join(' ');

  return (
    <div style={{
      position: 'absolute',
      bottom: isMobile ? 3 : (size === 'large' ? 8 : 4),
      left: isMobile ? 3 : (size === 'large' ? 8 : 4),
      zIndex: 2,
      width: chartWidth,
      height: chartHeight,
      opacity: 0.9
    }}>
      <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        <path
          d={path}
          stroke={isPositive ? '#4ade80' : '#ef4444'}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// 등급 정보 컴포넌트 (겹침 방지)
function GradeInfo({ grade, size }: { grade: string; size: 'large' | 'medium' | 'small' | 'tiny' }) {
  const getGradeDisplay = () => {
    if (size === 'large') return grade; // 전체명
    if (size === 'medium') return grade.split(' ')[0]; // 첫 단어만
    if (size === 'small') return gradeEmoji[grade] || '❓'; // 이모지만
    return null; // tiny는 숨김
  };
  
  const gradeDisplay = getGradeDisplay();
  if (!gradeDisplay) return null;
  
  const isEmoji = size === 'small';
  
  return (
    <div style={{
      position: 'absolute',
      bottom: isEmoji ? 2 : 4,
      right: isEmoji ? 4 : 6,
      background: isEmoji ? 'none' : 'rgba(0,0,0,0.3)',
      padding: isEmoji ? '0' : '2px 6px',
      borderRadius: isEmoji ? 0 : 4,
      backdropFilter: isEmoji ? 'none' : 'blur(4px)',
      border: isEmoji ? 'none' : '1px solid rgba(255,255,255,0.06)',
      fontSize: isEmoji ? 12 : (size === 'large' ? 9 : 8),
      color: isEmoji ? gradeTextColor[grade] : gradeTextColor[grade] || '#9ca3af',
      zIndex: 2,
      lineHeight: 1,
    }}>
      {gradeDisplay}
    </div>
  );
}

// TreemapBox 컴포넌트 - pages/index.tsx에서 기존 TreemapBox 함수를 이것으로 교체하세요
function TreemapBox({ item, x, y, width, height, onClick, isMobile }: {
  item: LeaderboardItem;
  x: number; 
  y: number; 
  width: number; 
  height: number; 
  onClick: () => void;
  isMobile: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  const getBoxSize = () => {
    const area = width * height;
    if (area > (isMobile ? 15000 : 25000)) return 'large';
    if (area > (isMobile ? 8000 : 15000)) return 'medium'; 
    if (area > (isMobile ? 3000 : 6000)) return 'small';
    return 'tiny';
  };

  const size = getBoxSize();
  const gradeColor = tierColors[item.grade] || '#9ca3af';
  
  // 반응형 폰트 크기
  const getFontSizes = () => {
    if (isMobile) {
      switch(size) {
        case 'large': return { percentage: 20, address: 12, rank: 18 };
        case 'medium': return { percentage: 16, address: 10, rank: 14 };
        case 'small': return { percentage: 12, address: 8, rank: 10 };
        case 'tiny': return { percentage: 10, address: 0, rank: 8 };
      }
    } else {
      switch(size) {
        case 'large': return { percentage: 28, address: 14, rank: 18 };
        case 'medium': return { percentage: 20, address: 12, rank: 14 };
        case 'small': return { percentage: 16, address: 10, rank: 10 };
        case 'tiny': return { percentage: 12, address: 0, rank: 8 };
      }
    }
  };

  const fonts = getFontSizes();
  
  // 통일된 주소 표시 (앞4자리..뒤4자리)
  const getAddressDisplay = () => {
    if (fonts.address === 0) return null;
    return item.address.slice(0, 4) + '..' + item.address.slice(-4);
  };

  const isPositive = item.change?.startsWith('+') || false;

  // 상위 3등 글로우 효과
  const getBoxGlow = () => {
    if (item.rank === 1) {
      return {
        boxShadow: '0 0 30px rgba(255,215,0,0.4), inset 0 0 0 2px rgba(255,215,0,0.3)',
        border: `2px solid rgba(255,215,0,0.5)`
      };
    } else if (item.rank === 2) {
      return {
        boxShadow: '0 0 25px rgba(192,192,192,0.4), inset 0 0 0 2px rgba(192,192,192,0.3)',
        border: `2px solid rgba(192,192,192,0.5)`
      };
    } else if (item.rank === 3) {
      return {
        boxShadow: '0 0 25px rgba(205,127,50,0.4), inset 0 0 0 2px rgba(205,127,50,0.3)',
        border: `2px solid rgba(205,127,50,0.5)`
      };
    } else {
      return {
        border: `1px solid ${gradeColor}40`
      };
    }
  };

  // 순위 배지 스타일
  const getRankBadgeStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      top: size === 'large' ? 8 : 6,
      left: size === 'large' ? 8 : 6,
      borderRadius: '50%',
      fontWeight: 900,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3,
      border: 'none',
      fontSize: fonts.rank,
      minWidth: size === 'large' ? 36 : size === 'medium' ? 28 : 20,
      height: size === 'large' ? 36 : size === 'medium' ? 28 : 20,
    };

    if (item.rank === 1) {
      return {
        ...baseStyle,
        color: '#ffd700',
        textShadow: `
          0 0 8px rgba(255,215,0,1),
          0 0 16px rgba(255,215,0,0.9),
          0 0 24px rgba(255,215,0,0.7),
          0 0 32px rgba(255,215,0,0.5),
          0 0 40px rgba(255,215,0,0.3)
        `,
        animation: 'strongGoldPulse 2s ease-in-out infinite'
      };
    } else if (item.rank === 2) {
      return {
        ...baseStyle,
        color: '#e8e8e8',
        textShadow: `
          0 0 6px rgba(232,232,232,0.9),
          0 0 12px rgba(192,192,192,0.7),
          0 0 18px rgba(192,192,192,0.5)
        `
      };
    } else if (item.rank === 3) {
      return {
        ...baseStyle,
        color: '#d4a574',
        textShadow: `
          0 0 6px rgba(212,165,116,0.9),
          0 0 12px rgba(205,127,50,0.7),
          0 0 18px rgba(205,127,50,0.5)
        `
      };
    } else {
      return {
        ...baseStyle,
        color: '#999999',
        textShadow: 'none'
      };
    }
  };

  const glowStyle = getBoxGlow();
  const rankStyle = getRankBadgeStyle();

  return (
    <>
      {/* CSS 애니메이션 추가 */}
      <style jsx>{`
        @keyframes strongGoldPulse {
          0%, 100% { 
            text-shadow: 
              0 0 8px rgba(255,215,0,1),
              0 0 16px rgba(255,215,0,0.9),
              0 0 24px rgba(255,215,0,0.7),
              0 0 32px rgba(255,215,0,0.5);
            transform: scale(1);
          }
          50% { 
            text-shadow: 
              0 0 12px rgba(255,215,0,1),
              0 0 20px rgba(255,215,0,1),
              0 0 32px rgba(255,215,0,0.9),
              0 0 48px rgba(255,215,0,0.7);
            transform: scale(1.1);
          }
        }
      `}</style>
      
      <div
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'absolute',
          left: x, 
          top: y,
          width: width - 2, 
          height: height - 2,
          background: `linear-gradient(135deg, ${gradeColor}15, ${gradeColor}08)`,
          ...glowStyle,
          borderRadius: isMobile ? 8 : 12,
          display: 'flex',
          flexDirection: 'column',
          color: '#fff',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          overflow: 'hidden',
          transform: isHovered ? 'translateY(-1px)' : 'translateY(0)'
        }}
      >
        {/* 순위 표시 - 랭킹보드와 동일한 글로우 스타일 */}
        {size !== 'tiny' && (
          <div style={rankStyle}>
            {item.rank}
          </div>
        )}

        {/* 주소 표시 - 통일된 형식 */}
        {fonts.address > 0 && (
          <div style={{
            padding: isMobile ? '4px 6px' : '8px',
            fontSize: fonts.address,
            fontFamily: 'monospace',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            paddingLeft: size === 'large' ? (isMobile ? 52 : 52) : 
                        size === 'medium' ? (isMobile ? 40 : 40) : 
                        (isMobile ? 32 : 32)
          }}>
            {getAddressDisplay()}
          </div>
        )}

        {/* 중앙 퍼센트 */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '0 4px' : '0 8px'
        }}>
          <div style={{
            fontSize: fonts.percentage,
            fontWeight: 900,
            color: '#fff',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            lineHeight: 1,
            letterSpacing: '-0.5px'
          }}>
            {item.value.toFixed(1)}%
          </div>
        </div>

        {/* 미니 차트 (왼쪽 하단) */}
        <MiniChart size={size} isPositive={isPositive} isMobile={isMobile} />
        
        {/* 실시간 포인트 (오른쪽 하단) */}
        <RealTimePoints initialPoints={item.score} size={size} isMobile={isMobile} />
      </div>
    </>
  );
}

// --- 사이드바 및 아이템 ---
function SidebarItem({ icon, text, isActive = false, onClick, disabled = false, collapsed = false }:{
  icon: string; text: string; isActive?: boolean; onClick?: () => void; disabled?: boolean; collapsed?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex", alignItems: "center", gap: collapsed ? 0 : 12,
        padding: collapsed ? "12px 8px" : "12px 16px",
        background: isActive ? "rgba(74,222,128,0.1)" : disabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.03)",
        border: isActive ? "1px solid rgba(74,222,128,0.3)" : "1px solid rgba(255,255,255,0.05)",
        borderRadius: 12, color: disabled ? "#666" : isActive ? "#4ade80" : "#fff",
        cursor: disabled ? "not-allowed" : "pointer", width: "100%", textAlign: "left", transition: "all 0.2s",
        fontSize: 16, fontWeight: isActive ? 700 : 600, justifyContent: collapsed ? "center" : "flex-start"
      }}
    >
      <span style={{ fontSize: 20, minWidth: 20 }}>{icon}</span>
      {!collapsed && (<><span>{text}</span>{disabled && <span style={{ marginLeft: "auto", fontSize: 16 }}>🔒</span>}</>)}
    </button>
  );
}

function Sidebar({ isOpen, onClose, wallet, currentPage, onPageChange, isMobile, isDesktop }:{
  isOpen: boolean; onClose: () => void; wallet: string; currentPage: string; onPageChange: (page: string) => void; isMobile: boolean; isDesktop: boolean;
}) {
  const sidebarWidth = isMobile ? "280px" : isDesktop ? "240px" : "280px";
  const isCollapsed = false;
  return (
    <>
      {isMobile && isOpen && <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.6)", zIndex: 998, backdropFilter: "blur(4px)" }} onClick={onClose} />}
      <div style={{
        position: "fixed", top: 0, left: 0, width: sidebarWidth, height: "100vh",
        background: "linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)",
        border: "1px solid rgba(255,255,255,0.1)",
        transform: (isMobile && !isOpen) ? "translateX(-100%)" : "translateX(0)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)", zIndex: 999,
        padding: "20px 16px", display: "flex", flexDirection: "column", gap: 8, boxShadow: "2px 0 20px rgba(0,0,0,0.3)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 24 }}>🥩</span>
            {!isCollapsed && (
              <h2 style={{
                color: "#fff", margin: 0, fontSize: 18, fontWeight: 700,
                background: "linear-gradient(135deg, #4ade80, #22c55e)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>STAKE</h2>
            )}
          </div>
          {isMobile && (
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#999", fontSize: 24, cursor: "pointer", padding: 4 }}>×</button>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SidebarItem icon="🏆" text="Leaderboard" isActive={currentPage === "leaderboard"} onClick={() => onPageChange("leaderboard")} collapsed={isCollapsed} />
          <SidebarItem icon="👤" text="My Dashboard" isActive={currentPage === "dashboard"} onClick={() => onPageChange("dashboard")} disabled={!wallet} collapsed={isCollapsed} />
          <SidebarItem icon="📊" text="Statistics" isActive={currentPage === "stats"} onClick={() => onPageChange("stats")} collapsed={isCollapsed} />
          <SidebarItem icon="📚" text="How To Guide" isActive={currentPage === "howto"} onClick={() => onPageChange("howto")} collapsed={isCollapsed} />
        </div>
        <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <ConnectButton
            accountStatus="address"
            chainStatus="icon"
            showBalance={false}
            label={isCollapsed ? "💰" : "Connect Wallet"}
          />
        </div>
      </div>
    </>
  );
}

// Layout 컴포넌트 수정 - pages/index.tsx에서 기존 Layout 함수를 이것으로 교체하세요
function Layout({
  children, currentPage, onPageChange, wallet, isMobile, isDesktop
}:{
  children: React.ReactNode; currentPage: string; onPageChange: (page: string) => void; wallet: string; isMobile: boolean; isDesktop: boolean;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);
  
  // 카운트다운 훅 사용
  const phase1TimeLeft = useCountdown(PHASE_SCHEDULE.PHASE_1_END);
  const phase2TimeLeft = useCountdown(PHASE_SCHEDULE.PHASE_2_START);
  
  const handlePhaseClick = (phase: number) => {
    if (phase > 1) {
      setSelectedPhase(phase);
    }
  };
  
  const sidebarWidth = isDesktop ? 240 : 0;
  
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0a" }}>
      <Sidebar isOpen={isDesktop || sidebarOpen} onClose={() => setSidebarOpen(false)} wallet={wallet} currentPage={currentPage} onPageChange={onPageChange} isMobile={isMobile} isDesktop={isDesktop} />
      
      <main style={{ flex: 1, marginLeft: isDesktop ? sidebarWidth : 0, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* 메인 헤더 - 모바일용 */}
        {isMobile && (
          <header style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", background: "rgba(255,255,255,0.03)", 
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(10px)"
          }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", padding: 8 }}>☰</button>
            <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#fff", background: 'linear-gradient(135deg, #4ade80, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🥩 STAKE Leaderboard</h1>
            <ConnectButton
              accountStatus="address"
              chainStatus="icon"
              showBalance={false}
              label="💰"
            />
          </header>
        )}
        
        {/* 페이즈 시스템 헤더 - 중앙 정렬 + 우측 지갑 버튼 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '16px' : '20px 32px',
          background: 'rgba(10,10,10,0.95)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          position: 'sticky',
          top: isMobile ? 61 : 0,
          zIndex: 99,
          backdropFilter: 'blur(12px)',
        }}>
          {/* 중앙 정렬된 페이즈 섹션 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 8 : 24,
            justifyContent: 'center'
          }}>
            <PhaseProgressBar 
              currentPhase={1}
              totalPhases={6}
              onPhaseClick={handlePhaseClick}
              isMobile={isMobile}
            />
            <PhaseCountdown 
              timeLeft={phase1TimeLeft}
              isMobile={isMobile}
            />
          </div>
          
          {/* 우측 지갑 연결 버튼 - 데스크탑만 */}
          {!isMobile && (
            <div style={{
              position: 'absolute',
              right: 32,
              top: '50%',
              transform: 'translateY(-50%)'
            }}>
              <ConnectButton
                accountStatus="address"
                chainStatus="icon"
                showBalance={false}
                label="💰 Connect Wallet"
              />
            </div>
          )}
        </div>
        
        {/* 메인 컨텐츠 */}
        <div style={{ flex: 1, padding: isMobile ? "16px" : "20px 24px" }}>
          {children}
        </div>
      </main>
      
      {/* 커밍순 모달 */}
      <ComingSoonModal 
        isOpen={selectedPhase !== null}
        onClose={() => setSelectedPhase(null)}
        phase={selectedPhase || 2}
        timeLeft={phase2TimeLeft}
        isMobile={isMobile}
      />
    </div>
  );
}


// ========================================
// 🔥 Top10Leaderboard 컴포넌트 수정 코드
// ========================================

// pages/index.tsx에서 Top10Leaderboard 함수를 찾아서 이 코드로 완전히 교체하세요!

// 🔥 기존 Top10Leaderboard 함수를 이 코드로 완전히 교체하세요!

// 🌟 강한 글로우 스타일 Top10Leaderboard 완성 코드
// pages/index.tsx에서 기존 Top10Leaderboard 함수를 이 코드로 완전히 교체하세요!
// 🎯 레이아웃 개선된 Top10Leaderboard 완성 코드
// pages/index.tsx에서 기존 Top10Leaderboard 함수를 이 코드로 완전히 교체하세요!

function Top10Leaderboard({ data, isMobile, setModal }: { 
  data: LeaderboardItem[]; 
  isMobile: boolean;
  setModal: (item: LeaderboardItem) => void;
}) {
  const [currentTab, setCurrentTab] = useState<'10' | '25' | '50' | 'all'>('10');
  
  const getDisplayCount = (tab: string) => {
    switch(tab) {
      case '10': return 10;
      case '25': return 25;
      case '50': return 50;
      case 'all': return data.length;
      default: return 10;
    }
  };

  const displayCount = getDisplayCount(currentTab);
  
  // 활성 사용자만 스테이킹 수량으로 정렬하여 새로운 순위 부여
  const sortedData = [...data]
    .filter(item => item.grade !== "Jeeted" && item.total_staked > 0) // Jeet 제외
    .sort((a, b) => b.total_staked - a.total_staked); // 스테이킹 수량으로 정렬
  
  const displayData = sortedData.slice(0, displayCount);

  const totalAllocation = displayData.reduce((sum, item) => sum + item.value, 0);
  const totalStaked = displayData.reduce((sum, item) => sum + item.total_staked, 0);

  // 🌟 강한 글로우 RANK 컴포넌트
  const StrongGlowRank = ({ rank }: { rank: number }) => {
    const getRankStyle = (rank: number) => {
      switch(rank) {
        case 1: 
          return { 
            color: '#ffd700', 
            textShadow: `
              0 0 5px rgba(255,215,0,1),
              0 0 10px rgba(255,215,0,0.8),
              0 0 20px rgba(255,215,0,0.6),
              0 0 30px rgba(255,215,0,0.4),
              0 0 40px rgba(255,215,0,0.2)
            `,
            animation: 'strongGoldPulse 2s ease-in-out infinite'
          };
        case 2: 
          return { 
            color: '#e8e8e8', 
            textShadow: `
              0 0 5px rgba(232,232,232,0.8),
              0 0 10px rgba(192,192,192,0.6),
              0 0 15px rgba(192,192,192,0.4)
            `,
            animation: 'none'
          };
        case 3: 
          return { 
            color: '#d4a574', 
            textShadow: `
              0 0 5px rgba(212,165,116,0.8),
              0 0 10px rgba(205,127,50,0.6),
              0 0 15px rgba(205,127,50,0.4)
            `,
            animation: 'none'
          };
        default: 
          return { 
            color: '#999999', 
            textShadow: 'none',
            animation: 'none'
          };
      }
    };
    
    const rankStyle = getRankStyle(rank);
    
    return (
      <>
        <div style={{
          minWidth: isMobile ? 35 : 40,
          textAlign: 'center',
          fontSize: isMobile ? 16 : 18,
          fontWeight: 900,
          color: rankStyle.color,
          textShadow: rankStyle.textShadow,
          animation: rankStyle.animation,
          opacity: 0.95,
          letterSpacing: '0.5px',
          filter: rank <= 3 ? 'brightness(1.1)' : 'none'
        }}>
          {rank}
        </div>

        {/* CSS 애니메이션 */}
        <style jsx>{`
          @keyframes strongGoldPulse {
            0%, 100% { 
              text-shadow: 
                0 0 5px rgba(255,215,0,1),
                0 0 10px rgba(255,215,0,0.8),
                0 0 20px rgba(255,215,0,0.6),
                0 0 30px rgba(255,215,0,0.4);
              transform: scale(1);
            }
            50% { 
              text-shadow: 
                0 0 8px rgba(255,215,0,1),
                0 0 15px rgba(255,215,0,1),
                0 0 25px rgba(255,215,0,0.8),
                0 0 40px rgba(255,215,0,0.6);
              transform: scale(1.08);
            }
          }
        `}</style>
      </>
    );
  };

  // 🎨 개선된 순위 변동 표시 컴포넌트
  const RankChangeIndicator = ({ change }: { change: number }) => {
    if (change === 0) return null;

    const isUp = change < 0; // 음수는 순위 상승
    const absChange = Math.abs(change);
    
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        padding: '2px 6px',
        borderRadius: 6,
        fontSize: 9,
        fontWeight: 700,
        background: isUp 
          ? 'linear-gradient(135deg, rgba(74,222,128,0.2), rgba(34,197,94,0.1))'
          : 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.1))',
        border: `1px solid ${isUp ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)'}`,
        color: isUp ? '#4ade80' : '#ef4444',
        boxShadow: `0 1px 3px ${isUp ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)'}`,
        animation: 'rankChangePulse 0.5s ease-out'
      }}>
        <span style={{ fontSize: 8 }}>
          {isUp ? '↗' : '↘'}
        </span>
        <span>{absChange}</span>
        
        {/* CSS 애니메이션 */}
        <style jsx>{`
          @keyframes rankChangePulse {
            0% { 
              transform: scale(0.8);
              opacity: 0;
            }
            50% { 
              transform: scale(1.1);
              opacity: 1;
            }
            100% { 
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      borderRadius: 16,
      padding: 20,
      border: "1px solid rgba(255,255,255,0.1)",
      height: "fit-content"
    }}>
      {/* 헤더 */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 16,
        borderBottom: "1px solid rgba(255,255,255,0.1)"
      }}>
        <h2 style={{
          fontSize: 20,
          fontWeight: 700,
          color: "#fff",
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          🏆 Top {currentTab === 'all' ? 'All' : currentTab} Rankings
        </h2>
        <div style={{
          fontSize: 12,
          color: "#666",
          background: "rgba(255,255,255,0.05)",
          padding: "4px 8px",
          borderRadius: 6
        }}>
          Live
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div style={{
        display: "flex",
        background: "rgba(255,255,255,0.05)",
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
        gap: 2
      }}>
        {[
          { key: '10', label: 'Top 10' },
          { key: '25', label: 'Top 25' },
          { key: '50', label: 'Top 50' },
          { key: 'all', label: 'All' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setCurrentTab(tab.key as any)}
            style={{
              flex: 1,
              padding: isMobile ? "8px 12px" : "10px 16px",
              background: currentTab === tab.key 
                ? "rgba(74,222,128,0.15)" 
                : "transparent",
              border: currentTab === tab.key 
                ? "1px solid rgba(74,222,128,0.3)" 
                : "1px solid transparent",
              borderRadius: 8,
              color: currentTab === tab.key ? "#4ade80" : "#999",
              fontSize: isMobile ? 12 : 14,
              fontWeight: currentTab === tab.key ? 700 : 600,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              if (currentTab !== tab.key) {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "#fff";
              }
            }}
            onMouseLeave={(e) => {
              if (currentTab !== tab.key) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#999";
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 요약 통계 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
        gap: 12,
        marginBottom: 20
      }}>
        <div style={{
          background: "rgba(74,222,128,0.08)",
          border: "1px solid rgba(74,222,128,0.2)",
          borderRadius: 12,
          padding: 16,
          textAlign: "center"
        }}>
          <div style={{
            fontSize: 24,
            fontWeight: 900,
            color: "#4ade80",
            marginBottom: 4
          }}>
            {formatLargeNumber(totalAllocation * 1000000)}
          </div>
          <div style={{
            fontSize: 12,
            color: "#999",
            fontWeight: 600
          }}>
            Top {currentTab === 'all' ? 'All' : currentTab} 할당량
          </div>
          <div style={{
            fontSize: 10,
            color: "#4ade80",
            marginTop: 2
          }}>
            +2.1%
          </div>
        </div>
        <div style={{
          background: "rgba(139,92,246,0.08)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 12,
          padding: 16,
          textAlign: "center"
        }}>
          <div style={{
            fontSize: 24,
            fontWeight: 900,
            color: "#8b5cf6",
            marginBottom: 4
          }}>
            {formatLargeNumber(totalStaked)}
          </div>
          <div style={{
            fontSize: 12,
            color: "#999",
            fontWeight: 600
          }}>
            Top {currentTab === 'all' ? 'All' : currentTab} 스테이킹
          </div>
          <div style={{
            fontSize: 10,
            color: "#8b5cf6",
            marginTop: 2
          }}>
            +5.7%
          </div>
        </div>
        <div style={{
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 12,
          padding: 16,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          height: "100%"
        }}>
          <div style={{ flex: 1, borderBottom: "1px solid rgba(239,68,68,0.2)", paddingBottom: 8, marginBottom: 8 }}>
            <div style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#4ade80",
              marginBottom: 2
            }}>
              {displayData.length}
            </div>
            <div style={{
              fontSize: 10,
              color: "#999",
              fontWeight: 600
            }}>
              Active Wallets
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#ef4444",
              marginBottom: 2
            }}>
              {(() => {
                const totalInRange = (() => {
                  switch(currentTab) {
                    case '10': return 15;
                    case '25': return 35;
                    case '50': return 68;
                    case 'all': return 1247;
                    default: return 15;
                  }
                })();
                const jeetInRange = totalInRange - displayData.length;
                return jeetInRange.toLocaleString();
              })()}
            </div>
            <div style={{
              fontSize: 10,
              color: "#999",
              fontWeight: 600,
              marginBottom: 2
            }}>
              Jeet Users
            </div>
            <div style={{
              fontSize: 9,
              color: "#ef4444"
            }}>
              +{Math.floor(Math.random() * 5 + 1)} today
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 개선된 헤더 바 - 간격 조정 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: isMobile ? 8 : 12,
        padding: isMobile ? "8px 12px" : "10px 16px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        marginBottom: 12
      }}>
        {/* Rank 헤더 */}
        <div style={{
          minWidth: isMobile ? 35 : 40,
          fontSize: 11,
          fontWeight: 700,
          color: "#999",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          Rank
        </div>

        {/* Address & Grade 헤더 - 더 넓게 */}
        <div style={{
          flex: 1,
          minWidth: isMobile ? 150 : 200, // 더 넓게 설정
          fontSize: 11,
          fontWeight: 700,
          color: "#999",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          {isMobile ? "Address" : "Address & Grade"}
        </div>

        {/* Allocation 헤더 - 좁게 */}
        <div style={{
          textAlign: "right",
          minWidth: isMobile ? 50 : 60, // 좁게 설정
          fontSize: 11,
          fontWeight: 700,
          color: "#999",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          {isMobile ? "Alloc" : "Allocation"}
        </div>

        {/* Staked 헤더 - 좁게 */}
        <div style={{
          textAlign: "right",
          minWidth: isMobile ? 50 : 60, // 좁게 설정
          fontSize: 11,
          fontWeight: 700,
          color: "#999",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          Staked
        </div>
      </div>

      {/* 🌟 순위 리스트 - 개선된 레이아웃 */}
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: 8,
        maxHeight: currentTab === 'all' ? '400px' : currentTab === '50' ? '350px' : 'none',
        overflowY: currentTab === 'all' || currentTab === '50' ? 'auto' : 'visible',
        paddingRight: currentTab === 'all' || currentTab === '50' ? '8px' : '0'
      }}>
        {displayData.map((item, index) => {
          const rankChange = Math.floor(Math.random() * 3) - 1;
          const allocationChangePercent = (Math.random() * 20 - 10);
          const stakingChangePercent = (Math.random() * 30 - 15);
          
          const totalTokens = 100000000;
          const actualAllocation = (item.value / 100) * totalTokens;
          const actualStaking = item.total_staked;
          
          const allocationChange = formatNumberChange(actualAllocation, allocationChangePercent);
          const stakingChange = formatNumberChange(actualStaking, stakingChangePercent);
          
          return (
            <div
              key={item.address}
              onClick={() => setModal(item)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 8 : 12,
                padding: isMobile ? "10px 12px" : "12px 16px",
                background: index < 3 
                  ? "rgba(255,215,0,0.05)" 
                  : "rgba(255,255,255,0.02)",
                border: index < 3 
                  ? "1px solid rgba(255,215,0,0.2)" 
                  : "1px solid rgba(255,255,255,0.05)",
                borderRadius: 12,
                transition: "all 0.2s",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = index < 3 
                  ? "rgba(255,215,0,0.08)" 
                  : "rgba(255,255,255,0.05)";
                e.currentTarget.style.transform = "translateX(4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = index < 3 
                  ? "rgba(255,215,0,0.05)" 
                  : "rgba(255,255,255,0.02)";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              {/* 🌟 순위 섹션 */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: isMobile ? 35 : 40,
                gap: 2
              }}>
                <StrongGlowRank rank={index + 1} />
                <RankChangeIndicator change={rankChange} />
              </div>

              {/* 등급 이미지 & 주소/등급 정보 - 더 넓게 */}
              <div style={{ 
                flex: 1,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 8 : 12
              }}>
                <OptimizedGradeAvatar 
                  grade={item.grade}
                  isMobile={isMobile}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: isMobile ? 11 : 12,
                    fontWeight: 600,
                    color: "#fff",
                    fontFamily: "monospace",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginBottom: 4
                  }}>
                    {item.address.slice(0, 4)}..{item.address.slice(-4)}
                  </div>
                  <div style={{
                    fontSize: isMobile ? 9 : 10,
                    color: tierColors[item.grade] || "#999",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    overflow: "hidden"
                  }}>
                    <span style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      textShadow: "0 1px 2px rgba(0,0,0,0.5)"
                    }}>
                      {isMobile 
                        ? item.grade.split(' ')[0] 
                        : item.grade
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* 할당량 - 좁게 */}
              <div style={{ 
                textAlign: "right", 
                minWidth: isMobile ? 50 : 60
              }}>
                <div style={{
                  fontSize: isMobile ? 12 : 15,
                  fontWeight: 800,
                  color: "#fff",
                  marginBottom: 2
                }}>
                  {formatLargeNumber(actualAllocation)}
                </div>
                <div style={{
                  fontSize: 9,
                  color: allocationChange.isPositive ? "#4ade80" : "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 2
                }}>
                  {allocationChange.value}
                </div>
              </div>

              {/* 스테이킹 수량 - 좁게 */}
              <div style={{ 
                textAlign: "right", 
                minWidth: isMobile ? 50 : 60
              }}>
                <div style={{
                  fontSize: isMobile ? 12 : 15,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 2
                }}>
                  {formatLargeNumber(actualStaking)}
                </div>
                <div style={{
                  fontSize: 9,
                  color: stakingChange.isPositive ? "#4ade80" : "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 2
                }}>
                  {stakingChange.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 더보기 버튼 */}
      {currentTab !== 'all' && (
        <button
          onClick={() => setCurrentTab('all')}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: 16,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
          }}
        >
          View All Rankings ({data.length}) →
        </button>
      )}
    </div>
  );
}

// LeaderboardPage 컴포넌트 수정 - pages/index.tsx에서 기존 LeaderboardPage 함수를 이것으로 교체하세요
function LeaderboardPage({ data, modal, setModal, isMobile, isDesktop }:{
  data: LeaderboardItem[]; 
  modal: LeaderboardItem | null; 
  setModal: (item: LeaderboardItem | null) => void; 
  isMobile: boolean; 
  isDesktop: boolean;
}) {
  // 활성 유저만 필터링하고 순위 재정렬
  const activeUsers = data
    .filter(item => item.grade !== "Jeeted" && item.total_staked > 0) // Jeeted 제외
    .sort((a, b) => b.total_staked - a.total_staked) // 스테이킹 수량으로 정렬
    .map((item, index) => ({
      ...item,
      rank: index + 1 // 새로운 순위 부여
    }));

  const topData = activeUsers.slice(0, 20); // 상위 20명만
  
  const treemapWidth = isMobile ? 380 : isDesktop ? 750 : 620;
  const treemapHeight = isMobile ? 450 : isDesktop ? 625 : 560;
  const items = useTreemapLayout(topData, treemapWidth, treemapHeight);

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: isMobile ? "column" : "row", 
      gap: 24, 
      height: "100%" 
    }}>
      {/* 모바일에서는 Top 10이 위에 표시 */}
      {isMobile && (
        <Top10Leaderboard data={activeUsers} isMobile={isMobile} setModal={setModal}/>
      )}

      {/* Treemap 섹션 */}
      <section style={{ 
        flex: isMobile ? "none" : isDesktop ? "0 0 auto" : "1", 
        minWidth: 0 
      }}>
        <div style={{ 
          background: "rgba(255,255,255,0.03)", 
          borderRadius: 16, 
          padding: 20, 
          border: "1px solid rgba(255,255,255,0.1)", 
          height: "fit-content" 
        }}>
          <h2 style={{ 
            fontSize: 20, 
            fontWeight: 700, 
            marginBottom: 20, 
            textAlign: "center", 
            color: "#fff", 
            margin: "0 0 20px 0" 
          }}>
            🔥 Top 20 Allocation Map
          </h2>
          <div style={{ 
            position: "relative", 
            width: treemapWidth, 
            height: treemapHeight, 
            overflow: "hidden", 
            borderRadius: 12, 
            margin: "0 auto" 
          }}>
            {items.map((d, i) => {
              const item = d.data as LeaderboardItem;
              const boxWidth = d.x1 - d.x0 - 2;
              const boxHeight = d.y1 - d.y0 - 2;
              return (
                <TreemapBox 
                  key={i} 
                  item={item} 
                  x={d.x0} 
                  y={d.y0} 
                  width={boxWidth} 
                  height={boxHeight} 
                  onClick={() => setModal(item)}
                  isMobile={isMobile}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* 데스크탑에서는 Top 10이 오른쪽에 표시 */}
      {!isMobile && (
        <section style={{ 
          flex: "1", 
          minWidth: 400,
          maxWidth: 500
        }}>
          <Top10Leaderboard data={activeUsers} isMobile={isMobile} setModal={setModal}/>
        </section>
      )}
    </div>
  );
}

// 🔥 기존 SimpleModal 함수를 이 코드로 완전히 교체하세요!
function SimpleModal({ modal, onClose }: { modal: LeaderboardItem; onClose: () => void }) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [modal]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const gradeColor = tierColors[modal.grade] || "#9ca3af";

  // 더미 비공개 점수 계산
  const stakePoints = modal.total_staked * modal.holding_days;
  const secretPoints = Math.floor(stakePoints * 0.65 + Math.random() * 1000);

  // 실제 할당량 계산 (더미)
  const totalTokens = 13500000000; // 135억 VIRTUAL 가정
  const actualAllocation = (modal.value / 100) * totalTokens;
  const virtualTokens = actualAllocation;
  const dollarValue = virtualTokens * 0.0025; // $0.0025 per VIRTUAL (더미)

  // 🎯 모달 전용 아바타 컴포넌트 (이미지 여백 최소화)
  const ModalGradeAvatar = ({ grade, size = 85 }: { grade: string; size?: number }) => {
    const [imageError, setImageError] = useState(false);

    return (
      <div style={{
        width: size,
        height: size,
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        border: `2px solid ${gradeColor}44`,
        background: `linear-gradient(135deg, ${gradeColor}20, ${gradeColor}10)`
      }}>
        {!imageError && (
          <img
            src={getGradeImagePath(grade)}
            alt={grade}
            width={size}
            height={size}
            style={{
              borderRadius: 10,
              objectFit: "cover",
              width: "100%",
              height: "100%"
            }}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        )}
        
        {imageError && (
          <div style={{
            width: "100%",
            height: "100%",
            background: `linear-gradient(135deg, ${gradeColor}, ${gradeColor}88)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: Math.floor(size * 0.45),
            borderRadius: 10
          }}>
            {getGradeAvatar(grade)}
          </div>
        )}
      </div>
    );
  };

  // 모바일 감지
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.9)',
          zIndex: 999,
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center', // 모바일에서는 상단 정렬
          justifyContent: 'center',
          backdropFilter: 'blur(12px)',
          padding: isMobile ? '10px' : '20px',
          paddingTop: isMobile ? '20px' : '20px', // 모바일에서 상단 여백
          overflowY: 'auto' // 스크롤 허용
        }}
        onClick={onClose}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'linear-gradient(135deg, #1a1d29 0%, #252833 50%, #1e2028 100%)',
            borderRadius: isMobile ? 20 : 24,
            width: isMobile ? '100%' : 500,
            maxWidth: isMobile ? '100%' : '95vw',
            maxHeight: isMobile ? 'none' : '90vh',
            color: '#fff',
            boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)',
            border: '2px solid rgba(255,255,255,0.05)',
            transform: isAnimating ? 'scale(0.95)' : 'scale(1)',
            transition: 'transform 0.3s ease',
            marginBottom: isMobile ? '20px' : '0' // 모바일에서 하단 여백
          }}
        >
          {/* 헤더 - 등급별 가변 색상 */}
          <div style={{
            background: `linear-gradient(135deg, ${gradeColor}30, ${gradeColor}15)`,
            backdropFilter: 'blur(20px)',
            padding: isMobile ? '20px 20px 16px' : '24px 24px 20px',
            textAlign: 'center',
            position: 'relative',
            borderBottom: `1px solid ${gradeColor}33`,
            borderRadius: isMobile ? '20px 20px 0 0' : '24px 24px 0 0'
          }}>
            {/* 닫기 버튼 */}
            <button 
              onClick={onClose}
              style={{
                position: 'absolute',
                top: isMobile ? 12 : 16,
                right: isMobile ? 16 : 20,
                width: isMobile ? 32 : 36,
                height: isMobile ? 32 : 36,
                background: 'rgba(0,0,0,0.2)',
                border: 'none',
                borderRadius: '50%',
                color: 'rgba(255,255,255,0.6)',
                fontSize: isMobile ? 20 : 24,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
            >
              ×
            </button>

            {/* 등급 이미지 박스 - 여백 최소화 */}
            <div style={{
              width: isMobile ? 80 : 90, // 모바일에서 조금 작게
              height: isMobile ? 80 : 90,
              margin: '0 auto 12px',
              position: 'relative'
            }}>
              {/* 등급 이미지 */}
              <ModalGradeAvatar grade={modal.grade} size={isMobile ? 80 : 90} />
            </div>

            {/* 등급명 */}
            <div style={{
              fontSize: isMobile ? 18 : 20,
              fontWeight: 800,
              color: '#fff',
              marginBottom: 8,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              letterSpacing: '0.5px'
            }}>
              {modal.grade}
            </div>

            {/* 세련된 순위 표현 */}
            <div style={{
              background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
              color: '#1a1a1a',
              padding: isMobile ? '5px 14px' : '6px 16px',
              borderRadius: 12,
              fontSize: isMobile ? 13 : 14,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 3px 12px rgba(255,215,0,0.3)'
            }}>
              <span style={{ fontSize: isMobile ? 14 : 16 }}>{getRankBadge(modal.rank)}</span>
              <span>Rank #{modal.rank}</span>
              <span style={{ fontSize: 10, opacity: 0.8 }}>LEADER</span>
            </div>
          </div>

          {/* 바디 */}
          <div style={{ padding: isMobile ? '16px 20px 20px' : '20px 24px 24px' }}>
            {/* 지갑 주소 */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              padding: isMobile ? '12px 16px' : '16px 20px',
              borderRadius: 16,
              fontFamily: 'monospace',
              textAlign: 'center',
              marginBottom: isMobile ? 16 : 20,
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{
                fontSize: 10,
                color: '#666',
                marginBottom: 6,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 600
              }}>
                Wallet Address
              </div>
              <div style={{
                fontSize: isMobile ? 16 : 20,
                color: '#fff',
                fontWeight: 900,
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                letterSpacing: '1px'
              }}>
                {modal.address.slice(0, 6)}...{modal.address.slice(-4)}
              </div>
            </div>

            {/* 💰 수익 FOMO 극대화 할당량 박스 */}
            <div style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1e1e1e 100%)',
              border: '2px solid transparent',
              backgroundClip: 'padding-box',
              borderRadius: 20,
              padding: isMobile ? '20px 16px' : '28px 24px',
              textAlign: 'center',
              marginBottom: isMobile ? 16 : 20,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}>
              {/* 골드 테두리 효과 */}
              <div style={{
                position: 'absolute',
                inset: 0,
                padding: 2,
                background: 'linear-gradient(135deg, #ffd700, #ff6b35, #f7931e)',
                borderRadius: 20,
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'exclude'
              }} />
              
              {/* 배경 글로우 */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 50% 20%, rgba(255,215,0,0.15), transparent 60%)',
                pointerEvents: 'none'
              }} />

              {/* 타이틀 */}
              <div style={{
                fontSize: isMobile ? 14 : 16,
                color: '#ffd700',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                marginBottom: isMobile ? 16 : 20,
                position: 'relative',
                zIndex: 2,
                textShadow: '0 0 10px rgba(255,215,0,0.5)'
              }}>
                💰 Phase 1 Allocation 🚀
              </div>

              {/* 메인 수량 */}
              <div style={{
                fontSize: isMobile ? 22 : 26,
                fontWeight: 900,
                color: '#fff',
                marginBottom: isMobile ? 12 : 16,
                position: 'relative',
                zIndex: 2,
                lineHeight: 1.2,
                textShadow: '0 2px 8px rgba(0,0,0,0.5)'
              }}>
                {formatLargeNumber(actualAllocation)} STAKE
                <span style={{
                  fontSize: isMobile ? 16 : 20,
                  color: '#ff6b35',
                  fontWeight: 800,
                  marginLeft: 8,
                  textShadow: '0 0 10px rgba(255,107,53,0.6)'
                }}>
                  ({modal.value.toFixed(2)}%)
                </span>
              </div>

              {/* VIRTUAL과 달러 */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: isMobile ? 8 : 12,
                position: 'relative',
                zIndex: 2
              }}>
                <div style={{
                  fontSize: isMobile ? 16 : 18,
                  fontWeight: 700,
                  color: '#22d3ee',
                  textShadow: '0 0 10px rgba(34,211,238,0.5)'
                }}>
                  ≈ {formatLargeNumber(virtualTokens)} VIRTUAL
                </div>
                
                <div style={{
                  fontSize: isMobile ? 18 : 20,
                  fontWeight: 900,
                  color: '#4ade80',
                  textShadow: '0 0 15px rgba(74,222,128,0.6)'
                }}>
                  ≈ ${formatLargeNumber(dollarValue)}
                </div>
              </div>
            </div>

            {/* 좌우 분할 포인트 시스템 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: isMobile ? 12 : 16
            }}>
              {/* STAKE Points */}
              <div style={{
                padding: isMobile ? 12 : 16,
                borderRadius: 12,
                textAlign: 'center',
                background: 'rgba(74,222,128,0.08)',
                border: '1px solid rgba(74,222,128,0.2)'
              }}>
                <div style={{
                  fontSize: isMobile ? 10 : 12,
                  fontWeight: 700,
                  color: '#4ade80',
                  marginBottom: isMobile ? 6 : 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  🥩 STAKE POINTS
                </div>
                <div style={{
                  fontSize: isMobile ? 16 : 18,
                  fontWeight: 900,
                  color: '#fff',
                  marginBottom: 4
                }}>
                  {formatLargeNumber(stakePoints)}
                </div>
                <div style={{
                  fontSize: 9,
                  color: '#4ade80',
                  opacity: 0.8
                }}>
                  Current Score
                </div>
              </div>

              {/* SECRET Points */}
              <div style={{
                padding: isMobile ? 12 : 16,
                borderRadius: 12,
                textAlign: 'center',
                background: 'rgba(139,92,246,0.08)',
                border: '1px solid rgba(139,92,246,0.2)',
                position: 'relative'
              }}>
                {/* 반짝임 효과 */}
                <div style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  fontSize: isMobile ? 10 : 12,
                  opacity: 0.6
                }}>
                  ✨
                </div>
                
                <div style={{
                  fontSize: isMobile ? 10 : 12,
                  fontWeight: 700,
                  color: '#8b5cf6',
                  marginBottom: isMobile ? 6 : 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  ❓ SECRET POINTS
                </div>
                <div style={{
                  fontSize: isMobile ? 16 : 18,
                  fontWeight: 900,
                  color: '#fff',
                  marginBottom: 4
                }}>
                  {formatLargeNumber(secretPoints)}
                </div>
                <div style={{
                  fontSize: 9,
                  color: '#8b5cf6',
                  opacity: 0.8
                }}>
                  Hidden Score
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// 2. 등급별 배수 업데이트 (기존 gradeMultipliers 찾아서 교체)
const gradeMultipliers: Record<string, number> = {
  "Genesis OG": 5.0,
  "Heavy Eater": 4.2,  // 기존 "Smoke Flexer" 대신
  "Steak Wizard": 3.5,
  "Grilluminati": 3.0,
  "Flame Juggler": 2.5,
  "Flipstarter": 2.0,
  "Sizzlin' Noob": 1.5,
  "Jeeted": 1.0,
};

// 등급별 다음 등급 정보
const nextGrade: Record<string, string> = {
  "Sizzlin' Noob": "Flipstarter",
  "Flipstarter": "Flame Juggler", 
  "Flame Juggler": "Grilluminati",
  "Grilluminati": "Steak Wizard",
  "Steak Wizard": "Heavy Eater",
  "Heavy Eater": "Genesis OG",
  "Genesis OG": "Max Level",
};

// 개선된 등급 메인 카드
function EnhancedGradeCard({ myData, isMobile }: { myData: LeaderboardItem; isMobile: boolean }) {
  const currentMultiplier = gradeMultipliers[myData.grade] || 1.0;
  const nextGradeName = nextGrade[myData.grade];
  const nextMultiplier = nextGradeName !== "Max Level" ? gradeMultipliers[nextGradeName] : currentMultiplier;
  
  // 더미 포인트 계산 (스테이킹 수량 × 보유 기간)
  const stakePoints = myData.total_staked * myData.holding_days;
  const mysteryPoints = Math.floor(stakePoints * 0.75 + Math.random() * 1000); // 더미 비공개 포인트
  
  // 다음 등급까지 필요한 포인트 (더미)
  const nextGradeRequired = stakePoints * 1.5;
  const progress = Math.min((stakePoints / nextGradeRequired) * 100, 100);

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(74,222,128,0.12), rgba(34,197,94,0.08))",
      border: "2px solid rgba(74,222,128,0.3)",
      borderRadius: 24,
      padding: isMobile ? "24px" : "32px",
      position: "relative",
      overflow: "hidden",
      marginBottom: 24
    }}>
      {/* 배경 글로우 효과 */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(circle at 30% 20%, ${tierColors[myData.grade]}20, transparent 70%)`,
        pointerEvents: "none"
      }} />

      {/* 상단: 등급 정보 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: isMobile ? 16 : 24,
        marginBottom: 24,
        position: "relative",
        zIndex: 1
      }}>
        {/* 큰 등급 이미지 */}
        <div style={{
          width: isMobile ? 80 : 120,
          height: isMobile ? 80 : 120,
          borderRadius: 20,
          background: `linear-gradient(135deg, ${tierColors[myData.grade] || "#475569"}, ${tierColors[myData.grade] || "#475569"}88)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "3px solid rgba(255,255,255,0.2)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* 배경 패턴 */}
          <div style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 40,
            height: 40,
            background: "rgba(255,255,255,0.1)",
            borderRadius: "50%",
            opacity: 0.6
          }} />
          
          <span style={{ 
            fontSize: isMobile ? 36 : 56,
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))"
          }}>
            {getGradeAvatar(myData.grade)}
          </span>
        </div>

        {/* 등급명 + 배수 정보 */}
        <div style={{ flex: 1 }}>
          <h2 style={{
            fontSize: isMobile ? 24 : 32,
            fontWeight: 900,
            color: "#fff",
            margin: "0 0 8px 0",
            textShadow: "0 2px 8px rgba(0,0,0,0.5)"
          }}>
            {myData.grade}
          </h2>
          
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
            flexWrap: "wrap"
          }}>
            <div style={{
              background: "rgba(255,215,0,0.2)",
              color: "#ffd700",
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: isMobile ? 14 : 16,
              fontWeight: 700
            }}>
              {currentMultiplier}x Multiplier
            </div>
            
            {nextGradeName !== "Max Level" && (
              <div style={{
                fontSize: isMobile ? 12 : 14,
                color: "#999",
                display: "flex",
                alignItems: "center",
                gap: 4
              }}>
                Next: {nextGradeName} ({nextMultiplier}x) →
              </div>
            )}
          </div>

          <div style={{
            fontSize: isMobile ? 14 : 16,
            color: "#4ade80",
            fontWeight: 600
          }}>
            Rank #{myData.rank} • Top {myData.percentile.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* 중단: 포인트 정보 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: 16,
        marginBottom: 24,
        position: "relative",
        zIndex: 1
      }}>
        {/* STAKE Points */}
        <div style={{
          background: "rgba(74,222,128,0.08)",
          border: "1px solid rgba(74,222,128,0.2)",
          borderRadius: 16,
          padding: 20
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12
          }}>
            <h3 style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#4ade80",
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              🥩 STAKE Points
            </h3>
            <div style={{
              fontSize: 10,
              background: "rgba(74,222,128,0.2)",
              color: "#4ade80",
              padding: "2px 6px",
              borderRadius: 4,
              fontWeight: 600
            }}>
              Active
            </div>
          </div>
          
          <div style={{
            fontSize: isMobile ? 24 : 28,
            fontWeight: 900,
            color: "#fff",
            marginBottom: 8
          }}>
            {formatLargeNumber(stakePoints)}
          </div>

          {/* 진행률 바 */}
          {nextGradeName !== "Max Level" && (
            <>
              <div style={{
                width: "100%",
                height: 8,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 4,
                overflow: "hidden",
                marginBottom: 8
              }}>
                <div style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #4ade80, #22c55e)",
                  borderRadius: 4,
                  transition: "width 0.3s ease"
                }} />
              </div>
              <div style={{
                fontSize: 11,
                color: "#999",
                display: "flex",
                justifyContent: "space-between"
              }}>
                <span>{progress.toFixed(1)}% to {nextGradeName}</span>
                <span>{formatLargeNumber(nextGradeRequired)}</span>
              </div>
            </>
          )}
        </div>

        {/* Mystery Points */}
        <div style={{
          background: "rgba(139,92,246,0.08)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 16,
          padding: 20,
          position: "relative"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12
          }}>
            <h3 style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#8b5cf6",
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              ❓ ??? Points
            </h3>
            <div style={{
              fontSize: 10,
              background: "rgba(139,92,246,0.2)",
              color: "#8b5cf6",
              padding: "2px 6px",
              borderRadius: 4,
              fontWeight: 600
            }}>
              Coming Soon
            </div>
          </div>
          
          <div style={{
            fontSize: isMobile ? 24 : 28,
            fontWeight: 900,
            color: "#8b5cf6",
            marginBottom: 8
          }}>
            {formatLargeNumber(mysteryPoints)}
          </div>

          <div style={{
            fontSize: 11,
            color: "#8b5cf6",
            opacity: 0.8
          }}>
            Future Token Distribution
          </div>

          {/* 미스터리 효과 */}
          <div style={{
            position: "absolute",
            top: 10,
            right: 10,
            fontSize: 20,
            opacity: 0.3
          }}>
            ✨
          </div>
        </div>
      </div>

      {/* 하단: 액션 버튼 */}
      <div style={{
        position: "relative",
        zIndex: 1
      }}>
        <a
          href="https://app.virtuals.io/virtuals/26083"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            padding: "16px 24px",
            background: "linear-gradient(135deg, #ff6b35, #f7931e)",
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            textDecoration: "none",
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 20px rgba(255,107,53,0.3)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 30px rgba(255,107,53,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(255,107,53,0.3)";
          }}
        >
          <span style={{ fontSize: 18 }}>🚀</span>
          Buy More STAKE
          <span style={{ fontSize: 14, opacity: 0.8 }}>↗</span>
        </a>
      </div>
    </div>
  );
}

// 빈 대시보드 컴포넌트 (스테이킹 독려용)
function EmptyDashboard({ wallet, isMobile }: { wallet: string; isMobile: boolean }) {
  // 예상 스테이킹 시뮬레이션 (더미 데이터)
  const simulatedStakeAmount = 1000; // 1000 STAKE 기준
  const estimatedPoints = simulatedStakeAmount * 30; // 30일 기준
  const startingGrade = "Sizzlin' Noob";
  const startingMultiplier = 1.5;

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      gap: 24, 
      maxWidth: 1000, 
      margin: "0 auto" 
    }}>
      {/* 메인 히어로 섹션 */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,107,53,0.12), rgba(247,147,30,0.08))",
        border: "2px solid rgba(255,107,53,0.3)",
        borderRadius: 24,
        padding: isMobile ? "32px 24px" : "48px 32px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* 배경 효과 */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at 50% 20%, rgba(255,107,53,0.15), transparent 70%)",
          pointerEvents: "none"
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* 아이콘 */}
          <div style={{
            fontSize: isMobile ? 64 : 80,
            marginBottom: 24,
            background: "linear-gradient(135deg, #ff6b35, #f7931e)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 4px 8px rgba(255,107,53,0.3))"
          }}>
            🚀
          </div>

          {/* 메인 메시지 */}
          <h1 style={{
            fontSize: isMobile ? 28 : 36,
            fontWeight: 900,
            color: "#fff",
            marginBottom: 16,
            textShadow: "0 2px 8px rgba(0,0,0,0.5)"
          }}>
            Start Your STAKE Journey
          </h1>

          <p style={{
            fontSize: isMobile ? 16 : 18,
            color: "#ff6b35",
            marginBottom: 32,
            lineHeight: 1.6,
            maxWidth: 500,
            margin: "0 auto 32px auto"
          }}>
            Your wallet is connected but you haven't started staking yet. 
            Join the leaderboard and start earning multiplied rewards!
          </p>

          {/* 지갑 주소 표시 */}
          <div style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: "12px 20px",
            fontSize: 14,
            fontFamily: "monospace",
            color: "#999",
            marginBottom: 32,
            display: "inline-block"
          }}>
            🔗 {wallet.slice(0, 8)}...{wallet.slice(-6)}
          </div>
        </div>
      </div>

      {/* 예상 혜택 미리보기 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
        gap: 16
      }}>
        {/* 시작 등급 */}
        <div style={{
          background: "rgba(139,92,246,0.08)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 16,
          padding: 20,
          textAlign: "center"
        }}>
          <div style={{
            fontSize: 32,
            marginBottom: 12
          }}>
            🆕
          </div>
          <h3 style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#8b5cf6",
            margin: "0 0 8px 0",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            Starting Grade
          </h3>
          <div style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#fff",
            marginBottom: 4
          }}>
            {startingGrade}
          </div>
          <div style={{
            fontSize: 12,
            color: "#8b5cf6",
            opacity: 0.8
          }}>
            {startingMultiplier}x Multiplier
          </div>
        </div>

        {/* 예상 포인트 */}
        <div style={{
          background: "rgba(74,222,128,0.08)",
          border: "1px solid rgba(74,222,128,0.2)",
          borderRadius: 16,
          padding: 20,
          textAlign: "center"
        }}>
          <div style={{
            fontSize: 32,
            marginBottom: 12
          }}>
            🎯
          </div>
          <h3 style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#4ade80",
            margin: "0 0 8px 0",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            Estimated Points
          </h3>
          <div style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#fff",
            marginBottom: 4
          }}>
            {formatLargeNumber(estimatedPoints)}
          </div>
          <div style={{
            fontSize: 12,
            color: "#4ade80",
            opacity: 0.8
          }}>
            After 30 days
          </div>
        </div>

        {/* 미스터리 포인트 */}
        <div style={{
          background: "rgba(139,92,246,0.08)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 16,
          padding: 20,
          textAlign: "center",
          position: "relative"
        }}>
          <div style={{
            fontSize: 32,
            marginBottom: 12
          }}>
            ❓
          </div>
          <h3 style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#8b5cf6",
            margin: "0 0 8px 0",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            ??? Points
          </h3>
          <div style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#8b5cf6",
            marginBottom: 4
          }}>
            Coming Soon
          </div>
          <div style={{
            fontSize: 12,
            color: "#8b5cf6",
            opacity: 0.8
          }}>
            Future Rewards
          </div>

          {/* 미스터리 반짝임 */}
          <div style={{
            position: "absolute",
            top: 10,
            right: 10,
            fontSize: 16,
            opacity: 0.4
          }}>
            ✨
          </div>
        </div>
      </div>

      {/* 스테이킹 혜택 안내 */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 16,
        padding: isMobile ? "24px" : "32px"
      }}>
        <h3 style={{
          fontSize: 20,
          fontWeight: 700,
          color: "#fff",
          margin: "0 0 20px 0",
          textAlign: "center"
        }}>
          🎁 Why Stake TOKENS?
        </h3>

        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 20
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>🏆</span>
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 4px 0" }}>
                Climb the Leaderboard
              </h4>
              <p style={{ fontSize: 14, color: "#999", margin: 0, lineHeight: 1.5 }}>
                Compete with other stakers and earn your place in the rankings
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>⚡</span>
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 4px 0" }}>
                Multiplied Rewards
              </h4>
              <p style={{ fontSize: 14, color: "#999", margin: 0, lineHeight: 1.5 }}>
                Higher grades unlock bigger multipliers for maximum returns
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>💎</span>
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 4px 0" }}>
                Exclusive Benefits
              </h4>
              <p style={{ fontSize: 14, color: "#999", margin: 0, lineHeight: 1.5 }}>
                Access special features and future token distributions
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>📈</span>
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 4px 0" }}>
                Long-term Growth
              </h4>
              <p style={{ fontSize: 14, color: "#999", margin: 0, lineHeight: 1.5 }}>
                The longer you stake, the more points and rewards you earn
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 큰 액션 버튼 */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,107,53,0.1), rgba(247,147,30,0.05))",
        border: "2px solid rgba(255,107,53,0.2)",
        borderRadius: 20,
        padding: isMobile ? "24px" : "32px",
        textAlign: "center"
      }}>
        <h3 style={{
          fontSize: isMobile ? 20 : 24,
          fontWeight: 800,
          color: "#fff",
          margin: "0 0 16px 0"
        }}>
          Ready to Start? 🚀
        </h3>

        <p style={{
          fontSize: 16,
          color: "#ff6b35",
          marginBottom: 24,
          lineHeight: 1.5
        }}>
          Get your first STAKE tokens and join the leaderboard today!
        </p>

        <a
          href="https://app.virtuals.io/virtuals/26083"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: "20px 40px",
            background: "linear-gradient(135deg, #ff6b35, #f7931e)",
            color: "#fff",
            fontSize: 18,
            fontWeight: 700,
            textDecoration: "none",
            borderRadius: 16,
            border: "none",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 8px 32px rgba(255,107,53,0.4)",
            transform: "translateY(0)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 12px 40px rgba(255,107,53,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(255,107,53,0.4)";
          }}
        >
          <span style={{ fontSize: 24 }}>🛒</span>
          Buy STAKE Tokens
          <span style={{ fontSize: 16, opacity: 0.8 }}>↗</span>
        </a>
      </div>
    </div>
  );
}

// 포지션 게이지 섹션 컴포넌트
function PositionGaugeSection({ myData, isMobile }: { myData: LeaderboardItem; isMobile: boolean }) {
  // 더미 히스토리 데이터 (7일간 순위 변동)
  const rankingHistory = [
    { day: 'Mon', rank: myData.rank + 3, change: 0 },
    { day: 'Tue', rank: myData.rank + 1, change: 2 },
    { day: 'Wed', rank: myData.rank + 2, change: -1 },
    { day: 'Thu', rank: myData.rank, change: 2 },
    { day: 'Fri', rank: myData.rank - 1, change: -1 },
    { day: 'Sat', rank: myData.rank + 1, change: 1 },
    { day: 'Today', rank: myData.rank, change: -1 }
  ];

  // 전체 대비 위치 계산
  const totalUsers = 1247; // 더미 전체 사용자 수
  const percentilePosition = ((totalUsers - myData.rank) / totalUsers) * 100;
  
  // 최근 7일 평균 변동
  const avgChange = rankingHistory.reduce((sum, day) => sum + Math.abs(day.change), 0) / 7;
  const trendDirection = rankingHistory[rankingHistory.length - 1].rank < rankingHistory[0].rank ? 'up' : 'down';

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 20,
      padding: isMobile ? "24px" : "32px",
      marginBottom: 24
    }}>
      {/* 헤더 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 32
      }}>
        <h2 style={{
          fontSize: isMobile ? 20 : 24,
          fontWeight: 800,
          color: "#fff",
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          📊 Position Analysis
        </h2>
        <div style={{
          fontSize: 12,
          background: trendDirection === 'up' ? "rgba(74,222,128,0.2)" : "rgba(239,68,68,0.2)",
          color: trendDirection === 'up' ? "#4ade80" : "#ef4444",
          padding: "4px 12px",
          borderRadius: 8,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 4
        }}>
          {trendDirection === 'up' ? '📈' : '📉'} 
          {trendDirection === 'up' ? 'Rising' : 'Falling'}
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: 24
      }}>
        {/* 전체 대비 위치 게이지 */}
        <div style={{
          background: "rgba(74,222,128,0.05)",
          border: "1px solid rgba(74,222,128,0.2)",
          borderRadius: 16,
          padding: 24
        }}>
          <h3 style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#4ade80",
            margin: "0 0 20px 0",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            🎯 Global Position
          </h3>

          {/* 원형 게이지 */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 20
          }}>
            <div style={{
              position: "relative",
              width: 120,
              height: 120,
              marginBottom: 16
            }}>
              {/* 배경 원 */}
              <svg width="120" height="120" style={{ position: "absolute" }}>
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="8"
                  strokeDasharray={`${percentilePosition * 3.14} 314`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ transition: "stroke-dasharray 1s ease" }}
                />
              </svg>
              
              {/* 중앙 텍스트 */}
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center"
              }}>
                <div style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: "#4ade80"
                }}>
                  {percentilePosition.toFixed(1)}%
                </div>
                <div style={{
                  fontSize: 10,
                  color: "#999",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  Top
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#fff",
                marginBottom: 4
              }}>
                Rank #{myData.rank}
              </div>
              <div style={{
                fontSize: 13,
                color: "#999"
              }}>
                out of {totalUsers.toLocaleString()} stakers
              </div>
            </div>
          </div>

          {/* 위치 상세 정보 */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            fontSize: 12
          }}>
            <div style={{
              background: "rgba(74,222,128,0.1)",
              padding: "8px 12px",
              borderRadius: 8,
              textAlign: "center"
            }}>
              <div style={{ color: "#4ade80", fontWeight: 700 }}>
                {(totalUsers - myData.rank).toLocaleString()}
              </div>
              <div style={{ color: "#999" }}>Users Below</div>
            </div>
            <div style={{
              background: "rgba(239,68,68,0.1)",
              padding: "8px 12px",
              borderRadius: 8,
              textAlign: "center"
            }}>
              <div style={{ color: "#ef4444", fontWeight: 700 }}>
                {(myData.rank - 1).toLocaleString()}
              </div>
              <div style={{ color: "#999" }}>Users Above</div>
            </div>
          </div>
        </div>

        {/* 순위 변동 그래프 */}
        <div style={{
          background: "rgba(139,92,246,0.05)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 16,
          padding: 24
        }}>
          <h3 style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#8b5cf6",
            margin: "0 0 20px 0",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            📈 7-Day Trend
          </h3>

          {/* 미니 차트 */}
          <div style={{
            height: 100,
            display: "flex",
            alignItems: "end",
            justifyContent: "space-between",
            marginBottom: 20,
            padding: "0 8px"
          }}>
            {rankingHistory.map((day, index) => {
              const maxRank = Math.max(...rankingHistory.map(d => d.rank));
              const minRank = Math.min(...rankingHistory.map(d => d.rank));
              const range = maxRank - minRank || 1;
              const height = 80 - ((day.rank - minRank) / range) * 60;
              
              return (
                <div key={day.day} style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8
                }}>
                  <div style={{
                    width: 20,
                    height: Math.max(height, 10),
                    background: index === rankingHistory.length - 1 
                      ? "linear-gradient(180deg, #8b5cf6, #a855f7)" 
                      : "rgba(139,92,246,0.3)",
                    borderRadius: "4px 4px 0 0",
                    position: "relative"
                  }}>
                    {/* 순위 변동 표시 */}
                    {day.change !== 0 && (
                      <div style={{
                        position: "absolute",
                        top: -8,
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: 10,
                        color: day.change > 0 ? "#ef4444" : "#4ade80"
                      }}>
                        {day.change > 0 ? '↓' : '↑'}
                      </div>
                    )}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: "#999",
                    textAlign: "center",
                    transform: "rotate(-45deg)",
                    transformOrigin: "center"
                  }}>
                    {day.day}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 트렌드 요약 */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            fontSize: 12
          }}>
            <div style={{
              background: "rgba(139,92,246,0.1)",
              padding: "8px 12px",
              borderRadius: 8,
              textAlign: "center"
            }}>
              <div style={{ color: "#8b5cf6", fontWeight: 700 }}>
                ±{avgChange.toFixed(1)}
              </div>
              <div style={{ color: "#999" }}>Avg Daily Change</div>
            </div>
            <div style={{
              background: trendDirection === 'up' 
                ? "rgba(74,222,128,0.1)" 
                : "rgba(239,68,68,0.1)",
              padding: "8px 12px",
              borderRadius: 8,
              textAlign: "center"
            }}>
              <div style={{ 
                color: trendDirection === 'up' ? "#4ade80" : "#ef4444", 
                fontWeight: 700 
              }}>
                {Math.abs(rankingHistory[rankingHistory.length - 1].rank - rankingHistory[0].rank)}
              </div>
              <div style={{ color: "#999" }}>7-Day Change</div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 인사이트 */}
      <div style={{
        marginTop: 24,
        padding: 20,
        background: "rgba(255,255,255,0.02)",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.05)"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12
        }}>
          <span style={{ fontSize: 16 }}>💡</span>
          <h4 style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#fff",
            margin: 0
          }}>
            Position Insights
          </h4>
        </div>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 16,
          fontSize: 13,
          color: "#ccc",
          lineHeight: 1.5
        }}>
          <div>
            <strong style={{ color: "#4ade80" }}>
              You're in the top {percentilePosition.toFixed(0)}%
            </strong> of all stakers. 
            {percentilePosition < 10 ? " You're an elite staker! 🔥" : 
             percentilePosition < 25 ? " You're doing great! 📈" : 
             " Keep climbing to reach the elite tier! 💪"}
          </div>
          <div>
            <strong style={{ color: "#8b5cf6" }}>
              {trendDirection === 'up' ? 'Rising trend' : 'Falling trend'}
            </strong> over the past week. 
            {trendDirection === 'up' ? 
              " Your strategy is working! Keep it up. 🚀" : 
              " Consider increasing your stake to climb back up. 📊"}
          </div>
        </div>
      </div>
    </div>
  );
}

// 등급업 가이드 섹션 컴포넌트
function GradeUpgradeGuide({ myData, isMobile }: { myData: LeaderboardItem; isMobile: boolean }) {
  const currentMultiplier = gradeMultipliers[myData.grade] || 1.0;
  const nextGradeName = nextGrade[myData.grade];
  const nextMultiplier = nextGradeName !== "Max Level" ? gradeMultipliers[nextGradeName] : currentMultiplier;
  
  // 현재 포인트 (스테이킹 × 기간)
  const currentPoints = myData.total_staked * myData.holding_days;
  
  // 다음 등급 조건들 (더미 데이터)
  const upgradeConditions = {
    requiredPoints: currentPoints * 1.8, // 현재의 1.8배
    requiredStaking: myData.total_staked * 1.5, // 현재의 1.5배
    requiredDays: Math.max(60, myData.holding_days + 30), // 최소 60일 또는 +30일
    requiredConsistency: 14 // 14일 연속 보유
  };

  // 진행률 계산
  const pointsProgress = Math.min((currentPoints / upgradeConditions.requiredPoints) * 100, 100);
  const stakingProgress = Math.min((myData.total_staked / upgradeConditions.requiredStaking) * 100, 100);
  const daysProgress = Math.min((myData.holding_days / upgradeConditions.requiredDays) * 100, 100);
  const consistencyProgress = 85; // 더미 일관성 점수

  // 예상 달성 시간 계산
  const pointsNeeded = Math.max(0, upgradeConditions.requiredPoints - currentPoints);
  const stakingNeeded = Math.max(0, upgradeConditions.requiredStaking - myData.total_staked);
  const daysNeeded = Math.max(0, upgradeConditions.requiredDays - myData.holding_days);
  
  // 현재 속도 기준 예상 시간
  const estimatedDays = Math.max(daysNeeded, Math.ceil(pointsNeeded / (myData.total_staked || 1)));

  // 다음 등급이 없는 경우 (최고 등급)
  if (nextGradeName === "Max Level") {
    return (
      <div style={{
        background: "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,193,7,0.08))",
        border: "2px solid rgba(255,215,0,0.3)",
        borderRadius: 20,
        padding: isMobile ? "24px" : "32px",
        textAlign: "center",
        marginBottom: 24
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>👑</div>
        <h2 style={{
          fontSize: isMobile ? 24 : 28,
          fontWeight: 900,
          color: "#ffd700",
          margin: "0 0 12px 0"
        }}>
          Maximum Level Reached!
        </h2>
        <p style={{
          fontSize: 16,
          color: "#ffecb3",
          margin: 0,
          lineHeight: 1.5
        }}>
          Congratulations! You've reached the highest grade. 
          Keep staking to maintain your elite status and earn maximum rewards.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 20,
      padding: isMobile ? "24px" : "32px",
      marginBottom: 24
    }}>
      {/* 헤더 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 32
      }}>
        <h2 style={{
          fontSize: isMobile ? 20 : 24,
          fontWeight: 800,
          color: "#fff",
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          🎯 Grade Upgrade Path
        </h2>
        <div style={{
          fontSize: 12,
          background: "rgba(255,193,7,0.2)",
          color: "#ffc107",
          padding: "4px 12px",
          borderRadius: 8,
          fontWeight: 600
        }}>
          Next: {nextGradeName}
        </div>
      </div>

      {/* 다음 등급 미리보기 */}
      <div style={{
        background: `linear-gradient(135deg, ${tierColors[nextGradeName]}15, ${tierColors[nextGradeName]}08)`,
        border: `1px solid ${tierColors[nextGradeName]}40`,
        borderRadius: 16,
        padding: 24,
        marginBottom: 32,
        display: "flex",
        alignItems: "center",
        gap: 20
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: 16,
          background: `linear-gradient(135deg, ${tierColors[nextGradeName]}, ${tierColors[nextGradeName]}88)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid rgba(255,255,255,0.2)",
          fontSize: 40
        }}>
          {getGradeAvatar(nextGradeName)}
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#fff",
            margin: "0 0 8px 0"
          }}>
            {nextGradeName}
          </h3>
          
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap"
          }}>
            <div style={{
              background: "rgba(255,215,0,0.2)",
              color: "#ffd700",
              padding: "4px 12px",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 700
            }}>
              {nextMultiplier}x Multiplier (+{(nextMultiplier - currentMultiplier).toFixed(1)}x)
            </div>
            
            <div style={{
              fontSize: 14,
              color: "#4ade80",
              fontWeight: 600
            }}>
              {((nextMultiplier - currentMultiplier) / currentMultiplier * 100).toFixed(0)}% more rewards
            </div>
          </div>
        </div>
      </div>

      {/* 달성 조건들 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: 16,
        marginBottom: 24
      }}>
        {/* STAKE Points 조건 */}
        <div style={{
          background: "rgba(74,222,128,0.05)",
          border: "1px solid rgba(74,222,128,0.2)",
          borderRadius: 12,
          padding: 20
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12
          }}>
            <h4 style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#4ade80",
              margin: 0
            }}>
              🥩 STAKE Points
            </h4>
            <span style={{
              fontSize: 12,
              color: pointsProgress >= 100 ? "#4ade80" : "#ffc107",
              fontWeight: 600
            }}>
              {pointsProgress.toFixed(0)}%
            </span>
          </div>

          <div style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#fff",
            marginBottom: 8
          }}>
            {formatLargeNumber(currentPoints)} / {formatLargeNumber(upgradeConditions.requiredPoints)}
          </div>

          {/* 진행률 바 */}
          <div style={{
            width: "100%",
            height: 6,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 3,
            overflow: "hidden",
            marginBottom: 8
          }}>
            <div style={{
              width: `${pointsProgress}%`,
              height: "100%",
              background: pointsProgress >= 100 
                ? "linear-gradient(90deg, #4ade80, #22c55e)"
                : "linear-gradient(90deg, #ffc107, #ff9800)",
              borderRadius: 3,
              transition: "width 0.3s ease"
            }} />
          </div>

          <div style={{
            fontSize: 11,
            color: "#999"
          }}>
            {pointsProgress >= 100 ? "✅ Completed!" : `${formatLargeNumber(pointsNeeded)} more needed`}
          </div>
        </div>

        {/* 스테이킹 수량 조건 */}
        <div style={{
          background: "rgba(139,92,246,0.05)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 12,
          padding: 20
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12
          }}>
            <h4 style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#8b5cf6",
              margin: 0
            }}>
              💰 Staking Amount
            </h4>
            <span style={{
              fontSize: 12,
              color: stakingProgress >= 100 ? "#4ade80" : "#ffc107",
              fontWeight: 600
            }}>
              {stakingProgress.toFixed(0)}%
            </span>
          </div>

          <div style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#fff",
            marginBottom: 8
          }}>
            {formatLargeNumber(myData.total_staked)} / {formatLargeNumber(upgradeConditions.requiredStaking)}
          </div>

          {/* 진행률 바 */}
          <div style={{
            width: "100%",
            height: 6,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 3,
            overflow: "hidden",
            marginBottom: 8
          }}>
            <div style={{
              width: `${stakingProgress}%`,
              height: "100%",
              background: stakingProgress >= 100 
                ? "linear-gradient(90deg, #4ade80, #22c55e)"
                : "linear-gradient(90deg, #8b5cf6, #a855f7)",
              borderRadius: 3,
              transition: "width 0.3s ease"
            }} />
          </div>

          <div style={{
            fontSize: 11,
            color: "#999"
          }}>
            {stakingProgress >= 100 ? "✅ Completed!" : `${formatLargeNumber(stakingNeeded)} more needed`}
          </div>
        </div>

        {/* 보유 기간 조건 */}
        <div style={{
          background: "rgba(34,197,94,0.05)",
          border: "1px solid rgba(34,197,94,0.2)",
          borderRadius: 12,
          padding: 20
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12
          }}>
            <h4 style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#22c55e",
              margin: 0
            }}>
              ⏰ Holding Period
            </h4>
            <span style={{
              fontSize: 12,
              color: daysProgress >= 100 ? "#4ade80" : "#ffc107",
              fontWeight: 600
            }}>
              {daysProgress.toFixed(0)}%
            </span>
          </div>

          <div style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#fff",
            marginBottom: 8
          }}>
            {myData.holding_days} / {upgradeConditions.requiredDays} days
          </div>

          {/* 진행률 바 */}
          <div style={{
            width: "100%",
            height: 6,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 3,
            overflow: "hidden",
            marginBottom: 8
          }}>
            <div style={{
              width: `${daysProgress}%`,
              height: "100%",
              background: daysProgress >= 100 
                ? "linear-gradient(90deg, #4ade80, #22c55e)"
                : "linear-gradient(90deg, #22c55e, #16a34a)",
              borderRadius: 3,
              transition: "width 0.3s ease"
            }} />
          </div>

          <div style={{
            fontSize: 11,
            color: "#999"
          }}>
            {daysProgress >= 100 ? "✅ Completed!" : `${daysNeeded} more days`}
          </div>
        </div>

        {/* 일관성 점수 */}
        <div style={{
          background: "rgba(239,68,68,0.05)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 12,
          padding: 20
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12
          }}>
            <h4 style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#ef4444",
              margin: 0
            }}>
              🎯 Consistency
            </h4>
            <span style={{
              fontSize: 12,
              color: consistencyProgress >= 80 ? "#4ade80" : "#ffc107",
              fontWeight: 600
            }}>
              {consistencyProgress}%
            </span>
          </div>

          <div style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#fff",
            marginBottom: 8
          }}>
            12 / {upgradeConditions.requiredConsistency} days
          </div>

          {/* 진행률 바 */}
          <div style={{
            width: "100%",
            height: 6,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 3,
            overflow: "hidden",
            marginBottom: 8
          }}>
            <div style={{
              width: `${consistencyProgress}%`,
              height: "100%",
              background: consistencyProgress >= 80 
                ? "linear-gradient(90deg, #4ade80, #22c55e)"
                : "linear-gradient(90deg, #ef4444, #dc2626)",
              borderRadius: 3,
              transition: "width 0.3s ease"
            }} />
          </div>

          <div style={{
            fontSize: 11,
            color: "#999"
          }}>
            Consecutive holding streak
          </div>
        </div>
      </div>

      {/* 예상 달성 시간 및 혜택 */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,193,7,0.1), rgba(255,152,0,0.05))",
        border: "1px solid rgba(255,193,7,0.2)",
        borderRadius: 16,
        padding: 24
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 24,
          alignItems: "center"
        }}>
          <div>
            <h4 style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#ffc107",
              margin: "0 0 12px 0",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              ⏱️ Estimated Time to Upgrade
            </h4>
            <div style={{
              fontSize: 24,
              fontWeight: 900,
              color: "#fff",
              marginBottom: 8
            }}>
              {estimatedDays} days
            </div>
            <div style={{
              fontSize: 13,
              color: "#ffcc02",
              opacity: 0.8
            }}>
              Based on current staking rate
            </div>
          </div>

          <div>
            <h4 style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#ffc107",
              margin: "0 0 12px 0",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              💎 Upgrade Benefits
            </h4>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              fontSize: 13,
              color: "#fff"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>⚡</span>
                <span>+{((nextMultiplier - currentMultiplier) / currentMultiplier * 100).toFixed(0)}% reward multiplier</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>🏆</span>
                <span>Higher leaderboard prestige</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>🎁</span>
                <span>Exclusive grade benefits</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 완성된 MyDashboardPage (모든 섹션 포함) ---
function MyDashboardPage({ data, wallet }:{ data: LeaderboardItem[]; wallet: string }) {
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  
  if (!wallet) {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 24 }}>🔒</div>
      <h2 style={{ color: "#fff", marginBottom: 16, fontSize: 24 }}>Connect Your Wallet</h2>
      <p style={{ color: "#999", fontSize: 16, maxWidth: 400, lineHeight: 1.5 }}>Please connect your wallet to view your personal dashboard and staking statistics.</p>
    </div>
  }

  // 연결된 지갑의 데이터 찾기
  const myData = data.find(item => item.address.toLowerCase() === wallet.toLowerCase());
  
  // 데이터가 없으면 빈 대시보드 표시
  if (!myData) {
    return <EmptyDashboard wallet={wallet} isMobile={isMobile} />;
  }

  // 데이터가 있으면 완전한 대시보드 표시
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1000, margin: "0 auto" }}>
      {/* 등급 메인 카드 */}
      <EnhancedGradeCard myData={myData} isMobile={isMobile} />
      
      {/* 포지션 게이지 섹션 */}
      <PositionGaugeSection myData={myData} isMobile={isMobile} />
      
      {/* 등급업 가이드 섹션 */}
      <GradeUpgradeGuide myData={myData} isMobile={isMobile} />
    </div>
  );
}

// 개선된 StatsPage 컴포넌트 - pages/index.tsx의 StatsPage 함수를 이것으로 교체하세요

// 더미 트렌드 데이터 생성
const generateTrendData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const baseStaking = 45000000;
  const baseUsers = 800;
  
  return days.map((day, index) => {
    const growth = Math.random() * 0.1 + 0.02; // 2-12% 성장
    const stakingAmount = baseStaking * (1 + growth * index);
    const activeUsers = baseUsers + Math.floor(Math.random() * 50 + index * 20);
    
    return {
      day,
      staking: Math.floor(stakingAmount),
      users: activeUsers,
      newStakers: Math.floor(Math.random() * 25 + 15),
      avgStake: Math.floor(stakingAmount / activeUsers)
    };
  });
};

// 등급별 분포 데이터
const gradeDistribution = [
  { grade: 'Genesis OG', count: 45, color: '#4ade80', multiplier: 5.0 },
  { grade: 'Smoke Flexer', count: 12, color: '#22d3ee', multiplier: 4.2 },
  { grade: 'Steak Wizard', count: 67, color: '#818cf8', multiplier: 3.5 },
  { grade: 'Grilluminati', count: 89, color: '#f472b6', multiplier: 3.0 },
  { grade: 'Flame Juggler', count: 156, color: '#fb923c', multiplier: 2.5 },
  { grade: 'Flipstarter', count: 234, color: '#64748b', multiplier: 2.0 },
  { grade: 'Sizzlin\' Noob', count: 298, color: '#475569', multiplier: 1.5 },
  { grade: 'Jeeted', count: 327, color: '#ef4444', multiplier: 1.0 }
];

// 배수별 리워드 분석 데이터
const multiplierAnalysis = gradeDistribution.map(grade => {
  const totalStaked = grade.count * (Math.random() * 2000000 + 500000); // 더미 스테이킹
  const expectedReward = totalStaked * grade.multiplier * 0.001; // 더미 리워드 계산
  
  return {
    grade: grade.grade,
    count: grade.count,
    totalStaked: Math.floor(totalStaked),
    multiplier: grade.multiplier,
    expectedReward: Math.floor(expectedReward),
    avgPerUser: Math.floor(expectedReward / grade.count),
    color: grade.color
  };
});

// 상위 vs 하위 비교 데이터
const tierComparison = [
  {
    tier: 'Top 10%',
    users: 93,
    avgStake: 2450000,
    avgMultiplier: 4.2,
    totalReward: 45600000,
    color: '#4ade80'
  },
  {
    tier: 'Middle 80%',
    users: 744,
    avgStake: 890000,
    avgMultiplier: 2.1,
    totalReward: 32400000,
    color: '#818cf8'
  },
  {
    tier: 'Bottom 10%',
    users: 92,
    avgStake: 156000,
    avgMultiplier: 1.2,
    totalReward: 2100000,
    color: '#ef4444'
  }
];

// 실시간 활동 피드 더미 데이터
const generateActivityFeed = () => {
  const activities = [
    { type: 'rank_up', user: '0x95740c...ae15', from: 2, to: 1, time: '2m ago' },
    { type: 'new_staker', user: '0x8fc1a0...e74', amount: 1250000, time: '5m ago' },
    { type: 'rank_down', user: '0xca0bcd...477', from: 15, to: 18, time: '8m ago' },
    { type: 'big_stake', user: '0x40d258...858', amount: 5000000, time: '12m ago' },
    { type: 'grade_up', user: '0xd7afa0...031', from: 'Flame Juggler', to: 'Grilluminati', time: '15m ago' },
    { type: 'new_staker', user: '0xe302da...332', amount: 850000, time: '18m ago' },
    { type: 'rank_up', user: '0xe5a8be...d28', from: 45, to: 42, time: '22m ago' },
    { type: 'unstake', user: '0x8fc1a0...e74', amount: 750000, time: '25m ago' },
  ];
  
  return activities;
};

// 글로벌 건강도 지표
const healthMetrics = {
  stakingRatio: 78.5, // 전체 토큰 중 스테이킹 비율
  activeRatio: 85.2, // 활성 사용자 비율
  retentionRate: 92.1, // 7일 유지율
  growthRate: 15.7, // 주간 성장률
  diversityIndex: 0.73, // 등급 다양성 지수 (0-1)
  liquidityHealth: 88.9 // 유동성 건강도
};

// 차트 색상 팔레트
const chartColors = {
  primary: '#4ade80',
  secondary: '#818cf8', 
  accent: '#f472b6',
  warning: '#fb923c',
  danger: '#ef4444',
  neutral: '#64748b'
};

// 탭 데이터
const statsTabs = [
  { id: 'overview', label: '📊 Overview', icon: '📊' },
  { id: 'trends', label: '📈 Trends', icon: '📈' },
  { id: 'grades', label: '🏆 Grades', icon: '🏆' },
  { id: 'rewards', label: '💰 Rewards', icon: '💰' },
  { id: 'comparison', label: '⚖️ Compare', icon: '⚖️' },
  { id: 'activity', label: '⚡ Activity', icon: '⚡' },
];

// 개선된 StatsPage 컴포넌트
function StatsPage({ data }: { data: LeaderboardItem[] }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });
  
  const isMobile = windowSize.width < 768;
  const isTablet = windowSize.width < 1024;
  
  // 실제 데이터에서 계산된 통계
  const totalStaked = data.reduce((sum, item) => sum + item.total_staked, 0);
  const activeWallets = data.filter(item => item.total_staked > 0).length;
  const avgStake = totalStaked / (activeWallets || 1);
  const topStaker = data.reduce((max, item) => item.total_staked > max.total_staked ? item : max, data[0]);
  
  // 트렌드 데이터
  const trendData = generateTrendData();
  const activityFeed = generateActivityFeed();

  // 윈도우 리사이즈 핸들러
  useEffect(() => {
    function handleResize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
    if (typeof window !== 'undefined') {
      window.addEventListener("resize", handleResize);
      handleResize();
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // 숫자 포맷팅 함수
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toLocaleString();
  };

  // 탭 렌더링
  const renderTabs = () => (
    <div style={{
      display: 'flex',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: 16,
      padding: 4,
      marginBottom: 32,
      gap: 2,
      overflowX: 'auto',
      flexWrap: isMobile ? 'wrap' : 'nowrap'
    }}>
      {statsTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            flex: isMobile ? '1 1 calc(50% - 4px)' : '1',
            padding: isMobile ? '12px 8px' : '14px 16px',
            background: activeTab === tab.id 
              ? 'rgba(74,222,128,0.15)' 
              : 'transparent',
            border: activeTab === tab.id 
              ? '1px solid rgba(74,222,128,0.3)' 
              : '1px solid transparent',
            borderRadius: 12,
            color: activeTab === tab.id ? '#4ade80' : '#999',
            fontSize: isMobile ? 12 : 14,
            fontWeight: activeTab === tab.id ? 700 : 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? 4 : 8,
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ fontSize: isMobile ? 14 : 16 }}>{tab.icon}</span>
          {!isMobile && <span>{tab.label.split(' ')[1]}</span>}
        </button>
      ))}
    </div>
  );

  // Overview 탭 컨텐츠
  const renderOverview = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 메인 통계 카드들 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : isTablet ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
        gap: 16
      }}>
        <div style={{
          background: 'rgba(74,222,128,0.08)',
          border: '1px solid rgba(74,222,128,0.2)',
          borderRadius: 16,
          padding: 20,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, color: '#4ade80', marginBottom: 8 }}>
            {formatNumber(totalStaked)}
          </div>
          <div style={{ fontSize: isMobile ? 12 : 14, color: '#fff', fontWeight: 600 }}>Total Staked</div>
          <div style={{ fontSize: 10, color: '#4ade80', marginTop: 4 }}>+12.5% this week</div>
        </div>

        <div style={{
          background: 'rgba(129,140,248,0.08)',
          border: '1px solid rgba(129,140,248,0.2)',
          borderRadius: 16,
          padding: 20,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, color: '#818cf8', marginBottom: 8 }}>
            {activeWallets.toLocaleString()}
          </div>
          <div style={{ fontSize: isMobile ? 12 : 14, color: '#fff', fontWeight: 600 }}>Active Stakers</div>
          <div style={{ fontSize: 10, color: '#818cf8', marginTop: 4 }}>+8.3% this week</div>
        </div>

        <div style={{
          background: 'rgba(244,114,182,0.08)',
          border: '1px solid rgba(244,114,182,0.2)',
          borderRadius: 16,
          padding: 20,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, color: '#f472b6', marginBottom: 8 }}>
            {formatNumber(avgStake)}
          </div>
          <div style={{ fontSize: isMobile ? 12 : 14, color: '#fff', fontWeight: 600 }}>Avg Stake</div>
          <div style={{ fontSize: 10, color: '#f472b6', marginTop: 4 }}>+3.7% this week</div>
        </div>

        {!isMobile && (
          <div style={{
            background: 'rgba(251,146,60,0.08)',
            border: '1px solid rgba(251,146,60,0.2)',
            borderRadius: 16,
            padding: 20,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#fb923c', marginBottom: 8 }}>
              {((activeWallets / 1247) * 100).toFixed(1)}%
            </div>
            <div style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>Participation</div>
            <div style={{ fontSize: 10, color: '#fb923c', marginTop: 4 }}>+2.1% this week</div>
          </div>
        )}
      </div>

      {/* 글로벌 건강도 지표 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 24
      }}>
        <h3 style={{
          fontSize: 20,
          fontWeight: 700,
          color: '#fff',
          margin: '0 0 24px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          🌍 Ecosystem Health
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
          gap: 20
        }}>
          {Object.entries(healthMetrics).map(([key, value]) => {
            const labels: Record<string, string> = {
              stakingRatio: 'Staking Ratio',
              activeRatio: 'Active Users',
              retentionRate: 'Retention',
              growthRate: 'Growth Rate',
              diversityIndex: 'Diversity',
              liquidityHealth: 'Liquidity'
            };
            
            const getColor = (val: number) => {
              if (val >= 80) return '#4ade80';
              if (val >= 60) return '#fb923c';
              return '#ef4444';
            };

            return (
              <div key={key} style={{ textAlign: 'center' }}>
                <div style={{
                  width: isMobile ? 60 : 80,
                  height: isMobile ? 60 : 80,
                  borderRadius: '50%',
                  background: `conic-gradient(${getColor(value)} ${value * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  position: 'relative'
                }}>
                  <div style={{
                    width: isMobile ? 45 : 60,
                    height: isMobile ? 45 : 60,
                    borderRadius: '50%',
                    background: '#0a0a0a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMobile ? 12 : 14,
                    fontWeight: 700,
                    color: getColor(value)
                  }}>
                    {value.toFixed(1)}%
                  </div>
                </div>
                <div style={{
                  fontSize: isMobile ? 11 : 13,
                  color: '#fff',
                  fontWeight: 600
                }}>
                  {labels[key]}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Trends 탭 컨텐츠
  const renderTrends = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 스테이킹 트렌드 차트 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 24
      }}>
        <h3 style={{
          fontSize: 20,
          fontWeight: 700,
          color: '#fff',
          margin: '0 0 24px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          📈 Staking Trends (7 Days)
        </h3>

        <div style={{ height: isMobile ? 250 : 300, marginBottom: 20 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="stakingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="day" 
                stroke="#999" 
                fontSize={12}
                tick={{ fill: '#999' }}
              />
              <YAxis 
                stroke="#999" 
                fontSize={12}
                tick={{ fill: '#999' }}
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip 
                contentStyle={{
                  background: 'rgba(0,0,0,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#fff'
                }}
                formatter={(value: any, name: string) => [
                  formatNumber(value),
                  name === 'staking' ? 'Total Staked' : name === 'users' ? 'Active Users' : name
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="staking" 
                stroke="#4ade80" 
                strokeWidth={2}
                fill="url(#stakingGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 트렌드 요약 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: 16
        }}>
          {[
            { label: 'Peak Day', value: 'Friday', color: '#4ade80' },
            { label: 'Growth Rate', value: '+15.7%', color: '#4ade80' },
            { label: 'New Stakers', value: '147', color: '#818cf8' },
            { label: 'Avg Daily', value: formatNumber(trendData[trendData.length - 1].staking), color: '#f472b6' }
          ].map((item, index) => (
            <div key={index} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 12,
              padding: 16,
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: isMobile ? 14 : 16,
                fontWeight: 700,
                color: item.color,
                marginBottom: 4
              }}>
                {item.value}
              </div>
              <div style={{
                fontSize: 11,
                color: '#999'
              }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Grades 탭 컨텐츠
  const renderGrades = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 등급별 분포 차트 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 24
      }}>
        {/* 도넛 차트 */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          padding: 24
        }}>
          <h3 style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#fff',
            margin: '0 0 24px 0',
            textAlign: 'center'
          }}>
            🏆 Grade Distribution
          </h3>

          <div style={{ height: isMobile ? 250 : 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 40 : 60}
                  outerRadius={isMobile ? 80 : 120}
                  paddingAngle={2}
                  dataKey="count"
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    background: 'rgba(0,0,0,0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    color: '#fff'
                  }}
                  formatter={(value: any, name: string) => [value, 'Users']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 등급별 상세 리스트 */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          padding: 24
        }}>
          <h3 style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#fff',
            margin: '0 0 24px 0'
          }}>
            📊 Grade Details
          </h3>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            maxHeight: isMobile ? 250 : 300,
            overflowY: 'auto'
          }}>
            {gradeDistribution.map((grade, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 12
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <div style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: grade.color
                  }} />
                  <div>
                    <div style={{
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 600,
                      color: '#fff'
                    }}>
                      {grade.grade}
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: grade.color
                    }}>
                      {grade.multiplier}x multiplier
                    </div>
                  </div>
                </div>
                <div style={{
                  textAlign: 'right'
                }}>
                  <div style={{
                    fontSize: isMobile ? 14 : 16,
                    fontWeight: 700,
                    color: '#fff'
                  }}>
                    {grade.count}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: '#999'
                  }}>
                    {((grade.count / gradeDistribution.reduce((sum, g) => sum + g.count, 0)) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Rewards 탭 컨텐츠  
  const renderRewards = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 배수별 리워드 분석 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 24
      }}>
        <h3 style={{
          fontSize: 20,
          fontWeight: 700,
          color: '#fff',
          margin: '0 0 24px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          💰 Multiplier Reward Analysis
        </h3>

        <div style={{ height: isMobile ? 250 : 350, marginBottom: 20 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={multiplierAnalysis} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="grade" 
                stroke="#999" 
                fontSize={10}
                tick={{ fill: '#999' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#999" 
                fontSize={12}
                tick={{ fill: '#999' }}
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip 
                contentStyle={{
                  background: 'rgba(0,0,0,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#fff'
                }}
                formatter={(value: any, name: string) => [
                  formatNumber(value),
                  name === 'expectedReward' ? 'Expected Reward' : name
                ]}
              />
              <Bar 
                dataKey="expectedReward" 
                fill="#4ade80"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 리워드 요약 통계 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: 16
        }}>
          {[
            { 
              label: 'Total Rewards', 
              value: formatNumber(multiplierAnalysis.reduce((sum, item) => sum + item.expectedReward, 0)),
              color: '#4ade80' 
            },
            { 
              label: 'Highest Multiplier', 
              value: `${Math.max(...multiplierAnalysis.map(item => item.multiplier))}x`,
              color: '#fb923c' 
            },
            { 
              label: 'Avg Per User', 
              value: formatNumber(multiplierAnalysis.reduce((sum, item) => sum + item.avgPerUser, 0) / multiplierAnalysis.length),
              color: '#818cf8' 
            },
            { 
              label: 'Top Grade Bonus', 
              value: '+400%',
              color: '#f472b6' 
            }
          ].map((item, index) => (
            <div key={index} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 12,
              padding: 16,
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: isMobile ? 14 : 16,
                fontWeight: 700,
                color: item.color,
                marginBottom: 4
              }}>
                {item.value}
              </div>
              <div style={{
                fontSize: 11,
                color: '#999'
              }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Comparison 탭 컨텐츠
  const renderComparison = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 상위 vs 하위 비교 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 24
      }}>
        <h3 style={{
          fontSize: 20,
          fontWeight: 700,
          color: '#fff',
          margin: '0 0 24px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          ⚖️ Tier Comparison Analysis
        </h3>

        {/* 비교 차트 */}
        <div style={{ height: isMobile ? 250 : 300, marginBottom: 24 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tierComparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="tier" 
                stroke="#999" 
                fontSize={12}
                tick={{ fill: '#999' }}
              />
              <YAxis 
                stroke="#999" 
                fontSize={12}
                tick={{ fill: '#999' }}
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip 
                contentStyle={{
                  background: 'rgba(0,0,0,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#fff'
                }}
                formatter={(value: any, name: string) => [
                  formatNumber(value),
                  name === 'avgStake' ? 'Avg Stake' : 
                  name === 'totalReward' ? 'Total Reward' : name
                ]}
              />
              <Bar dataKey="avgStake" fill="#4ade80" radius={[2, 2, 0, 0]} />
              <Bar dataKey="totalReward" fill="#818cf8" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 비교 상세 카드들 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: 16
        }}>
          {tierComparison.map((tier, index) => (
            <div key={index} style={{
              background: `${tier.color}15`,
              border: `1px solid ${tier.color}40`,
              borderRadius: 16,
              padding: 20
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16
              }}>
                <h4 style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: tier.color,
                  margin: 0
                }}>
                  {tier.tier}
                </h4>
                <div style={{
                  fontSize: 18,
                  color: tier.color
                }}>
                  {index === 0 ? '👑' : index === 1 ? '🎯' : '🔽'}
                </div>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: 12, color: '#999' }}>Users</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                    {tier.users.toLocaleString()}
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: 12, color: '#999' }}>Avg Stake</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                    {formatNumber(tier.avgStake)}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: 12, color: '#999' }}>Avg Multiplier</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: tier.color }}>
                    {tier.avgMultiplier}x
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: 12, color: '#999' }}>Total Reward</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                    {formatNumber(tier.totalReward)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Activity 탭 컨텐츠
  const renderActivity = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 실시간 활동 피드 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 24
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24
        }}>
          <h3 style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#fff',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            ⚡ Live Activity Feed
          </h3>
          <div style={{
            fontSize: 12,
            background: 'rgba(74,222,128,0.2)',
            color: '#4ade80',
            padding: '4px 8px',
            borderRadius: 6,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <div style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#4ade80',
              animation: 'pulse 2s infinite'
            }} />
            Live
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          maxHeight: 400,
          overflowY: 'auto'
        }}>
          {activityFeed.map((activity, index) => {
            const getActivityIcon = (type: string) => {
              switch(type) {
                case 'rank_up': return '📈';
                case 'rank_down': return '📉';
                case 'new_staker': return '🆕';
                case 'big_stake': return '💎';
                case 'grade_up': return '⬆️';
                case 'unstake': return '📤';
                default: return '⚡';
              }
            };

            const getActivityColor = (type: string) => {
              switch(type) {
                case 'rank_up': return '#4ade80';
                case 'rank_down': return '#ef4444';
                case 'new_staker': return '#818cf8';
                case 'big_stake': return '#f472b6';
                case 'grade_up': return '#fb923c';
                case 'unstake': return '#64748b';
                default: return '#999';
              }
            };

            const getActivityText = (activity: any) => {
              switch(activity.type) {
                case 'rank_up':
                  return `moved up from #${activity.from} to #${activity.to}`;
                case 'rank_down':
                  return `dropped from #${activity.from} to #${activity.to}`;
                case 'new_staker':
                  return `staked ${formatNumber(activity.amount)} STAKE`;
                case 'big_stake':
                  return `made a big stake of ${formatNumber(activity.amount)} STAKE`;
                case 'grade_up':
                  return `upgraded from ${activity.from} to ${activity.to}`;
                case 'unstake':
                  return `unstaked ${formatNumber(activity.amount)} STAKE`;
                default:
                  return 'performed an action';
              }
            };

            return (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 12,
                transition: 'all 0.2s'
              }}>
                <div style={{
                  fontSize: 20,
                  marginRight: 12
                }}>
                  {getActivityIcon(activity.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: isMobile ? 13 : 14,
                    color: '#fff',
                    marginBottom: 2
                  }}>
                    <span style={{
                      fontFamily: 'monospace',
                      color: getActivityColor(activity.type),
                      fontWeight: 600
                    }}>
                      {activity.user}
                    </span>
                    {' '}
                    <span style={{ color: '#ccc' }}>
                      {getActivityText(activity)}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: '#666'
                  }}>
                    {activity.time}
                  </div>
                </div>

                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: getActivityColor(activity.type),
                  opacity: 0.7
                }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // 현재 탭에 따른 컨텐츠 렌더링
  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview': return renderOverview();
      case 'trends': return renderTrends();
      case 'grades': return renderGrades();
      case 'rewards': return renderRewards();
      case 'comparison': return renderComparison();
      case 'activity': return renderActivity();
      default: return renderOverview();
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 24, 
      maxWidth: 1400, 
      margin: '0 auto',
      padding: isMobile ? '0' : '0 20px'
    }}>
      {/* 페이지 헤더 */}
      <div style={{ 
        textAlign: 'center',
        marginBottom: 16
      }}>
        <h1 style={{ 
          fontSize: isMobile ? 24 : 32, 
          fontWeight: 900, 
          color: '#fff', 
          margin: '0 0 8px 0',
          background: 'linear-gradient(135deg, #4ade80, #22c55e)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          📊 Advanced Analytics
        </h1>
        <p style={{
          fontSize: isMobile ? 14 : 16,
          color: '#999',
          margin: 0
        }}>
          Deep insights into the STAKE ecosystem
        </p>
      </div>

      {/* 탭 네비게이션 */}
      {renderTabs()}

      {/* 탭 컨텐츠 */}
      {renderTabContent()}
    </div>
  );
}

// 2. 카운트다운 훅 (useEffect 임포트 필요)
function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
          total: difference
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

// 3. 페이즈 진행바 컴포넌트 (기존 함수들 대신 추가)
function PhaseProgressBar({ 
  currentPhase = 1, 
  totalPhases = 6, 
  onPhaseClick,
  isMobile 
}: { 
  currentPhase?: number; 
  totalPhases?: number; 
  onPhaseClick?: (phase: number) => void;
  isMobile: boolean;
}) {
  const buttonSize = isMobile ? 14 : 18;
  const gap = isMobile ? 3 : 4;
  const connectorWidth = isMobile ? 8 : 12;
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? 8 : 12,
      background: 'rgba(74,222,128,0.12)',
      border: '1px solid rgba(74,222,128,0.25)',
      borderRadius: 12,
      padding: isMobile ? '6px 12px' : '8px 16px',
      fontSize: isMobile ? 11 : 13,
      fontWeight: 600,
      minWidth: isMobile ? 'auto' : 320,
      width: isMobile ? '100%' : 'auto',
      justifyContent: isMobile ? 'center' : 'flex-start',
    }}>
      <span style={{ fontSize: isMobile ? 12 : 14 }}>📊</span>
      <span style={{ color: '#4ade80' }}>Phase</span>
      
      {/* 페이즈 진행바 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap,
      }}>
        {Array.from({ length: totalPhases }, (_, index) => {
          const phase = index + 1;
          const isActive = phase === currentPhase;
          const isCompleted = phase < currentPhase;
          const isUpcoming = phase > currentPhase;
          
          return (
            <React.Fragment key={phase}>
              <button
                onClick={() => onPhaseClick?.(phase)}
                style={{
                  width: buttonSize,
                  height: buttonSize,
                  borderRadius: '50%',
                  border: 'none',
                  cursor: isUpcoming ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  fontSize: isMobile ? 7 : 9,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  
                  background: isActive 
                    ? 'linear-gradient(135deg, #4ade80, #22c55e)'
                    : isCompleted 
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'rgba(107,114,128,0.4)',
                  
                  color: isActive || isCompleted ? '#fff' : '#9ca3af',
                  
                  boxShadow: isActive 
                    ? `0 0 ${isMobile ? 6 : 8}px rgba(74,222,128,0.6)`
                    : 'none',
                    
                  transform: isUpcoming && `scale(${isMobile ? 0.85 : 0.9})`,
                }}
                onMouseEnter={(e) => {
                  if (isUpcoming && !isMobile) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.background = 'rgba(107,114,128,0.6)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isUpcoming && !isMobile) {
                    e.currentTarget.style.transform = 'scale(0.9)';
                    e.currentTarget.style.background = 'rgba(107,114,128,0.4)';
                  }
                }}
              >
                {isCompleted ? '✓' : phase}
              </button>
              
              {phase < totalPhases && (
                <div style={{
                  width: connectorWidth,
                  height: isMobile ? 1.5 : 2,
                  background: phase < currentPhase 
                    ? 'linear-gradient(90deg, #10b981, #22c55e)'
                    : 'rgba(107,114,128,0.4)',
                  borderRadius: 1,
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// 4. 카운트다운 컴포넌트
function PhaseCountdown({ 
  timeLeft, 
  isMobile 
}: { 
  timeLeft: any; 
  isMobile: boolean;
}) {
  if (timeLeft.total <= 0) return null;
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? 6 : 12,
      background: 'rgba(239,68,68,0.12)',
      border: '1px solid rgba(239,68,68,0.25)',
      borderRadius: 12,
      padding: isMobile ? '6px 12px' : '8px 16px',
      fontSize: isMobile ? 11 : 13,
      fontWeight: 600,
      minWidth: isMobile ? 'auto' : 320,
      width: isMobile ? '100%' : 'auto',
      justifyContent: isMobile ? 'center' : 'flex-start',
    }}>
      <span style={{ fontSize: isMobile ? 12 : 14 }}>⚠️</span>
      <span style={{ color: '#ef4444' }}>Phase 1 ends in</span>
      <div style={{
        color: '#fff',
        fontFamily: 'monospace',
        fontWeight: 700,
        fontSize: isMobile ? 11 : 13
      }}>
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {timeLeft.hours.toString().padStart(2, '0')}h {timeLeft.minutes.toString().padStart(2, '0')}m {timeLeft.seconds.toString().padStart(2, '0')}s
      </div>
    </div>
  );
}

// 5. 커밍순 모달 컴포넌트
function ComingSoonModal({ 
  isOpen, 
  onClose, 
  phase, 
  timeLeft,
  isMobile 
}: {
  isOpen: boolean;
  onClose: () => void;
  phase: number;
  timeLeft: any;
  isMobile: boolean;
}) {
  if (!isOpen) return null;
  
  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);
  
  if (isMobile) {
    // 모바일 풀스크린 모달
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 16px',
        overflowY: 'auto'
      }}>
        {/* 모바일 헤더 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 32,
          paddingTop: 20
        }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 900,
            color: '#fff',
            margin: 0
          }}>
            Phase {phase}
          </h2>
          
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#999',
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
        
        {/* 모바일 컨텐츠 */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 60, marginBottom: 24 }}>🚀</div>
          <h1 style={{
            fontSize: 32,
            fontWeight: 900,
            color: '#fff',
            margin: '0 0 12px 0',
            background: 'linear-gradient(135deg, #4ade80, #22c55e)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.2
          }}>
            Coming Soon
          </h1>
          <p style={{
            fontSize: 16,
            color: '#999',
            margin: '0 0 40px 0',
            lineHeight: 1.5,
            maxWidth: 280
          }}>
            Get ready for the next evolution of STAKE
          </p>
          
          {/* 모바일 카운트다운 */}
          <div style={{
            width: '100%',
            maxWidth: 320,
            background: 'linear-gradient(135deg, rgba(74,222,128,0.15), rgba(34,197,94,0.1))',
            border: '2px solid rgba(74,222,128,0.3)',
            borderRadius: 20,
            padding: '28px 20px',
            marginBottom: 32
          }}>
            <div style={{
              fontSize: 14,
              color: '#4ade80',
              marginBottom: 20,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              🕐 Launches in
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
              marginBottom: 16
            }}>
              {[
                { value: timeLeft.days, label: 'DAYS' },
                { value: timeLeft.hours.toString().padStart(2, '0'), label: 'HRS' },
                { value: timeLeft.minutes.toString().padStart(2, '0'), label: 'MIN' },
                { value: timeLeft.seconds.toString().padStart(2, '0'), label: 'SEC' }
              ].map((item, index) => (
                <div key={index} style={{
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: 12,
                  padding: '16px 8px',
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    fontSize: 24, 
                    fontWeight: 900, 
                    color: index === 3 ? '#4ade80' : '#fff',
                    fontFamily: 'monospace',
                    lineHeight: 1
                  }}>
                    {item.value}
                  </div>
                  <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 알림 버튼 */}
          <button style={{
            width: '100%',
            maxWidth: 320,
            padding: '18px 24px',
            background: 'linear-gradient(135deg, #4ade80, #22c55e)',
            border: 'none',
            borderRadius: 16,
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}>
            <span style={{ fontSize: 18 }}>🔔</span>
            <span>Notify Me When Live</span>
          </button>
        </div>
      </div>
    );
  }
  
  // 데스크탑 모달
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.9)',
      backdropFilter: 'blur(12px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1d29 0%, #252833 50%, #1e2028 100%)',
        borderRadius: 24,
        padding: '48px 40px',
        maxWidth: 600,
        width: '100%',
        textAlign: 'center',
        border: '2px solid rgba(255,255,255,0.1)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        position: 'relative'
      }}>
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 24,
            background: 'none',
            border: 'none',
            color: '#999',
            fontSize: 28,
            cursor: 'pointer',
            padding: 4
          }}
        >
          ×
        </button>
        
        <div style={{ fontSize: 64, marginBottom: 24 }}>🚀</div>
        <h2 style={{
          fontSize: 36,
          fontWeight: 900,
          color: '#fff',
          margin: '0 0 16px 0',
          background: 'linear-gradient(135deg, #4ade80, #22c55e)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Phase {phase} Coming Soon
        </h2>
        <p style={{
          fontSize: 18,
          color: '#999',
          margin: '0 0 40px 0',
          lineHeight: 1.5
        }}>
          Get ready for the next phase of STAKE evolution
        </p>
        
        {/* 데스크탑 카운트다운 */}
        <div style={{
          background: 'rgba(74,222,128,0.1)',
          border: '2px solid rgba(74,222,128,0.2)',
          borderRadius: 20,
          padding: 32,
          marginBottom: 40
        }}>
          <div style={{
            fontSize: 16,
            color: '#4ade80',
            marginBottom: 20,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            🕐 Launches in
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 24,
            fontSize: 28,
            fontWeight: 900,
            color: '#fff',
            fontFamily: 'monospace'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, lineHeight: 1 }}>{timeLeft.days}</div>
              <div style={{ fontSize: 14, color: '#999', marginTop: 8 }}>DAYS</div>
            </div>
            <div style={{ fontSize: 40, color: '#4ade80', lineHeight: 1 }}>:</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, lineHeight: 1 }}>{timeLeft.hours.toString().padStart(2, '0')}</div>
              <div style={{ fontSize: 14, color: '#999', marginTop: 8 }}>HOURS</div>
            </div>
            <div style={{ fontSize: 40, color: '#4ade80', lineHeight: 1 }}>:</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, lineHeight: 1 }}>{timeLeft.minutes.toString().padStart(2, '0')}</div>
              <div style={{ fontSize: 14, color: '#999', marginTop: 8 }}>MINUTES</div>
            </div>
          </div>
        </div>
        
        <button style={{
          padding: '20px 32px',
          background: 'linear-gradient(135deg, #4ade80, #22c55e)',
          border: 'none',
          borderRadius: 16,
          color: '#fff',
          fontSize: 18,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          margin: '0 auto'
        }}>
          <span style={{ fontSize: 20 }}>🔔</span>
          <span>Notify Me When Live</span>
        </button>
      </div>
    </div>
  );
}


// --- Home Page ---
export default function Home() {
  const { address: wallet } = useAccount();
  const [data, setData] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<LeaderboardItem | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });
  const [currentPage, setCurrentPage] = useState("leaderboard");
  const isDesktop = windowSize.width >= 1024;
  const isMobile = windowSize.width < 768;

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true); setError(null);
      const response = await axios.get(SHEET_BEST_URL, { timeout: 30000, headers: { 'Content-Type': 'application/json' } });
      if (!response.data) throw new Error('응답 데이터가 없습니다');
      let rawData;
      if (response.data.leaderboard) rawData = response.data.leaderboard;
      else if (Array.isArray(response.data)) rawData = response.data;
      else throw new Error('알 수 없는 데이터 형식');
      if (!Array.isArray(rawData) || rawData.length === 0) throw new Error('유효하지 않은 데이터 배열');
      const transformedData: LeaderboardItem[] = rawData
        .filter((item: any) => item.is_active !== false && Number(item.total_staked) > 0)
        .slice(0, 100)
        .map((item: any, index: number) => ({
          name: item.address ? `${item.address.slice(0, 6)}...${item.address.slice(-4)}` : `Unknown${index}`,
          value: Number(item.airdrop_share_phase) || Math.random() * 2 + 1,
          tier: item.grade || "Sizzlin' Noob",
          change: (Math.random() * 1.5 - 0.5).toFixed(2),
          score: Number(item.time_score) || 0,
          time: Math.round(Number(item.holding_days) || 0) + "d",
          rank: Number(item.rank) || index + 1,
          total_staked: Number(item.total_staked) || 0,
          grade: item.grade || "Sizzlin' Noob",
          percentile: Number(item.percentile) || 100,
          address: item.address || "",
          stake_count: Number(item.stake_count) || 0,
          holding_days: Number(item.holding_days) || 0
        }));
      const totalValue = transformedData.reduce((sum, item) => sum + item.value, 0);
      if (totalValue > 0) transformedData.forEach(item => { item.value = (item.value / totalValue) * 100; });
      setData(transformedData);
    } catch (err: any) {
      setError(err.message); setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
    const interval = setInterval(fetchLeaderboardData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleResize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a0a', color: '#fff', fontSize: 18 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🥩</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>STAKE Leaderboard</div>
          <div style={{ fontSize: 16, color: '#999' }}>Loading live data...</div>
        </div>
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a0a', color: '#fff', fontSize: 18 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>No Data Available</div>
          <div style={{ fontSize: 16, color: '#999', marginBottom: 20 }}>{error || 'Please check leaderboard.json'}</div>
          <button onClick={fetchLeaderboardData} style={{ padding: "12px 24px", background: "#4ade80", color: "#000", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: 700 }}>Retry</button>
        </div>
      </div>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <MyDashboardPage data={data} wallet={wallet || ""} />;
      case "stats":
        return <StatsPage data={data} />;
      case "howto":  // 👈 이 부분 추가
        return <StakeHowToPage />;
      case "leaderboard":
      default:
        return <LeaderboardPage 
          data={data} 
          modal={modal} 
          setModal={setModal} 
          isMobile={isMobile} 
          isDesktop={isDesktop}
        />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      wallet={wallet || ""}
      isMobile={isMobile}
      isDesktop={isDesktop}
    >
      {renderCurrentPage()}
      {modal && <SimpleModal modal={modal} onClose={() => setModal(null)} />}
    </Layout>
  );
}






