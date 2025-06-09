import * as vscode from 'vscode';
import axios from 'axios';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
}

export interface ClaudeResponse {
    content: string;
    usage?: {
        input_tokens: number;
        output_tokens: number;
    };
}

export class ClaudeAPI {
    private readonly baseURL = 'https://api.anthropic.com/v1/messages';
    private readonly apiVersion = '2023-06-01';

    async sendMessage(messages: ChatMessage[], systemPrompt?: string): Promise<ClaudeResponse> {
        const config = vscode.workspace.getConfiguration('claude');
        const apiKey = config.get<string>('apiKey');
        const model = config.get<string>('model') || 'claude-3-5-sonnet-20241022';
        const maxTokens = config.get<number>('maxTokens') || 4096;

        if (!apiKey) {
            throw new Error('Claude API key is not configured. Please run "Claude: Configure API Key" command.');
        }

        try {
            // Prepare messages for Claude API
            const claudeMessages = messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Build request payload
            const requestData: any = {
                model: model,
                max_tokens: maxTokens,
                messages: claudeMessages
            };

            // Add system prompt if provided
            if (systemPrompt) {
                requestData.system = systemPrompt;
            }

            // Make API call
            const response = await axios.post(this.baseURL, requestData, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': this.apiVersion
                },
                timeout: 60000 // 60 second timeout
            });

            // Extract response content
            const content = response.data.content?.[0]?.text || 'No response received';
            
            return {
                content: content,
                usage: response.data.usage
            };

        } catch (error: any) {
            console.error('Claude API Error:', error);
            
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data?.error?.message || 'Unknown API error';
                
                switch (status) {
                    case 401:
                        throw new Error('Invalid API key. Please check your Claude API key configuration.');
                    case 429:
                        throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
                    case 400:
                        throw new Error(`Bad request: ${message}`);
                    case 500:
                        throw new Error('Claude API server error. Please try again later.');
                    default:
                        throw new Error(`Claude API error (${status}): ${message}`);
                }
            } else if (error.code === 'ECONNABORTED') {
                throw new Error('Request timeout. Please check your internet connection and try again.');
            } else {
                throw new Error(`Network error: ${error.message}`);
            }
        }
    }

    async analyzeCode(filePath: string, content: string): Promise<string> {
        const systemPrompt = this.getSTAKESystemPrompt();
        
        const messages: ChatMessage[] = [{
            role: 'user',
            content: `파일을 분석해주세요:

**파일 경로:** ${filePath}
**파일 내용:**
\`\`\`
${content}
\`\`\`

다음 관점에서 분석해주세요:
1. 코드 품질 및 개선점
2. STAKE 프로젝트와의 연관성
3. 성능 최적화 기회
4. 모바일 반응형 고려사항
5. 추천 개선사항

분석 결과를 한국어로 자세히 설명해주세요.`
        }];

        const response = await this.sendMessage(messages, systemPrompt);
        return response.content;
    }

    async generateQuickAction(actionType: string, projectContext: any): Promise<string> {
        const systemPrompt = this.getSTAKESystemPrompt();
        
        const actionPrompts: Record<string, string> = {
            'addReferralChart': `STAKE 프로젝트의 추천인 대시보드에 실시간 성과 차트를 추가해주세요.

요구사항:
- Recharts를 사용한 LineChart 또는 BarChart
- 실시간 데이터 연동
- 모바일 반응형 지원
- STAKE 게이밍 테마 스타일링
- TypeScript 완벽 지원

기존 프로젝트 구조: ${JSON.stringify(projectContext, null, 2)}

완성된 React 컴포넌트 코드와 적용 방법을 제공해주세요.`,

            'fixMobileIssues': `STAKE 프로젝트의 모바일 반응형 이슈를 수정해주세요.

체크할 부분:
- Tailwind CSS 반응형 클래스 최적화
- 터치 친화적 UI (44px 이상 버튼)
- 모바일 네비게이션 개선
- 텍스트 가독성 향상
- 성능 최적화

기존 프로젝트 구조: ${JSON.stringify(projectContext, null, 2)}

수정할 파일들과 구체적인 변경사항을 제시해주세요.`,

            'addNewTier': `STAKE 프로젝트에 새로운 사용자 등급을 추가해주세요.

현재 등급 시스템:
- 🐸 VIRGEN (x0)
- 🆕 SIZZLIN' NOOB (x1.0)
- 🔁 FLIPSTARTER (x1.1)
- 🔥 FLAME JUGGLER (x1.25)
- 🧠 GRILLUMINATI (x1.4)
- 🧙‍♂️ STAKE WIZARD (x1.6)
- 🥩 HEAVY EATER (x1.8)
- 🌌 GENESIS OG (x2.0)

새 등급의 이름, 이모지, 배수, 조건을 제안하고 관련 코드를 업데이트해주세요.`,

            'optimizePerformance': `STAKE 프로젝트의 성능을 최적화해주세요.

최적화 영역:
- React 컴포넌트 메모이제이션
- 불필요한 리렌더링 제거
- 이미지 최적화
- 번들 크기 줄이기
- 실시간 업데이트 최적화

기존 프로젝트 구조: ${JSON.stringify(projectContext, null, 2)}

구체적인 최적화 방안과 코드 변경사항을 제시해주세요.`,

            'syncLeaderboard': `STAKE 프로젝트의 리더보드 동기화를 개선해주세요.

개선 사항:
- 실시간 데이터 업데이트
- 에러 핸들링 강화
- 로딩 상태 개선
- 캐싱 전략 최적화
- 백업 데이터 시스템

현재 데이터 플로우와 개선된 동기화 로직을 제시해주세요.`,

            'deployPreview': `STAKE 프로젝트의 배포 미리보기를 설정해주세요.

설정할 항목:
- Vercel/Netlify 배포 설정
- 환경변수 관리
- 빌드 최적화
- 프리뷰 URL 생성
- 자동 배포 워크플로우

배포 설정 파일과 필요한 스크립트를 생성해주세요.`
        };

        const prompt = actionPrompts[actionType] || `${actionType} 작업을 수행해주세요.`;
        
        const messages: ChatMessage[] = [{
            role: 'user',
            content: prompt
        }];

        const response = await this.sendMessage(messages, systemPrompt);
        return response.content;
    }

    private getSTAKESystemPrompt(): string {
        return `당신은 STAKE 프로젝트 전문 개발 어시스턴트입니다.

STAKE 프로젝트 정보:
- Next.js 13 + TypeScript + Tailwind CSS
- Web3 통합 (RainbowKit + Wagmi)
- 토큰 스테이킹 리더보드 시스템
- 추천인 시스템 및 게이미피케이션
- 8단계 등급 시스템 (VIRGEN → GENESIS OG)
- 실시간 데이터 업데이트 (구글시트 연동)

개발 원칙:
1. 코드 생성 전 항상 사용자 의도 확인
2. 여러 옵션 제시하고 사용자가 선택하게 함
3. 파일 저장 위치와 적용 방법 상세 안내
4. 후속 작업 단계별 가이드 제공
5. 초보자도 이해할 수 있게 친절한 설명

응답 형식:
- 한국어로 자연스럽게 대화
- 코드 블록에는 언어 지정
- 파일 경로 명확히 표시
- 단계별 실행 가이드 포함

항상 사용자의 요구사항을 명확히 파악하고, 최적의 솔루션을 제공하세요.`;
    }
}