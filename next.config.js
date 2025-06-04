// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 이미지 최적화 설정
  images: {
    // 이미지 포맷 우선순위 (WebP > AVIF > 원본)
    formats: ['image/webp', 'image/avif'],
    
    // 이미지 품질 (1-100, 기본값: 75)
    quality: 85,
    
    // 허용된 이미지 크기들 (responsive에 사용)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    
    // 허용된 이미지 너비들
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // 외부 이미지 도메인 (필요한 경우)
    domains: [
      // 'your-cdn-domain.com',
      // 'another-domain.com'
    ],
    
    // 이미지 로더 (기본값: 'default')
    loader: 'default',
    
    // 이미지 최적화 비활성화 (운영에서는 false 권장)
    unoptimized: false,
    
    // 위험한 허용 패턴 (주의해서 사용)
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // 정적 파일 압축
  compress: true,
  
  // 실험적 기능
  experimental: {
    // 이미지 최적화 개선
    optimizePackageImports: ['lucide-react'],
  },
};

module.exports = nextConfig;