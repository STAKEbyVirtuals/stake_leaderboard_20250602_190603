import { useState } from "react";
import { LeaderboardItem } from './types';
import { getBackgroundColor, generateSimpleChart } from './utils';

interface TreemapBoxProps {
  item: LeaderboardItem;
  x: number;
  y: number;
  width: number;
  height: number;
  onClick: () => void;
}

export function TreemapBox({ 
  item, 
  x, 
  y, 
  width, 
  height, 
  onClick 
}: TreemapBoxProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // 박스 크기 계산
  const area = width * height;
  const isLarge = area > 15000;
  const isMedium = area > 8000;
  const isSmall = area > 3000;
  
  // 폰트 크기 동적 계산
  const rankSize = isLarge ? 14 : isMedium ? 12 : isSmall ? 10 : 9;
  const percentSize = isLarge ? 28 : isMedium ? 22 : isSmall ? 18 : 14;
  const chartHeight = isLarge ? 40 : isMedium ? 30 : 20;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: width - 2,
        height: height - 2,
        background: getBackgroundColor(item.rank),
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        color: "#ffffff",
        transition: "all 0.2s ease",
        transform: isHovered ? "scale(0.98)" : "scale(1)",
        opacity: isHovered ? 0.9 : 1,
        overflow: "hidden",
        padding: isSmall ? "8px" : "4px"
      }}
    >
      {/* 메인 콘텐츠 영역 */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center"
      }}>
        {/* 순위 표시 */}
        {(isMedium || isLarge) && (
          <div style={{
            fontSize: rankSize,
            fontWeight: 600,
            opacity: 0.8,
            marginBottom: 4
          }}>
            #{item.rank}
          </div>
        )}
        
        {/* 할당률 - 가장 중요한 정보 */}
        <div style={{
          fontSize: percentSize,
          fontWeight: 800,
          lineHeight: 1,
          marginBottom: 4
        }}>
          {item.value.toFixed(1)}%
        </div>
        
        {/* 이름/주소 - 중간 크기 이상에서만 */}
        {isMedium && (
          <div style={{
            fontSize: rankSize - 2,
            opacity: 0.7,
            fontFamily: "monospace",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "90%"
          }}>
            {item.name}
          </div>
        )}
      </div>
      
      {/* 차트 영역 - 하단 고정 */}
      {(isMedium || isLarge) && (
        <div style={{
          width: "100%",
          marginTop: "auto",
          opacity: 0.6
        }}>
          <div dangerouslySetInnerHTML={{ __html: generateSimpleChart(item, chartHeight) }} />
        </div>
      )}
    </div>
  );
}