// pages/index.tsx
"use client";

import { useEffect, useState } from "react";
import Head from "next/head";
import LeaderboardTable from "../components/LeaderboardTable";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Head>
        <title>STAKE Leaderboard</title>
      </Head>
      <main className="min-h-screen p-4 bg-black text-white">
        {mounted ? <LeaderboardTable /> : <p>Loading leaderboard...</p>}
      </main>
    </>
  );
}
