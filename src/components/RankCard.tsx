// components/RankCard.tsx (덮어쓰기 버전)
import React from "react";

// 타입 정의
interface RankCardProps {
  address: string;
  tier: "Rare" | "Medium" | "Medium Rare" | "Well-done" | "Charred";
  sharePercent: number;
  changePercent: number;
  onClick: () => void;
  style?: React.CSSProperties;
}

interface RankDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  tier: string;
  stakeAmount: number;
  stakeDuration: number;
  totalPoints: number;
  sharePercent: number;
  expectedReward: number;
}

// 등급 스타일 매핑
const tierColors: Record<string, string> = {
  Rare: "bg-pink-100 text-pink-800",
  Medium: "bg-yellow-100 text-yellow-800",
  "Medium Rare": "bg-red-100 text-red-800",
  "Well-done": "bg-orange-100 text-orange-800",
  Charred: "bg-gray-200 text-gray-800",
};

// 카드 컴포넌트
const RankCard: React.FC<RankCardProps> = ({ address, tier, sharePercent, changePercent, onClick, style }) => {
  const tierStyle = tierColors[tier];
  const displayAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  const isUp = changePercent >= 0;

  return (
    <div
      onClick={onClick}
      style={style}
      className={`rounded-lg p-3 transition-transform hover:scale-[1.03] cursor-pointer border border-gray-300 ${tierStyle}`}
    >
      <div className="text-[11px] font-bold uppercase tracking-tight mb-1">{tier}</div>
      <div className="font-mono text-[12px] text-gray-700">{displayAddress}</div>
      <div className="text-[20px] font-bold mt-1 mb-1">{sharePercent.toFixed(2)}%</div>
      <div className={`text-[12px] font-semibold ${isUp ? "text-green-600" : "text-red-500"}`}>
        {isUp ? "+" : ""}
        {changePercent.toFixed(2)}%
      </div>
    </div>
  );
};

// 모달 컴포넌트
export const RankDetailModal: React.FC<RankDetailModalProps> = ({
  isOpen,
  onClose,
  address,
  tier,
  stakeAmount,
  stakeDuration,
  totalPoints,
  sharePercent,
  expectedReward,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white text-black p-6 rounded-xl w-96 shadow-xl">
        <h2 className="text-lg font-bold mb-3">Rank Details</h2>
        <ul className="text-[14px] space-y-1">
          <li>
            <strong>Address:</strong> {address}
          </li>
          <li>
            <strong>Tier:</strong> {tier}
          </li>
          <li>
            <strong>Staked:</strong> {stakeAmount?.toLocaleString?.() ?? "-"} STAKE
          </li>
          <li>
            <strong>Duration:</strong> {stakeDuration?.toFixed?.(1) ?? "-"} days
          </li>
          <li>
            <strong>Total Points:</strong> {totalPoints?.toLocaleString?.() ?? "-"}
          </li>
          <li>
            <strong>Share %:</strong> {sharePercent?.toFixed?.(2) ?? "-"}%
          </li>
          <li>
            <strong>Expected Reward:</strong> {expectedReward?.toLocaleString?.() ?? "-"} STAKE
          </li>
        </ul>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default RankCard;
