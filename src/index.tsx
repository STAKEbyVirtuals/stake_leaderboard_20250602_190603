"use client";
import { useEffect, useState } from "react";

// Types and constants - components 폴더에서 import
import { LeaderboardItem, WindowSize } from './components/types';
import { CONSTANTS } from './components/constants';

// API - components 폴더에서 import
import { fetchLeaderboardData } from './components/api';

// Components - components 폴더에서 import
import { Layout } from './components/Layout';
import { LeaderboardPage } from './components/LeaderboardPage';
import { DashboardPage } from './components/DashboardPage';
import { StatsPage } from './components/StatsPage';
import { Modal } from './components/Modal';

export default function Home() {
  const [data, setData] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<LeaderboardItem | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [windowSize, setWindowSize] = useState<WindowSize>({ width: 1200, height: 800 });
  const [currentPage, setCurrentPage] = useState("leaderboard");

  const isDesktop = windowSize.width >= CONSTANTS.DESKTOP_BREAKPOINT;
  const isMobile = windowSize.width < CONSTANTS.MOBILE_BREAKPOINT;

  const handleFetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const transformedData = await fetchLeaderboardData();
      setData(transformedData);
      setLastUpdate(new Date());
      
    } catch (err: any) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = () => {
    const mockAddress = "0x" + Math.random().toString(16).slice(2, 10) + "..." + Math.random().toString(16).slice(2, 6);
    setWallet(mockAddress);
  };

  const disconnectWallet = () => {
    setWallet(null);
  };

  useEffect(() => {
    handleFetchData();
    const interval = setInterval(handleFetchData, CONSTANTS.REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleResize() {
      setWindowSize({ 
        width: window.innerWidth, 
        height: window.innerHeight 
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        height: '100vh', background: '#0a0a0a', color: '#fff', fontSize: 18
      }}>
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
      <div style={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        height: '100vh', background: '#0a0a0a', color: '#fff', fontSize: 18
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>No Data Available</div>
          <div style={{ fontSize: 16, color: '#999', marginBottom: 20 }}>
            {error || 'Please check leaderboard.json'}
          </div>
          <button 
            onClick={handleFetchData}
            style={{
              padding: "12px 24px", background: "#4ade80", color: "#000",
              border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: 700
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage data={data} wallet={wallet} />;
      case "stats":
        return <StatsPage data={data} />;
      case "leaderboard":
      default:
        return (
          <LeaderboardPage 
            data={data} 
            modal={modal} 
            setModal={setModal}
            isMobile={isMobile}
            isDesktop={isDesktop}
          />
        );
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      wallet={wallet}
      onConnectWallet={connectWallet}
      onDisconnectWallet={disconnectWallet}
      isMobile={isMobile}
      isDesktop={isDesktop}
    >
      {renderCurrentPage()}
      
      {modal && (
        <Modal
          modal={modal}
          onClose={() => setModal(null)}
        />
      )}
    </Layout>
  );
}