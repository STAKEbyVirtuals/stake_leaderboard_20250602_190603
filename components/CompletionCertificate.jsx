// components/CompletionCertificate.jsx - 홍보 이미지 + 오버레이 방식
import React, { useRef, useState, useEffect } from 'react';

const CompletionCertificate = ({ walletAddress, onImageReady }) => {
  const canvasRef = useRef(null);
  const [baseImageLoaded, setBaseImageLoaded] = useState(false);
  const [baseImage, setBaseImage] = useState(null);

  // 🖼️ 베이스 이미지 로드
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // CORS 문제 방지
    
    img.onload = () => {
      setBaseImage(img);
      setBaseImageLoaded(true);
      console.log('✅ STAKE GENESIS 원본 이미지 로드 성공!');
    };
    
    img.onerror = () => {
      console.warn('❌ 원본 이미지 로드 실패, 폴백 디자인 사용');
      setBaseImageLoaded(false);
    };
    
    // 🔧 실제 홍보 이미지 경로로 시도
    img.src = '/images/stake-genesis-promo.jpg'; 
    
    // 2초 후에도 로드 안되면 폴백으로 전환
    setTimeout(() => {
      if (!baseImageLoaded) {
        console.warn('⏰ 이미지 로드 타임아웃, 폴백 사용');
        setBaseImageLoaded(false);
      }
    }, 2000);
  }, []);

  // 🎨 증명서 이미지 생성 (오버레이 방식)
  const generateCertificate = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 캔버스 크기 설정 (Twitter 최적 비율 16:9)
    canvas.width = 1200;
    canvas.height = 675;

    if (baseImageLoaded && baseImage) {
      // 🖼️ 베이스 이미지 그리기 (홍보 이미지)
      ctx.drawImage(baseImage, 0, 0, 1200, 675);
    } else {
      // 🎨 폴백: 깔끔한 STAKE 브랜드 디자인
      const gradient = ctx.createLinearGradient(0, 0, 1200, 675);
      gradient.addColorStop(0, '#2c1810');
      gradient.addColorStop(0.5, '#8b4513');
      gradient.addColorStop(1, '#2c1810');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1200, 675);

      // 메인 제목
      ctx.fillStyle = '#f97316';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('STAKE GENESIS', 600, 120);
      
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 36px Arial';
      ctx.fillText('LeaderBoard OPEN', 600, 170);

      // 장식 원들
      const circles = [
        {x: 200, y: 300, r: 40, color: '#4ade80'},
        {x: 600, y: 350, r: 60, color: '#059669', stroke: '#f97316'},
        {x: 1000, y: 300, r: 35, color: '#06b6d4'},
        {x: 300, y: 500, r: 45, color: '#10b981'},
        {x: 900, y: 500, r: 38, color: '#3b82f6'},
        {x: 150, y: 150, r: 12, color: '#ff6b35'},
        {x: 1050, y: 120, r: 15, color: '#dc2626'},
        {x: 200, y: 600, r: 18, color: '#f97316'},
        {x: 1000, y: 580, r: 14, color: '#ef4444'}
      ];

      circles.forEach(circle => {
        ctx.fillStyle = circle.color;
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI);
        ctx.fill();
        
        if (circle.stroke) {
          ctx.strokeStyle = circle.stroke;
          ctx.lineWidth = 4;
          ctx.stroke();
        }
      });
    }

    // 🏷️ 상단 우측 완료 뱃지
    const badgeX = 1050;
    const badgeY = 60;
    const badgeWidth = 140;
    const badgeHeight = 70;
    
    // 뱃지 배경 (반투명)
    ctx.fillStyle = 'rgba(249, 115, 22, 0.95)';
    ctx.roundRect(badgeX - badgeWidth/2, badgeY - badgeHeight/2, badgeWidth, badgeHeight, 10);
    ctx.fill();
    
    // 뱃지 테두리
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 뱃지 텍스트
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('✅ COMPLETED', badgeX, badgeY - 10);
    ctx.font = 'bold 12px Arial';
    ctx.fillText('All 8 Tiers', badgeX, badgeY + 8);

    // 🏆 하단 오버레이 배경
    const overlayGradient = ctx.createLinearGradient(0, 500, 0, 675);
    overlayGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    overlayGradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.7)');
    overlayGradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
    ctx.fillStyle = overlayGradient;
    ctx.fillRect(0, 500, 1200, 175);

    // 🎖️ 완료 뱃지 (하단 좌측)
    ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
    ctx.roundRect(40, 520, 300, 35, 18);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('🏆 EVOLUTION CHALLENGE COMPLETE', 55, 542);

    // 💳 지갑 정보 (하단 좌측)
    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px Arial';
    ctx.fillText('Wallet Address:', 40, 580);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    const shortAddress = `${walletAddress.slice(0, 10)}...${walletAddress.slice(-8)}`;
    ctx.fillText(shortAddress, 40, 600);
    
    // 📅 완료 날짜
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Arial';
    const completionDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    ctx.fillText(`Completed: ${completionDate}`, 40, 620);

    // 💰 보상 정보 (하단 우측)
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('50,000', 1160, 585);
    
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('stSTAKE', 1160, 605);
    
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px Arial';
    ctx.fillText('REWARD', 1160, 620);

    // 🏷️ 해시태그 (하단 중앙)
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('#STAKEEvolution #Web3Gaming', 600, 650);

    // 이미지를 Base64로 변환하여 반환
    const imageDataUrl = canvas.toDataURL('image/png', 0.9);
    if (onImageReady) {
      onImageReady(imageDataUrl);
    }
    
    return imageDataUrl;
  };

  // Canvas roundRect 폴리필 (구형 브라우저 대응)
  if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
      this.beginPath();
      this.moveTo(x + radius, y);
      this.lineTo(x + width - radius, y);
      this.quadraticCurveTo(x + width, y, x + width, y + radius);
      this.lineTo(x + width, y + height - radius);
      this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      this.lineTo(x + radius, y + height);
      this.quadraticCurveTo(x, y + height, x, y + height - radius);
      this.lineTo(x, y + radius);
      this.quadraticCurveTo(x, y, x + radius, y);
      this.closePath();
    };
  }

  // 다운로드 함수
  const downloadCertificate = () => {
    const imageDataUrl = generateCertificate();
    const link = document.createElement('a');
    link.download = `STAKE-Evolution-Certificate-${Date.now()}.png`;
    link.href = imageDataUrl;
    link.click();
  };

  // 클립보드 복사 (모바일 대응)
  const copyCertificate = async () => {
    try {
      const imageDataUrl = generateCertificate();
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      
      alert('Certificate copied to clipboard! You can paste it in your tweet.');
    } catch (error) {
      console.error('Copy failed:', error);
      downloadCertificate(); // 복사 실패시 다운로드로 대체
    }
  };

  return (
    <div className="space-y-4">
      {/* 숨겨진 캔버스 */}
      <canvas 
        ref={canvasRef} 
        className="hidden"
      />
      
      {/* 미리보기 및 다운로드 버튼 - 강제 표시 */}
      <div className="bg-orange-500/20 border-2 border-orange-500 rounded-xl p-4">
        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
          🎨 Personalized Certificate
        </h4>
        
        <p className="text-gray-300 text-sm mb-4">
          Your completion certificate using the official STAKE GENESIS promotional image with personalized overlay!
        </p>
        
        <div className="flex gap-3 mb-3">
          <button
            onClick={downloadCertificate}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm"
          >
            📥 Download Certificate
          </button>
          
          <button
            onClick={copyCertificate}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm"
          >
            📋 Copy to Clipboard
          </button>
        </div>
        
        <div className="text-xs text-gray-400 space-y-1">
          <p>💡 <strong>Features:</strong> STAKE GENESIS branding + your wallet address + completion date</p>
          <p>📱 <strong>Tip:</strong> Copy to clipboard works great on mobile devices!</p>
          <p>🎨 <strong>Status:</strong> Certificate generator ready!</p>
        </div>
      </div>
  </div>
  )
};

export default CompletionCertificate;