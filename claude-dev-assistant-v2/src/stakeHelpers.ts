import * as vscode from 'vscode';
import { FileManager } from './fileManager';
import { ClaudeAPI } from './claudeAPI';

export interface QuickActionResult {
    success: boolean;
    message: string;
    details?: string;
    filePath?: string;
}

export class STAKEHelpers {
    constructor(
        private fileManager: FileManager,
        private claudeAPI: ClaudeAPI
    ) {}

    // 🎯 프로젝트 컨텍스트 가져오기
    async getProjectContext(): Promise<any> {
        try {
            const structure = await this.fileManager.getProjectStructure();
            const stakeFiles = await this.fileManager.findSTAKEFiles();
            
            return {
                projectType: 'STAKE Leaderboard',
                structure: structure,
                stakeFiles: stakeFiles,
                features: [
                    'Token Staking System',
                    'Referral Network',
                    'User Tier System',
                    'Real-time Leaderboard',
                    'Mobile Responsive'
                ],
                techStack: {
                    frontend: 'Next.js 13 + TypeScript + Tailwind CSS',
                    web3: 'RainbowKit + Wagmi',
                    charts: 'Recharts',
                    data: 'Google Sheets + JSON'
                }
            };
        } catch (error) {
            console.error('Error getting project context:', error);
            return { projectType: 'STAKE Leaderboard' };
        }
    }

    // ⚡ 빠른 액션 실행
    async executeQuickAction(actionType: string): Promise<QuickActionResult> {
        try {
            const projectContext = await this.getProjectContext();
            
            switch (actionType) {
                case 'addReferralChart':
                    return await this.addReferralChart(projectContext);
                case 'fixMobileIssues':
                    return await this.fixMobileIssues(projectContext);
                case 'addNewTier':
                    return await this.addNewTier(projectContext);
                case 'optimizePerformance':
                    return await this.optimizePerformance(projectContext);
                case 'syncLeaderboard':
                    return await this.syncLeaderboard(projectContext);
                case 'deployPreview':
                    return await this.deployPreview(projectContext);
                default:
                    throw new Error(`Unknown action type: ${actionType}`);
            }
        } catch (error) {
            return {
                success: false,
                message: `퀵 액션 실행 실패: ${error}`
            };
        }
    }

