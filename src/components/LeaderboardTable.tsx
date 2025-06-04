"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface LeaderboardEntry {
  rank: string;
  wallet: string;
  total: string;
  status: string;
}

export default function LeaderboardTable() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          "https://api.sheetbest.com/sheets/3e5bb2de-7490-45be-8704-b3c029b53e81"
        );
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch leaderboard data", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto text-white">
      <h1 className="text-3xl font-bold text-center my-6 flex items-center justify-center gap-2">
        <span role="img" aria-label="steak">
          🥩
        </span>
        STAKE Leaderboard
      </h1>
      <table className="w-full border border-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-3 py-2 border">Rank</th>
            <th className="px-3 py-2 border">Wallet</th>
            <th className="px-3 py-2 border">Total STAKE</th>
            <th className="px-3 py-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry, index) => (
            <tr key={index} className="text-center">
              <td className="border px-2 py-1">{entry.rank}</td>
              <td className="border px-2 py-1">{entry.wallet}</td>
              <td className="border px-2 py-1">{entry.total}</td>
              <td className="border px-2 py-1">{entry.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-sm text-gray-400 text-center mt-2">
        Auto-updated every 6 hours. Powered by STAKE.
      </p>
    </div>
  );
}