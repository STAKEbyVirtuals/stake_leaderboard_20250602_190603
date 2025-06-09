/**
 * @fileoverview 선택된 사용자의 상세 정보를 표시하는 카드 컴포넌트.
 */

import React from 'react';
import { LeaderboardItem } from '../types';
import { formatNumberWithCommas } from '../utils/formatters';
import { getTierAvatar, getRankBadge, predictNextTier } from '../utils/gradeUtils';
import { IMAGE_PATHS } from './constants';

interface UserProfileCardProps {
  user: LeaderboardItem;
  onClose: () => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ user, onClose }) => {
  if (!user) return null; // 사용자가 없으면 렌더링하지 않음

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg my-8 border border-gray-700">
      <h2 className="text-3xl font-bold mb-4 text-white">
        {user.discordUsername || user.walletAddress}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
        <p className="text-lg">Score: <span className="font-semibold">{formatNumberWithCommas(user.score)}</span></p>
        <p className="text-lg flex items-center">
          Tier: <span className="font-semibold mr-2">{user.tier}</span>
          <img src={getTierAvatar(user.tier)} alt={user.tier} className="inline-block w-8 h-8 rounded-full" />
        </p>
        <p className="text-lg flex items-center">
          Rank: <span className="font-semibold mr-2">{user.rank}</span>
          <img src={getRankBadge(user.rank)} alt={`Rank ${user.rank}`} className="inline-block w-8 h-8" />
        </p>
        <p className="text-lg">Grill Power: <span className="font-semibold">{formatNumberWithCommas(user.current_grill_power)}</span></p>
        <p className="text-lg">Staking Amount: <span className="font-semibold">{formatNumberWithCommas(user.staking_amount)}</span></p>
        <p className="text-lg">Total Points: <span className="font-semibold">{formatNumberWithCommas(user.total_points)}</span></p>
        <p className="text-lg">Estimated Next Tier: <span className="font-semibold">{user.estimated_next_tier || predictNextTier(user.tier)}</span></p>
        {/* 필요한 경우 다른 상세 정보 추가 */}
        {user.profileImage && (
          <div className="md:col-span-2 mt-4 text-center">
            <img src={user.profileImage} alt="Profile" className="w-24 h-24 rounded-full mx-auto border-2 border-blue-500" />
          </div>
        )}
      </div>

      {/* TODO: 여기에 사용자별 차트나 추가 정보 컴포넌트 포함 가능 */}

      <button onClick={onClose} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200">
        프로필 닫기
      </button>
    </div>
  );
};

export default UserProfileCard; 