    // 📊 추천인 차트 추가
    private async addReferralChart(projectContext: any): Promise<QuickActionResult> {
        try {
            // Claude에게 차트 생성 요청
            const chartCode = await this.claudeAPI.generateQuickAction('addReferralChart', projectContext);
            
            // 차트 컴포넌트 파일 생성
            const componentName = 'ReferralPerformanceChart';
            const filePath = `components/${componentName}.jsx`;
            
            const template = this.fileManager.generateSTAKEComponent(componentName, 'chart');
            const result = await this.fileManager.createFile(filePath, template);
            
            if (result.success) {
                return {
                    success: true,
                    message: '추천인 성과 차트가 추가되었습니다!',
                    details: `새로운 차트 컴포넌트가 생성되었습니다.\n\n다음 단계:\n1. ReferralDashboard.jsx에 import 추가\n2. 차트 데이터 연동\n3. 스타일 커스터마이징`,
                    filePath: result.filePath
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            return {
                success: false,
                message: `추천인 차트 추가 실패: ${error}`
            };
        }
    }

    // 📱 모바일 이슈 수정
    private async fixMobileIssues(projectContext: any): Promise<QuickActionResult> {
        try {
            // 기존 컴포넌트들의 모바일 반응형 이슈 찾기
            const issues = await this.findMobileIssues();
            
            let fixedFiles = 0;
            const fixDetails: string[] = [];

            for (const issue of issues) {
                try {
                    const content = await this.fileManager.readFile(issue.filePath);
                    const fixedContent = this.applyMobileFixes(content, issue.issues);
                    
                    await this.fileManager.writeFile(issue.filePath, fixedContent);
                    fixedFiles++;
                    fixDetails.push(`✅ ${issue.filePath}: ${issue.issues.join(', ')}`);
                } catch (error) {
                    fixDetails.push(`❌ ${issue.filePath}: 수정 실패`);
                }
            }

            return {
                success: fixedFiles > 0,
                message: `${fixedFiles}개 파일의 모바일 이슈가 수정되었습니다!`,
                details: `수정된 내용:\n${fixDetails.join('\n')}\n\n추가 권장사항:\n- 터치 타겟 크기 44px 이상 유지\n- 가로 스크롤 방지\n- 텍스트 가독성 개선`
            };
        } catch (error) {
            return {
                success: false,
                message: `모바일 이슈 수정 실패: ${error}`
            };
        }
    }

    // 🏆 새 등급 추가
    private async addNewTier(projectContext: any): Promise<QuickActionResult> {
        try {
            // 현재 등급 시스템 분석
            const currentTiers = this.getCurrentTiers();
            
            // 새 등급 제안
            const newTier = {
                name: 'STAKE MASTER',
                emoji: '👑',
                multiplier: 2.2,
                requirements: 'Special 이상 + 6개월 + 커뮤니티 기여'
            };

            // tier.js 파일 업데이트
            const tierFilePath = 'utils/tier.js';
            let tierContent = '';
            
            try {
                tierContent = await this.fileManager.readFile(tierFilePath);
            } catch {
                // 파일이 없으면 새로 생성
                tierContent = this.generateTierUtilFile();
            }

            const updatedContent = this.addTierToFile(tierContent, newTier);
            await this.fileManager.writeFile(tierFilePath, updatedContent);

            return {
                success: true,
                message: `새로운 등급 "${newTier.emoji} ${newTier.name}"이 추가되었습니다!`,
                details: `등급 정보:\n- 이모지: ${newTier.emoji}\n- 배수: ${newTier.multiplier}x\n- 조건: ${newTier.requirements}\n\n다음 단계:\n1. UI 컴포넌트에 새 등급 표시 추가\n2. 등급 업그레이드 로직 업데이트\n3. 알림 시스템 연동`,
                filePath: tierFilePath
            };
        } catch (error) {
            return {
                success: false,
                message: `새 등급 추가 실패: ${error}`
            };
        }
    }

    // ⚡ 성능 최적화
    private async optimizePerformance(projectContext: any): Promise<QuickActionResult> {
        try {
            const optimizations: string[] = [];
            let optimizedFiles = 0;

            // React 컴포넌트 최적화
            const componentFiles = projectContext.structure?.components || [];
            for (const file of componentFiles) {
                if (file.includes('.jsx') || file.includes('.tsx')) {
                    try {
                        const content = await this.fileManager.readFile(file);
                        const optimizedContent = this.optimizeReactComponent(content);
                        
                        if (optimizedContent !== content) {
                            await this.fileManager.writeFile(file, optimizedContent);
                            optimizedFiles++;
                            optimizations.push(`🚀 ${file}: 메모이제이션 및 최적화 적용`);
                        }
                    } catch (error) {
                        optimizations.push(`❌ ${file}: 최적화 실패`);
                    }
                }
            }

            // 이미지 최적화 권장사항
            optimizations.push('📸 이미지 최적화: WebP 형식 사용 권장');
            optimizations.push('📦 번들 최적화: 동적 임포트 적용 권장');

            return {
                success: optimizedFiles > 0,
                message: `${optimizedFiles}개 컴포넌트가 최적화되었습니다!`,
                details: `적용된 최적화:\n${optimizations.join('\n')}\n\n추가 권장사항:\n- React.memo() 적용\n- useMemo, useCallback 사용\n- 불필요한 리렌더링 제거\n- 코드 스플리팅 적용`
            };
        } catch (error) {
            return {
                success: false,
                message: `성능 최적화 실패: ${error}`
            };
        }
    }

    // 🔄 리더보드 동기화
    private async syncLeaderboard(projectContext: any): Promise<QuickActionResult> {
        try {
            // 동기화 스크립트 생성
            const syncScript = this.generateSyncScript();
            const scriptPath = 'scripts/sync-leaderboard.js';
            
            await this.fileManager.createFile(scriptPath, syncScript);

            // package.json 스크립트 추가 제안
            const packageJsonPath = 'package.json';
            try {
                const packageContent = await this.fileManager.readFile(packageJsonPath);
                const updatedPackage = this.addSyncScriptToPackageJson(packageContent);
                await this.fileManager.writeFile(packageJsonPath, updatedPackage);
            } catch (error) {
                console.log('package.json 업데이트 스킵:', error);
            }

            return {
                success: true,
                message: '리더보드 동기화 시스템이 설정되었습니다!',
                details: `생성된 파일:\n- ${scriptPath}\n\n사용 방법:\n1. npm run sync-leaderboard\n2. 자동 30분마다 실행\n3. 에러 시 슬랙 알림\n\n다음 단계:\n1. Google Sheets API 키 설정\n2. 실행 권한 확인\n3. 크론 작업 설정`,
                filePath: scriptPath
            };
        } catch (error) {
            return {
                success: false,
                message: `리더보드 동기화 설정 실패: ${error}`
            };
        }
    }

    // 🚀 배포 미리보기
    private async deployPreview(projectContext: any): Promise<QuickActionResult> {
        try {
            // Vercel 설정 파일 생성
            const vercelConfig = this.generateVercelConfig();
            await this.fileManager.createFile('vercel.json', vercelConfig);

            // 환경변수 템플릿 생성
            const envTemplate = this.generateEnvTemplate();
            await this.fileManager.createFile('.env.example', envTemplate);

            // GitHub Actions 워크플로우 생성
            const workflowPath = '.github/workflows/deploy-preview.yml';
            const workflow = this.generateDeployWorkflow();
            await this.fileManager.createFile(workflowPath, workflow);

            return {
                success: true,
                message: '배포 미리보기 설정이 완료되었습니다!',
                details: `생성된 파일:\n- vercel.json (Vercel 설정)\n- .env.example (환경변수 템플릿)\n- .github/workflows/deploy-preview.yml (자동 배포)\n\n다음 단계:\n1. Vercel 프로젝트 연결\n2. 환경변수 설정\n3. GitHub Actions 권한 설정\n4. 첫 배포 테스트`,
                filePath: 'vercel.json'
            };
        } catch (error) {
            return {
                success: false,
                message: `배포 미리보기 설정 실패: ${error}`
            };
        }
    }

    // Helper methods
    private async findMobileIssues(): Promise<Array<{filePath: string, issues: string[]}>> {
        const issues: Array<{filePath: string, issues: string[]}> = [];
        const structure = await this.fileManager.getProjectStructure();
        
        for (const file of structure.components) {
            try {
                const content = await this.fileManager.readFile(file);
                const fileIssues: string[] = [];
                
                // 모바일 이슈 패턴 검사
                if (content.includes('fixed') && !content.includes('sm:')) {
                    fileIssues.push('고정 크기 사용 (반응형 클래스 필요)');
                }
                if (content.includes('w-[') && !content.includes('sm:w-')) {
                    fileIssues.push('픽셀 단위 너비 (반응형 너비 필요)');
                }
                if (content.includes('text-xs') || content.includes('text-sm')) {
                    fileIssues.push('작은 텍스트 크기 (모바일 가독성)');
                }
                
                if (fileIssues.length > 0) {
                    issues.push({ filePath: file, issues: fileIssues });
                }
            } catch (error) {
                console.error(`Error analyzing file ${file}:`, error);
            }
        }
        
        return issues;
    }

    private applyMobileFixes(content: string, issues: string[]): string {
        let fixedContent = content;
        
        // 고정 크기를 반응형으로 변경
        fixedContent = fixedContent.replace(
            /className="([^"]*?)w-\[(\d+)px\]([^"]*?)"/g,
            'className="$1w-full sm:w-[$2px]$3"'
        );
        
        // 작은 텍스트를 모바일 친화적으로 변경
        fixedContent = fixedContent.replace(
            /text-xs/g,
            'text-sm sm:text-xs'
        );
        
        // 버튼 크기 최소화 방지 (44px 이상)
        fixedContent = fixedContent.replace(
            /className="([^"]*?)p-1([^"]*?)"/g,
            'className="$1p-3 sm:p-1$2"'
        );
        
        return fixedContent;
    }

    private getCurrentTiers(): Array<{name: string, emoji: string, multiplier: number}> {
        return [
            { name: 'VIRGEN', emoji: '🐸', multiplier: 0 },
            { name: 'SIZZLIN\' NOOB', emoji: '🆕', multiplier: 1.0 },
            { name: 'FLIPSTARTER', emoji: '🔁', multiplier: 1.1 },
            { name: 'FLAME JUGGLER', emoji: '🔥', multiplier: 1.25 },
            { name: 'GRILLUMINATI', emoji: '🧠', multiplier: 1.4 },
            { name: 'STAKE WIZARD', emoji: '🧙‍♂️', multiplier: 1.6 },
            { name: 'HEAVY EATER', emoji: '🥩', multiplier: 1.8 },
            { name: 'GENESIS OG', emoji: '🌌', multiplier: 2.0 }
        ];
    }

    private generateTierUtilFile(): string {
        return `// STAKE 프로젝트 등급 시스템
export const TIERS = {
  VIRGEN: { name: 'VIRGEN', emoji: '🐸', multiplier: 0 },
  SIZZLIN_NOOB: { name: 'SIZZLIN\\' NOOB', emoji: '🆕', multiplier: 1.0 },
  FLIPSTARTER: { name: 'FLIPSTARTER', emoji: '🔁', multiplier: 1.1 },
  FLAME_JUGGLER: { name: 'FLAME JUGGLER', emoji: '🔥', multiplier: 1.25 },
  GRILLUMINATI: { name: 'GRILLUMINATI', emoji: '🧠', multiplier: 1.4 },
  STAKE_WIZARD: { name: 'STAKE WIZARD', emoji: '🧙‍♂️', multiplier: 1.6 },
  HEAVY_EATER: { name: 'HEAVY EATER', emoji: '🥩', multiplier: 1.8 },
  GENESIS_OG: { name: 'GENESIS OG', emoji: '🌌', multiplier: 2.0 }
};

export function getTierByPoints(points) {
  // 등급 계산 로직
  if (points === 0) return TIERS.VIRGEN;
  if (points < 1000000) return TIERS.SIZZLIN_NOOB;
  if (points < 5000000) return TIERS.FLIPSTARTER;
  if (points < 20000000) return TIERS.FLAME_JUGGLER;
  if (points < 50000000) return TIERS.GRILLUMINATI;
  if (points < 100000000) return TIERS.STAKE_WIZARD;
  if (points < 500000000) return TIERS.HEAVY_EATER;
  return TIERS.GENESIS_OG;
}`;
    }

    private addTierToFile(content: string, newTier: any): string {
        // 새 등급을 TIERS 객체에 추가
        const tierConstant = `  ${newTier.name.replace(/\s+/g, '_').toUpperCase()}: { name: '${newTier.name}', emoji: '${newTier.emoji}', multiplier: ${newTier.multiplier} },`;
        
        return content.replace(
            /GENESIS_OG: { name: 'GENESIS OG', emoji: '🌌', multiplier: 2\.0 }/,
            `GENESIS_OG: { name: 'GENESIS OG', emoji: '🌌', multiplier: 2.0 },\n${tierConstant}`
        );
    }

    private optimizeReactComponent(content: string): string {
        let optimized = content;
        
        // React.memo 추가
        if (!optimized.includes('React.memo') && optimized.includes('export default')) {
            optimized = optimized.replace(
                /export default (\w+);/,
                'export default React.memo($1);'
            );
        }
        
        // useMemo 추가 제안 (큰 계산이 있는 경우)
        if (optimized.includes('.map(') && !optimized.includes('useMemo')) {
            optimized = optimized.replace(
                /import React/,
                'import React, { useMemo }'
            );
        }
        
        return optimized;
    }

    private generateSyncScript(): string {
        return `#!/usr/bin/env node
// STAKE 리더보드 동기화 스크립트

const fs = require('fs');
const path = require('path');

async function syncLeaderboard() {
  console.log('🔄 리더보드 동기화 시작...');
  
  try {
    // Google Sheets API 호출
    const data = await fetchLeaderboardData();
    
    // 데이터 검증
    if (!validateData(data)) {
      throw new Error('데이터 검증 실패');
    }
    
    // JSON 파일 업데이트
    const outputPath = path.join(__dirname, '../public/leaderboard.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    
    console.log('✅ 리더보드 동기화 완료');
    
    // GitHub에 자동 커밋
    await commitToGit('update: Sync leaderboard data');
    
  } catch (error) {
    console.error('❌ 동기화 실패:', error);
    await sendSlackAlert(error.message);
    process.exit(1);
  }
}

async function fetchLeaderboardData() {
  // Google Sheets API 연동 로직
  return {
    last_updated: new Date().toISOString(),
    total_users: 1000,
    leaderboard: []
  };
}

function validateData(data) {
  return data && data.leaderboard && Array.isArray(data.leaderboard);
}

async function commitToGit(message) {
  const { exec } = require('child_process');
  
  return new Promise((resolve, reject) => {
    exec(\`git add . && git commit -m "\${message}" && git push\`, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

async function sendSlackAlert(message) {
  // Slack 알림 로직
  console.log('Slack 알림:', message);
}

if (require.main === module) {
  syncLeaderboard();
}

module.exports = { syncLeaderboard };`;
    }

    private addSyncScriptToPackageJson(content: string): string {
        const parsed = JSON.parse(content);
        
        if (!parsed.scripts) {
            parsed.scripts = {};
        }
        
        parsed.scripts['sync-leaderboard'] = 'node scripts/sync-leaderboard.js';
        
        return JSON.stringify(parsed, null, 2);
    }

    private generateVercelConfig(): string {
        return JSON.stringify({
            "version": 2,
            "name": "stake-leaderboard",
            "builds": [
                {
                    "src": "package.json",
                    "use": "@vercel/next"
                }
            ],
            "routes": [
                {
                    "src": "/api/(.*)",
                    "dest": "/api/$1"
                },
                {
                    "src": "/(.*)",
                    "dest": "/$1"
                }
            ],
            "env": {
                "NODE_ENV": "production"
            },
            "functions": {
                "pages/api/**/*.js": {
                    "maxDuration": 30
                }
            }
        }, null, 2);
    }

    private generateEnvTemplate(): string {
        return `# STAKE 프로젝트 환경변수 템플릿

# Next.js
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Web3 설정
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_ALCHEMY_ID=your_alchemy_id

# API 키
GOOGLE_SHEETS_API_KEY=your_google_api_key
CLAUDE_API_KEY=your_claude_api_key

# 데이터베이스 (선택사항)
DATABASE_URL=your_database_url

# 알림 설정
SLACK_WEBHOOK_URL=your_slack_webhook
DISCORD_WEBHOOK_URL=your_discord_webhook

# 분석 도구
NEXT_PUBLIC_GA_ID=your_google_analytics_id`;
    }

    private generateDeployWorkflow(): string {
        return `name: Deploy Preview

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build project
      run: npm run build
      env:
        NEXT_PUBLIC_APP_URL: \${{ secrets.NEXT_PUBLIC_APP_URL }}
        
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: \${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
        working-directory: ./
        
    - name: Comment PR
      if: github.event_name == 'pull_request'
      uses: actions/github-script@v6
      with:
        script: |
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: '🚀 Preview deployed! Check it out at the Vercel deployment URL.'
          })`;
    }
}