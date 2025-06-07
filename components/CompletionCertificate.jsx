import React, { useRef, useState, useEffect } from 'react';

const CompletionCertificate = ({ walletAddress, onImageReady }) => {
  const canvasRef = useRef(null);
  const [baseImageLoaded, setBaseImageLoaded] = useState(false);
  const [baseImage, setBaseImage] = useState(null);
  const [logoImage, setLogoImage] = useState(null);
  const [certificateReady, setCertificateReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const mobilePattern = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobile(window.innerWidth < 768 || mobilePattern.test(userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let loadedCount = 0;
    const totalImages = 2;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalImages) {
        setCertificateReady(true);
      }
    };

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      console.log('베이스 이미지 로드 성공');
      setBaseImage(img);
      setBaseImageLoaded(true);
      checkAllLoaded();
    };
    
    img.onerror = () => {
      console.warn('베이스 이미지 로드 실패');
      setBaseImageLoaded(false);
      checkAllLoaded();
    };
    
    img.src = '/images/stake-genesis-promo.jpg';

    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    
    logoImg.onload = () => {
      console.log('로고 이미지 로드 성공');
      setLogoImage(logoImg);
      checkAllLoaded();
    };
    
    logoImg.onerror = () => {
      console.warn('로고 이미지 로드 실패');
      checkAllLoaded();
    };
    
    logoImg.src = '/images/stake-token-logo.png';

    setTimeout(() => {
      if (!certificateReady) {
        console.warn('이미지 로드 타임아웃');
        setCertificateReady(true);
      }
    }, 5000);
  }, [certificateReady]);

  const roundRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const generateCertificate = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = 1024;
    canvas.height = 1600;

    if (baseImageLoaded && baseImage) {
      console.log('홍보 이미지 적용 중');
      ctx.drawImage(baseImage, 0, 64, 1024, 1536);
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 1024, 64);
    } else {
      console.log('폴백 디자인 적용 중');
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 1024, 64);
      
      const gradient = ctx.createLinearGradient(0, 64, 0, 1600);
      gradient.addColorStop(0, '#2c1810');
      gradient.addColorStop(0.5, '#8b4513');
      gradient.addColorStop(1, '#2c1810');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 64, 1024, 1536);

      ctx.fillStyle = '#f97316';
      ctx.font = 'bold 64px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('STAKE GENESIS', 512, 264);
      
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 32px Arial';
      ctx.fillText('LeaderBoard OPEN', 512, 324);
    }

    const overlayGradient = ctx.createLinearGradient(0, 1250, 0, 1600);
    overlayGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    overlayGradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.8)');
    overlayGradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
    ctx.fillStyle = overlayGradient;
    ctx.fillRect(0, 1250, 1024, 350);

    ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
    roundRect(ctx, 25, 1350, 320, 38, 19);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('🏆 EVOLUTION COMPLETE', 35, 1374);

    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Wallet Address:', 25, 1405);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    const walletStart = walletAddress.slice(0, 8);
    const walletEnd = walletAddress.slice(-6);
    const shortWallet = walletStart + '...' + walletEnd;
    ctx.fillText(shortWallet, 25, 1425);
    
    ctx.fillStyle = '#6b7280';
    ctx.font = 'bold 14px Arial';
    const today = new Date();
    const year = today.getFullYear();
    const month = today.toLocaleDateString('en-US', { month: 'long' });
    const day = today.getDate();
    const dateText = 'Completed: ' + month + ' ' + day + ', ' + year;
    ctx.fillText(dateText, 25, 1444);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('50,000', 989, 1375);
    
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 22px Arial';
    ctx.fillText('stSTAKE', 989, 1398);
    
    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('REWARD', 989, 1416);

    const brandingX = 800;
    const brandingY = 1440;
    const certLogoSize = 22;
    
    if (logoImage) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(brandingX, brandingY, certLogoSize, 0, 2 * Math.PI);
      ctx.clip();
      ctx.drawImage(logoImage, brandingX - certLogoSize, brandingY - certLogoSize, certLogoSize * 2, certLogoSize * 2);
      ctx.restore();
      
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(brandingX, brandingY, certLogoSize, 0, 2 * Math.PI);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(brandingX, brandingY, certLogoSize, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('$', brandingX, brandingY + 6);
    }
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    const textX = brandingX + certLogoSize + 10;
    const textY = brandingY + 6;
    ctx.fillText('STAKE by Virtuals', textX, textY);

    const imageDataUrl = canvas.toDataURL('image/png', 0.9);
    if (onImageReady) {
      onImageReady(imageDataUrl);
    }
    
    return imageDataUrl;
  };

  const openTwitterWithImage = () => {
    const line1 = 'GO VIRGEN, YOUNG BOY —';
    const line2 = '$STAKE AND BECOME GENESIS.';
    const line3 = '';
    const line4 = 'Join now — Earn your share of 50,000 stSTAKE!';
    const line5 = '👉(사이트주소)';
    const line6 = '🔗 ' + walletAddress;
    const line7 = '';
    const line8 = '@virtuals_io #STAKE';
    
    const tweetContent = line1 + '\n' + line2 + '\n' + line3 + '\n' + line4 + '\n' + line5 + '\n' + line6 + '\n' + line7 + '\n' + line8;
    const tweetText = encodeURIComponent(tweetContent);
    const tweetUrl = 'https://twitter.com/intent/tweet?text=' + tweetText;
    window.open(tweetUrl, '_blank');
  };

  const downloadAndTweet = () => {
    const imageDataUrl = generateCertificate();
    const link = document.createElement('a');
    const timestamp = Date.now();
    const filename = 'STAKE-Evolution-Certificate-' + timestamp + '.png';
    link.download = filename;
    link.href = imageDataUrl;
    link.click();
    
    setTimeout(() => {
      openTwitterWithImage();
    }, 1000);
  };

  const copyAndTweet = async () => {
    if (isMobile) {
      downloadAndTweet();
      return;
    }

    try {
      const imageDataUrl = generateCertificate();
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      
      alert('Certificate copied to clipboard! Now opening X...');
      
      setTimeout(() => {
        openTwitterWithImage();
      }, 500);
      
    } catch (error) {
      console.error('Copy failed:', error);
      downloadAndTweet();
    }
  };

  if (!certificateReady) {
    return (
      <div className="bg-gray-500/20 border-2 border-gray-500 rounded-xl p-4">
        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
          ⏳ Generating Certificate...
        </h4>
        <div className="animate-pulse bg-gray-600/50 h-32 rounded"></div>
      </div>
    );
  }

  const statusText1 = baseImageLoaded ? 'Official STAKE GENESIS promotional image (1024×1600) with enhanced overlay and spacing!' : 'Custom STAKE branded design (1024×1600) with enhanced overlay and spacing!';
  const statusText2 = baseImageLoaded ? 'Original promotional image applied!' : 'Fallback design active';

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="bg-orange-500/20 border-2 border-orange-500 rounded-xl p-4">
        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
          🎨 Share Your Achievement
        </h4>
        
        <p className="text-gray-300 text-sm mb-4">
          ✅ {statusText1}
        </p>
        
        <div className="space-y-3">
          {isMobile ? (
            <div className="space-y-3">
              <button
                onClick={downloadAndTweet}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-4 rounded-lg transition-colors text-base"
              >
                📱 Download & Open X App
              </button>
              <p className="text-xs text-gray-400 text-center">
                📱 Mobile: Download → Open X app → Attach image → Tweet
              </p>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={downloadAndTweet}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm"
              >
                📥 Download & Tweet
              </button>
              
              <button
                onClick={copyAndTweet}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm"
              >
                📋 Copy & Tweet
              </button>
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-400 space-y-1 mt-3">
          <p>💡 <strong>Enhanced:</strong> Larger text + STAKE by Virtuals branding</p>
          <p>🎨 <strong>Size:</strong> 1024×1600 (Enhanced vertical layout with proper spacing)</p>
          <p>📐 <strong>Status:</strong> {statusText2}</p>
          {isMobile && (
            <p>📱 <strong>Mobile Note:</strong> Clipboard limitations - using download method</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompletionCertificate;