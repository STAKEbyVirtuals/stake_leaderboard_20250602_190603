import React from 'react';

interface LeaderboardHeaderProps {
  isWalletConnected: boolean;
  walletAddress?: string;
  countdown: string;
  totalPhaseAllocation: number;
  topUserCount: number;
  onConnect: () => void;
}

const LeaderboardHeader: React.FC<LeaderboardHeaderProps> = ({
  isWalletConnected,
  walletAddress,
  countdown,
  totalPhaseAllocation,
  topUserCount,
  onConnect,
}) => {
  const displayAddress =
    walletAddress && walletAddress.length >= 10
      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
      : '';

  return (
    <header className="bg-black text-white w-full p-4 shadow-md flex flex-col sm:flex-row justify-between items-center gap-2">
      <div>
        <h1 className="text-xl font-bold">🥩 STAKE Leaderboard - Phase 1</h1>
        <p className="text-sm text-gray-400">Phase Ends In: <span className="text-green-400 font-mono">{countdown}</span></p>
      </div>
      <div className="flex flex-col sm:items-end">
        <p className="text-sm text-gray-300">Top Rankers: <strong>{topUserCount}</strong></p>
        <p className="text-sm text-gray-300">Total Allocation: <strong>{totalPhaseAllocation}%</strong></p>
        <button
          onClick={onConnect}
          className="mt-2 px-4 py-2 bg-white text-black rounded font-semibold hover:bg-gray-200"
        >
          {isWalletConnected ? displayAddress : 'Connect Wallet'}
        </button>
      </div>
    </header>
  );
};

export default LeaderboardHeader;
