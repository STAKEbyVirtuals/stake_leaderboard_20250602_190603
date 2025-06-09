// src/extension.ts
console.log('🏁 Extension.ts loading started');

import * as vscode from 'vscode';
import axios from 'axios';
import { AutomationManager } from './automationManager';
import * as path from 'path';
import { ChatPanelProvider } from './chatPanel';

console.log('✅ All imports completed');

// Claude API 설정
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// 전역 변수
let automationManager: AutomationManager;
let conversationHistory: Array<{role: string, content: string}> = [];
let projectCache: Map<string, string> = new Map(); // 파일 캐시
let lastProjectUpdate: number = 0;

// 프로젝트 컨텍스트 생성 (최적화 버전)
async function getProjectContext(): Promise<string> {
    const now = Date.now();
    // 5분마다 캐시 갱신
    if (now - lastProjectUpdate < 300000 && projectCache.size > 0) {
        return Array.from(projectCache.values()).join('\n');
    }
    
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return '프로젝트가 열려있지 않습니다.';
    
    const projectName = workspaceFolders[0].name;
    const projectRoot = workspaceFolders[0].uri.fsPath;
    
    let context = `# 🥩 ${projectName} 프로젝트
경로: ${projectRoot}
시간: ${new Date().toLocaleString('ko-KR')}

## 프로젝트 개요
- Next.js 13 + TypeScript + Tailwind CSS
- Web3 (RainbowKit + Wagmi) on Base Chain
- 8단계 등급 시스템 & 6개 페이즈 운영
- 추천인 시스템 (5% + 2% 보너스)
- 실시간 리더보드 & 게이미피케이션

## 현재 작업 상황
- Phase 1 진행중 (2025.06.27 종료 예정)
- Frontend 95% 완성, 실제 데이터 연동 필요
- 그릴온도 & 선물상자 시스템 개발 예정
`;

    try {
        // 프로젝트 구조
        const structure = await getEnhancedProjectStructure();
        context += `\n## 프로젝트 구조\n${structure}\n`;
        
        // package.json 분석
        const packageInfo = await analyzePackageJson();
        context += `\n## 의존성 정보\n${packageInfo}\n`;
        
        // 핵심 컴포넌트 자동 분석
        const components = await analyzeKeyComponents();
        context += `\n## 핵심 컴포넌트 분석\n${components}\n`;
        
        // Git 상태
        const gitStatus = await getGitStatus();
        context += `\n## Git 상태\n${gitStatus}\n`;
        
        // 최근 수정 파일
        const recentFiles = await getRecentlyModifiedFiles();
        context += `\n## 최근 수정 파일\n${recentFiles}\n`;
        
        projectCache.set('main', context);
        lastProjectUpdate = now;
        
    } catch (error) {
        console.error('프로젝트 분석 오류:', error);
    }
    
    return context;
}

// 향상된 프로젝트 구조 분석
async function getEnhancedProjectStructure(): Promise<string> {
    const files = await vscode.workspace.findFiles(
        '**/*.{js,jsx,ts,tsx,json,md,css,scss}',
        '**/node_modules/**',
        2000
    );
    
    const structure = new Map<string, Set<string>>();
    let totalSize = 0;
    
    for (const file of files) {
        const relativePath = vscode.workspace.asRelativePath(file);
        const parts = relativePath.split('/');
        const dir = parts.slice(0, -1).join('/') || '.';
        const fileName = parts[parts.length - 1];
        
        if (!structure.has(dir)) {
            structure.set(dir, new Set());
        }
        structure.get(dir)?.add(fileName);
        
        // 파일 크기 계산
        try {
            const stat = await vscode.workspace.fs.stat(file);
            totalSize += stat.size;
        } catch {}
    }
    
    let result = `총 ${files.length}개 파일 (${(totalSize / 1024 / 1024).toFixed(2)}MB)\n\n`;
    
    // 주요 디렉토리만 표시
    const importantDirs = ['components', 'pages', 'utils', 'styles', 'public', 'python-scripts'];
    
    for (const dir of importantDirs) {
        const files = structure.get(dir);
        if (files && files.size > 0) {
            result += `📁 ${dir}/ (${files.size}개 파일)\n`;
            const fileArray = Array.from(files).sort();
            fileArray.slice(0, 10).forEach(f => {
                const emoji = f.endsWith('.tsx') || f.endsWith('.jsx') ? '⚛️' : 
                            f.endsWith('.css') || f.endsWith('.scss') ? '🎨' :
                            f.endsWith('.json') ? '📋' : '📄';
                result += `  ${emoji} ${f}\n`;
            });
            if (fileArray.length > 10) {
                result += `  ... 외 ${fileArray.length - 10}개\n`;
            }
            result += '\n';
        }
    }
    
    return result;
}

// package.json 상세 분석
async function analyzePackageJson(): Promise<string> {
    try {
        const packageJson = await readProjectFile('package.json');
        if (!packageJson) return 'package.json을 찾을 수 없습니다.';
        
        const pkg = JSON.parse(packageJson);
        let result = '';
        
        // 주요 의존성
        const deps = pkg.dependencies || {};
        const importantDeps = ['react', 'next', '@rainbow-me/rainbowkit', 'wagmi', 'viem', 'tailwindcss'];
        
        result += '### 핵심 의존성\n';
        importantDeps.forEach(dep => {
            if (deps[dep]) {
                result += `- ${dep}: ${deps[dep]}\n`;
            }
        });
        
        // 스크립트
        if (pkg.scripts) {
            result += '\n### 실행 가능한 명령어\n';
            Object.entries(pkg.scripts).forEach(([name, cmd]) => {
                result += `- npm run ${name}: ${cmd}\n`;
            });
        }
        
        return result;
    } catch (error) {
        return '패키지 정보를 읽을 수 없습니다.';
    }
}

// 핵심 컴포넌트 자동 분석
async function analyzeKeyComponents(): Promise<string> {
    const keyComponents = [
        'components/OptimizedIntegratedDashboard.jsx',
        'components/ReferralSystem.jsx',
        'components/CompletionCertificate.jsx',
        'utils/tier.js',
        'utils/pointsCalculation.js'
    ];
    
    let result = '';
    
    for (const compPath of keyComponents) {
        const content = await readProjectFile(compPath);
        if (content) {
            // 컴포넌트 구조 분석
            const analysis = analyzeComponentStructure(content, compPath);
            result += `### ${path.basename(compPath)}\n${analysis}\n\n`;
            
            // 캐시에 저장
            projectCache.set(compPath, content);
        }
    }
    
    return result;
}

// 컴포넌트 구조 분석
function analyzeComponentStructure(content: string, filePath: string): string {
    const lines = content.split('\n');
    let result = '';
    
    // 주요 import 찾기
    const imports = lines.filter(l => l.trim().startsWith('import')).slice(0, 5);
    if (imports.length > 0) {
        result += '- 주요 imports: ' + imports.map(i => {
            const match = i.match(/from ['"](.+)['"]/);
            return match ? match[1] : '';
        }).filter(Boolean).join(', ') + '\n';
    }
    
    // 주요 함수/컴포넌트 찾기
    const functions = lines.filter(l => 
        l.includes('function ') || 
        l.includes('const ') && l.includes(' = ') ||
        l.includes('export ')
    ).slice(0, 10);
    
    if (functions.length > 0) {
        result += '- 주요 함수/컴포넌트: ' + functions.length + '개\n';
    }
    
    // 코드 라인 수
    result += `- 총 ${lines.length}줄\n`;
    
    // React hooks 사용 분석
    const hooks = ['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef'];
    const usedHooks = hooks.filter(hook => content.includes(hook));
    if (usedHooks.length > 0) {
        result += '- 사용된 Hooks: ' + usedHooks.join(', ') + '\n';
    }
    
    return result;
}

// Git 상태 확인
async function getGitStatus(): Promise<string> {
    try {
        const gitExtension = vscode.extensions.getExtension('vscode.git');
        if (!gitExtension) return 'Git 확장이 없습니다.';
        
        const git = gitExtension.exports.getAPI(1);
        const repo = git.repositories[0];
        
        if (!repo) return 'Git 저장소가 없습니다.';
        
        const status = await repo.state;
        const changes = status.workingTreeChanges.length + status.indexChanges.length;
        const branch = status.HEAD?.name || 'unknown';
        
        return `- 현재 브랜치: ${branch}\n- 변경사항: ${changes}개 파일\n`;
    } catch {
        return 'Git 상태를 확인할 수 없습니다.';
    }
}

// 최근 수정된 파일
async function getRecentlyModifiedFiles(): Promise<string> {
    const files = await vscode.workspace.findFiles(
        '**/*.{js,jsx,ts,tsx}',
        '**/node_modules/**',
        20
    );
    
    const fileStats = await Promise.all(
        files.map(async (file) => {
            try {
                const stat = await vscode.workspace.fs.stat(file);
                return {
                    path: vscode.workspace.asRelativePath(file),
                    mtime: stat.mtime
                };
            } catch {
                return null;
            }
        })
    );
    
    const validFiles = fileStats.filter(Boolean) as {path: string, mtime: number}[];
    const sorted = validFiles.sort((a, b) => b.mtime - a.mtime).slice(0, 5);
    
    return sorted.map(f => `- ${f.path} (${new Date(f.mtime).toLocaleString('ko-KR')})`).join('\n');
}

// 프로젝트 파일 읽기 (캐시 포함)
async function readProjectFile(relativePath: string): Promise<string | null> {
    // 캐시 확인
    if (projectCache.has(relativePath)) {
        return projectCache.get(relativePath)!;
    }
    
    try {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) return null;
        
        const uri = vscode.Uri.joinPath(workspaceFolder.uri, relativePath);
        const content = await vscode.workspace.fs.readFile(uri);
        const text = Buffer.from(content).toString('utf8');
        
        // 캐시에 저장
        projectCache.set(relativePath, text);
        
        return text;
    } catch (error) {
        console.log(`파일 읽기 실패: ${relativePath}`);
        return null;
    }
}

// 최적화된 Claude 호출 함수
// 최적화된 Claude 호출 함수
async function askClaude(prompt: string, apiKey: string, replaceSelection: boolean = false) {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Claude가 생각중입니다...",
        cancellable: false
    }, async (progress) => {
        try {
            progress.report({ increment: 30 });
            
            const config = vscode.workspace.getConfiguration('claude');
            const model = config.get<string>('model') || 'claude-opus-4-20250514';
            
            // 프로젝트 컨텍스트
            const projectContext = await getProjectContext();
            
            // 현재 파일 정보 추가
            let currentFileContext = '';
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const fileName = path.basename(editor.document.fileName);
                const fullPath = vscode.workspace.asRelativePath(editor.document.fileName);
                const content = editor.document.getText();
                const selection = editor.selection;
                
                currentFileContext = `\n\n## 현재 작업 파일: ${fileName}
- 경로: ${fullPath}
- 언어: ${editor.document.languageId}
- 총 ${editor.document.lineCount}줄
${selection.isEmpty ? '' : `- 선택된 영역: ${selection.start.line + 1}:${selection.start.character} ~ ${selection.end.line + 1}:${selection.end.character}`}

### 파일 내용 (처음 100줄)
\`\`\`${editor.document.languageId}
${content.split('\n').slice(0, 100).join('\n')}
${content.split('\n').length > 100 ? '\n... (나머지 생략)' : ''}
\`\`\``;
            }
            
            // 관련 파일 자동 감지
            let relatedFiles = '';
            if (prompt.toLowerCase().includes('추천인') || prompt.toLowerCase().includes('referral')) {
                const referralContent = await readProjectFile('components/ReferralSystem.jsx');
                if (referralContent) {
                    relatedFiles += '\n\n### 관련 파일: ReferralSystem.jsx\n```jsx\n' + 
                                   referralContent.split('\n').slice(0, 50).join('\n') + '\n```';
                }
            }
            
            // 대화 히스토리 관리
            conversationHistory.push({role: "user", content: prompt});
            if (conversationHistory.length > 10) {
                conversationHistory = conversationHistory.slice(-10);
            }
            
            // 시스템 프롬프트 준비
            const systemPrompt = `${projectContext}${currentFileContext}${relatedFiles}
                    
당신은 STAKE 프로젝트의 전담 개발자입니다. 다음 규칙을 따르세요:
1. 항상 프로젝트의 기존 코드 스타일과 패턴을 유지
2. TypeScript/React 베스트 프랙티스 적용
3. 모바일 반응형과 Web3 통합 고려
4. 게이밍 스타일 UI (글로우 효과, 애니메이션) 유지
5. 실제 작동하는 완전한 코드 제공
6. 한국어로 친근하게 대화`;
            
            // API 호출
            const response = await axios.post(
                ANTHROPIC_API_URL,
                {
                    model: model,
                    system: systemPrompt,
                    messages: conversationHistory,
                    max_tokens: 4000,
                    temperature: 0.7
                },
                {
                    headers: {
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            progress.report({ increment: 70 });
            
            const claudeResponse = response.data.content[0].text;
            conversationHistory.push({role: "assistant", content: claudeResponse});
            
            // 응답 처리
            if (replaceSelection) {
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    await editor.edit(editBuilder => {
                        editBuilder.replace(editor.selection, claudeResponse);
                    });
                    vscode.window.showInformationMessage('✅ 코드가 수정되었습니다!');
                }
            } else {
                // 코드 블록 감지 및 빠른 적용 버튼 추가
                const codeBlocks = extractCodeBlocks(claudeResponse);
                
                const doc = await vscode.workspace.openTextDocument({
                    content: `# Claude의 응답\n\n${claudeResponse}`,
                    language: 'markdown'
                });
                
                await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
                
                // 코드 블록이 있으면 빠른 적용 옵션 제공
                if (codeBlocks.length > 0) {
                    const action = await vscode.window.showInformationMessage(
                        '코드를 발견했습니다. 어떻게 하시겠습니까?',
                        '현재 파일에 적용',
                        '새 파일 생성',
                        '무시'
                    );
                    
                    if (action === '현재 파일에 적용' && editor) {
                        await editor.edit(editBuilder => {
                            const entireRange = new vscode.Range(
                                editor.document.positionAt(0),
                                editor.document.positionAt(editor.document.getText().length)
                            );
                            editBuilder.replace(entireRange, codeBlocks[0].code);
                        });
                    } else if (action === '새 파일 생성') {
                        const fileName = await vscode.window.showInputBox({
                            prompt: '파일 이름을 입력하세요',
                            placeHolder: 'newComponent.jsx'
                        });
                        if (fileName) {
                            await createFile(fileName, codeBlocks[0].code);
                        }
                    }
                }
            }
            
            progress.report({ increment: 100 });
            
        } catch (error: any) {
            handleApiError(error);
        }
    });
}

// 자동화 실행 (개선된 버전)
async function askClaudeWithAutomation(prompt: string, apiKey: string) {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Claude가 코드를 생성하고 자동화를 실행합니다...",
        cancellable: false
    }, async (progress) => {
        try {
            progress.report({ increment: 20, message: 'Claude에게 요청 중...' });
            
            const projectContext = await getProjectContext();
            const automationPrompt = `
${projectContext}

사용자 요청: ${prompt}

다음 형식으로 정확히 응답해주세요:

FILE_PATH: [파일 경로]
LANGUAGE: [js/jsx/ts/tsx]
DESCRIPTION: [간단한 설명]

CODE:
\`\`\`[언어]
[완전한 코드]
\`\`\`

COMMIT_MESSAGE: [커밋 메시지]
NEXT_STEPS: [다음 단계 제안]
`;
            
            const config = vscode.workspace.getConfiguration('claude');
            const model = config.get<string>('model') || 'claude-opus-4-20250514';
            
            const response = await axios.post(
                ANTHROPIC_API_URL,
                {
                    model: model,
                    messages: [{
                        role: "user",
                        content: automationPrompt
                    }],
                    max_tokens: 8000,
                    temperature: 0.3 // 더 정확한 코드 생성
                },
                {
                    headers: {
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            const claudeResponse = response.data.content[0].text;
            
            progress.report({ increment: 30, message: '응답 분석 중...' });
            
            // 개선된 파싱
            const filePathMatch = claudeResponse.match(/FILE_PATH:\s*(.+)/);
            const codeMatch = claudeResponse.match(/CODE:\s*```[\w]*\n([\s\S]*?)\n```/);
            const commitMatch = claudeResponse.match(/COMMIT_MESSAGE:\s*(.+)/);
            const descriptionMatch = claudeResponse.match(/DESCRIPTION:\s*(.+)/);
            const nextStepsMatch = claudeResponse.match(/NEXT_STEPS:\s*([\s\S]+?)(?=\n\n|$)/);
            
            if (!filePathMatch || !codeMatch) {
                // 파싱 실패시 수동 모드로 전환
                const manualAction = await vscode.window.showWarningMessage(
                    'Claude의 응답을 자동으로 파싱할 수 없습니다.',
                    '수동으로 적용',
                    '다시 시도'
                );
                
                if (manualAction === '다시 시도') {
                    return askClaudeWithAutomation(prompt, apiKey);
                } else {
                    const doc = await vscode.workspace.openTextDocument({
                        content: claudeResponse,
                        language: 'markdown'
                    });
                    await vscode.window.showTextDocument(doc);
                    return;
                }
            }
            
            const filePath = filePathMatch[1].trim();
            const code = codeMatch[1];
            const commitMessage = commitMatch ? commitMatch[1].trim() : `feat: ${prompt.substring(0, 50)}...`;
            const description = descriptionMatch ? descriptionMatch[1].trim() : '';
            const nextSteps = nextStepsMatch ? nextStepsMatch[1].trim() : '';
            
            progress.report({ increment: 20, message: '파일 생성 중...' });
            
            // 미리보기 표시
            const preview = await vscode.window.showInformationMessage(
                `${description}\n\n파일: ${filePath}\n커밋: ${commitMessage}`,
                '실행',
                '미리보기',
                '취소'
            );
            
            if (preview === '취소') return;
            
            if (preview === '미리보기') {
                const doc = await vscode.workspace.openTextDocument({
                    content: code,
                    language: path.extname(filePath).slice(1)
                });
                await vscode.window.showTextDocument(doc);
                
                const confirm = await vscode.window.showInformationMessage(
                    '이 코드를 적용하시겠습니까?',
                    '적용',
                    '취소'
                );
                
                if (confirm !== '적용') return;
            }
            
            // 자동화 실행
            const result = await automationManager.runFullAutomation(
                filePath,
                code,
                commitMessage
            );
            
            if (result.success) {
                progress.report({ increment: 30, message: '완료!' });
                
                // 성공 메시지와 다음 단계 안내
                let successMessage = `✅ 자동화 완료!\n📁 ${filePath}\n💬 ${commitMessage}`;
                if (nextSteps) {
                    successMessage += `\n\n📌 다음 단계:\n${nextSteps}`;
                }
                
                const action = await vscode.window.showInformationMessage(
                    successMessage,
                    '파일 열기',
                    '브라우저 확인',
                    'Git 로그'
                );
                
                if (action === '파일 열기') {
                    const uri = vscode.Uri.file(path.join(vscode.workspace.rootPath || '', filePath));
                    await vscode.window.showTextDocument(uri);
                } else if (action === '브라우저 확인') {
                    vscode.env.openExternal(vscode.Uri.parse('http://localhost:3000'));
                } else if (action === 'Git 로그') {
                    vscode.commands.executeCommand('git.viewHistory');
                }
            } else {
                throw new Error(result.message);
            }
            
        } catch (error: any) {
            handleApiError(error);
        }
    });
}

// 기획 후 개발 모드 (개선된 버전)
async function planAndDevelop(initialRequest: string, apiKey: string) {
    try {
        // 관련 파일 자동 검색
        const relatedFiles = await findRelatedFiles(initialRequest);
        let contextInfo = '';
        
        if (relatedFiles.length > 0) {
            contextInfo = '\n\n## 관련 파일들:\n';
            for (const file of relatedFiles) {
                const content = await readProjectFile(file);
                if (content) {
                    contextInfo += `\n### ${file}\n\`\`\`\n${content.substring(0, 500)}...\n\`\`\`\n`;
                }
            }
        }
        
        // 1단계: 기획 대화
        const planningResponse = await askClaudeForPlanning(initialRequest + contextInfo, apiKey);
        
        // 2단계: 기획서 표시 (향상된 포맷)
        const doc = await vscode.workspace.openTextDocument({
            content: `# 🎯 STAKE 프로젝트 개발 기획서

## 📋 요청사항
${initialRequest}

## 🔍 관련 파일 분석
${relatedFiles.length > 0 ? relatedFiles.join('\n') : '신규 기능'}

## 💡 Claude의 제안
${planningResponse}

---
*생성 시간: ${new Date().toLocaleString('ko-KR')}*`,
            language: 'markdown'
        });
        await vscode.window.showTextDocument(doc);
        
        // 3단계: 대화형 개발
        let continueDiscussion = true;
        const discussionHistory: string[] = [initialRequest];
        
        while (continueDiscussion) {
            const action = await vscode.window.showQuickPick(
                [
                    '💬 더 논의하기',
                    '✅ 개발 시작',
                    '📋 기획서 저장',
                    '🔄 다시 기획',
                    '❌ 취소'
                ],
                {
                    placeHolder: '다음 단계를 선택하세요'
                }
            );
            
            if (action === '💬 더 논의하기') {
                const topics = [
                    '성능 최적화 방안',
                    'UI/UX 개선사항',
                    '보안 고려사항',
                    'Web3 통합 방식',
                    '모바일 대응 전략',
                    '직접 입력...'
                ];
                
                const topic = await vscode.window.showQuickPick(topics, {
                    placeHolder: '논의하고 싶은 주제를 선택하세요'
                });
                
                let additionalInput = topic;
                if (topic === '직접 입력...') {
                    additionalInput = await vscode.window.showInputBox({
                        prompt: '논의하고 싶은 내용을 입력하세요',
                        placeHolder: '예: 실시간 업데이트는 어떻게 구현할까?'
                    });
                }
                
                if (additionalInput && additionalInput !== '직접 입력...') {
                    discussionHistory.push(additionalInput);
                    await askClaude(
                        `이전 논의: ${discussionHistory.join(' → ')}\n\n추가 질문: ${additionalInput}`,
                        apiKey
                    );
                }
                
            } else if (action === '✅ 개발 시작') {
                continueDiscussion = false;
                
                const implementationOptions = [
                    '🚀 전체 자동 구현',
                    '📝 단계별 구현',
                    '🧪 프로토타입 먼저'
                ];
                
                const implChoice = await vscode.window.showQuickPick(implementationOptions, {
                    placeHolder: '구현 방식을 선택하세요'
                });
                
                if (implChoice === '🚀 전체 자동 구현') {
                    const implementPrompt = `
앞서 논의한 기획 내용을 바탕으로 실제 코드를 구현해주세요.

원래 요청: ${initialRequest}
논의 내역: ${discussionHistory.join(' → ')}

다음 요구사항을 반드시 지켜주세요:
1. STAKE 프로젝트의 기존 코드 스타일 유지
2. TypeScript/React 베스트 프랙티스 적용
3. 완전히 작동하는 코드 제공
4. 적절한 주석과 문서화
5. 에러 처리 및 로딩 상태 구현
6. 모바일 반응형 디자인
7. 게이밍 스타일 UI (글로우 효과, 애니메이션)`;
                    
                    await askClaudeWithAutomation(implementPrompt, apiKey);
                    
                } else if (implChoice === '📝 단계별 구현') {
                    // 단계별 구현 가이드 생성
                    const stepsPrompt = `${initialRequest}를 구현하기 위한 단계별 작업 목록을 만들어주세요. 각 단계는 독립적으로 구현/테스트 가능해야 합니다.`;
                    await askClaude(stepsPrompt, apiKey);
                    
                } else if (implChoice === '🧪 프로토타입 먼저') {
                    // 간단한 프로토타입 생성
                    const prototypePrompt = `${initialRequest}의 핵심 기능만 포함된 간단한 프로토타입을 만들어주세요. UI는 기본적인 수준으로, 주요 로직에 집중해주세요.`;
                    await askClaudeWithAutomation(prototypePrompt, apiKey);
                }
                
            } else if (action === '📋 기획서 저장') {
                const fileName = await vscode.window.showInputBox({
                    prompt: '기획서 파일명',
                    value: `docs/plan_${Date.now()}.md`
                });
                
                if (fileName) {
                    await createFile(fileName, doc.getText());
                    vscode.window.showInformationMessage(`✅ 기획서가 ${fileName}에 저장되었습니다.`);
                }
                
            } else if (action === '🔄 다시 기획') {
                await planAndDevelop(initialRequest, apiKey);
                continueDiscussion = false;
                
            } else {
                continueDiscussion = false;
            }
        }
        
    } catch (error: any) {
        handleApiError(error);
    }
}

// 기획용 Claude 호출 (최적화)
async function askClaudeForPlanning(prompt: string, apiKey: string): Promise<string> {
    const projectContext = await getProjectContext();
    const planningPrompt = `
${projectContext}

사용자 요청: ${prompt}

STAKE 프로젝트의 현재 상황을 고려하여 다음 관점에서 상세한 기획을 제공해주세요:

## 1. 기능 개요
- 핵심 목적과 사용자 가치
- 예상 사용 시나리오

## 2. 기술적 구현 방안
- 필요한 컴포넌트 구조
- 상태 관리 전략
- Web3 통합 필요 여부
- 예상 파일 구조

## 3. UI/UX 디자인
- 게이밍 스타일 유지 방안
- 모바일 대응 전략
- 애니메이션 및 인터랙션

## 4. 잠재적 이슈 및 해결책
- 성능 고려사항
- 보안 이슈
- 확장성

## 5. 구현 로드맵
- 단계별 작업 계획
- 예상 소요 시간
- 테스트 전략

구체적이고 실행 가능한 계획을 제시해주세요.`;
    
    const config = vscode.workspace.getConfiguration('claude');
    const model = config.get<string>('model') || 'claude-opus-4-20250514';
    
    const response = await axios.post(
        ANTHROPIC_API_URL,
        {
            model: model,
            messages: [{
                role: "user",
                content: planningPrompt
            }],
            max_tokens: 6000,
            temperature: 0.8
        },
        {
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
            }
        }
    );
    
    return response.data.content[0].text;
}

// 관련 파일 자동 검색
async function findRelatedFiles(query: string): Promise<string[]> {
    const keywords = query.toLowerCase().split(' ');
    const files = await vscode.workspace.findFiles(
        '**/*.{js,jsx,ts,tsx}',
        '**/node_modules/**',
        100
    );
    
    const relevantFiles: Array<{path: string, score: number}> = [];
    
    for (const file of files) {
        const relativePath = vscode.workspace.asRelativePath(file);
        const fileName = path.basename(relativePath).toLowerCase();
        
        let score = 0;
        keywords.forEach(keyword => {
            if (fileName.includes(keyword)) score += 2;
            if (relativePath.toLowerCase().includes(keyword)) score += 1;
        });
        
        if (score > 0) {
            relevantFiles.push({ path: relativePath, score });
        }
    }
    
    return relevantFiles
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(f => f.path);
}

// 코드 블록 추출
function extractCodeBlocks(text: string): Array<{language: string, code: string}> {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks: Array<{language: string, code: string}> = [];
    let match;
    
    while ((match = codeBlockRegex.exec(text)) !== null) {
        blocks.push({
            language: match[1] || 'text',
            code: match[2].trim()
        });
    }
    
    return blocks;
}

// 파일 생성 헬퍼
async function createFile(filePath: string, content: string): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) return;
    
    const fullPath = path.join(workspaceFolder.uri.fsPath, filePath);
    const uri = vscode.Uri.file(fullPath);
    
    // 디렉토리 생성
    const dir = path.dirname(fullPath);
    await vscode.workspace.fs.createDirectory(vscode.Uri.file(dir));
    
    // 파일 작성
    await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
    
    // 파일 열기
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc);
}

// 에러 핸들링
function handleApiError(error: any) {
    let errorMessage = 'Claude API 오류가 발생했습니다.';
    
    if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
            errorMessage = '🔑 API Key가 올바르지 않습니다.';
        } else if (status === 429) {
            errorMessage = '⏱️ API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
        } else if (status === 400) {
            errorMessage = `❌ 잘못된 요청: ${data?.error?.message || '요청 형식을 확인해주세요.'}`;
        } else {
            errorMessage = `⚠️ 오류 (${status}): ${data?.error?.message || error.message}`;
        }
    } else if (error.code === 'ECONNABORTED') {
        errorMessage = '⏱️ 요청 시간이 초과되었습니다. 다시 시도해주세요.';
    } else {
        errorMessage = `❌ 네트워크 오류: ${error.message}`;
    }
    
    vscode.window.showErrorMessage(errorMessage);
    console.error('Claude API Error:', error);
}

// handleError 함수 추가 (activate 함수 밖에)
function handleError(error: any) {
    let errorMessage = 'Claude API 오류가 발생했습니다.';
    
    if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
            errorMessage = '🔑 API Key가 올바르지 않습니다.';
        } else if (status === 429) {
            errorMessage = '⏱️ API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
        } else if (status === 400) {
            errorMessage = `❌ 잘못된 요청: ${data?.error?.message || '요청 형식을 확인해주세요.'}`;
        } else {
            errorMessage = `⚠️ 오류 (${status}): ${data?.error?.message || error.message}`;
        }
    } else if (error.code === 'ECONNABORTED') {
        errorMessage = '⏱️ 요청 시간이 초과되었습니다. 다시 시도해주세요.';
    } else if (error.message) {
        errorMessage = `❌ 오류: ${error.message}`;
    }
    
    vscode.window.showErrorMessage(errorMessage);
    console.error('Claude API Error:', error);
}





// Extension 활성화
// src/extension.ts의 activate 함수 (채팅 패널 통합 버전)

// 상단에 import 추가 필요:
// import { ChatPanelProvider } from './chatPanel';

export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 Claude Dev Assistant is now active!');
    
    try {
        // 자동화 매니저 초기화
        automationManager = new AutomationManager();
        console.log('✅ AutomationManager initialized');
        
        // API 키 확인
        const config = vscode.workspace.getConfiguration('claude');
        let apiKey = config.get<string>('apiKey');
        console.log('🔑 API Key configured:', !!apiKey);
        
        // 🆕 채팅 전용 Claude 함수 (먼저 정의)
        async function askClaudeForChat(prompt: string, apiKey: string, chatProvider: ChatPanelProvider) {
            try {
                const config = vscode.workspace.getConfiguration('claude');
                const model = config.get<string>('model') || 'claude-opus-4-20250514';
                
                const projectContext = await getProjectContext();
                
                // 현재 파일 정보
                let currentFileInfo = '';
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    const fileName = path.basename(editor.document.fileName);
                    const language = editor.document.languageId;
                    const selection = editor.selection;
                    
                    currentFileInfo = `\n\n## 현재 작업 컨텍스트
    - 파일: ${fileName} (${language})
    - 위치: 라인 ${editor.selection.active.line + 1}`;
                    
                    if (!selection.isEmpty) {
                        const selectedText = editor.document.getText(selection);
                        currentFileInfo += `\n- 선택된 코드:\n\`\`\`${language}\n${selectedText}\n\`\`\``;
                    }
                }
                
                conversationHistory.push({role: "user", content: prompt});
                if (conversationHistory.length > 20) {
                    conversationHistory = conversationHistory.slice(-20);
                }
                
                // 시스템 프롬프트 준비
                const systemPrompt = projectContext + currentFileInfo + `\n\n당신은 STAKE 프로젝트 전담 개발 어시스턴트입니다. 친근하고 도움이 되는 방식으로 응답하세요.`;
                
                const response = await axios.post(
                    ANTHROPIC_API_URL,
                    {
                        model: model,
                        system: systemPrompt,
                        messages: conversationHistory,
                        max_tokens: 4000
                    },
                    {
                        headers: {
                            'x-api-key': apiKey,
                            'anthropic-version': '2023-06-01',
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                const claudeResponse = response.data.content[0].text;
                conversationHistory.push({role: "assistant", content: claudeResponse});
                
                // 채팅 패널에 응답 추가
                chatProvider.addMessage('assistant', claudeResponse);
                
                // 코드 블록 감지 및 빠른 액션
                const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
                const codeBlocks = [];
                let match;
                
                while ((match = codeBlockRegex.exec(claudeResponse)) !== null) {
                    codeBlocks.push(match[1]);
                }
                
                if (codeBlocks.length > 0) {
                    const action = await vscode.window.showInformationMessage(
                        `${codeBlocks.length}개의 코드 블록을 발견했습니다.`,
                        '첫 번째 코드 적용',
                        '새 파일로 열기',
                        '무시'
                    );
                    
                    if (action === '첫 번째 코드 적용' && editor) {
                        await editor.edit(editBuilder => {
                            const entireRange = new vscode.Range(
                                editor.document.positionAt(0),
                                editor.document.positionAt(editor.document.getText().length)
                            );
                            editBuilder.replace(entireRange, codeBlocks[0]);
                        });
                        vscode.window.showInformationMessage('✅ 코드가 적용되었습니다!');
                    } else if (action === '새 파일로 열기') {
                        const doc = await vscode.workspace.openTextDocument({
                            content: codeBlocks[0],
                            language: editor ? editor.document.languageId : 'javascript'
                        });
                        await vscode.window.showTextDocument(doc, vscode.ViewColumn.One);
                    }
                }
                
            } catch (error: any) {
                handleError(error);
                throw error;
            }
        }
        
        // 🆕 채팅 명령어 처리 함수
        async function handleChatCommand(command: string, apiKey: string, chatProvider: ChatPanelProvider) {
            const cmd = command.toLowerCase().trim();
            
            if (cmd === '/help' || cmd === '/도움말') {
                chatProvider.addMessage('system', `
📋 **사용 가능한 명령어**

**/analyze** - 현재 파일 분석
**/fix** - 선택한 코드 수정
**/auto [설명]** - 자동화 실행
**/plan [설명]** - 기획 후 개발
**/bug [설명]** - 버그 수정
**/feature [설명]** - 새 기능 추가
**/clear** - 대화 초기화
**/help** - 도움말

**일반 대화**: 그냥 메시지를 입력하세요!
                `);
            } else if (cmd === '/clear') {
                chatProvider.clearChat();
                conversationHistory = [];
            } else if (cmd === '/analyze') {
                await vscode.commands.executeCommand('claude.analyzeFile');
                chatProvider.addMessage('system', '📍 파일 분석을 시작합니다. 새 창에서 결과를 확인하세요.');
            } else if (cmd.startsWith('/auto ')) {
                const request = command.substring(6);
                chatProvider.addMessage('system', '🚀 자동화를 시작합니다...');
                await askClaudeWithAutomation(request, apiKey);
            } else if (cmd.startsWith('/plan ')) {
                const request = command.substring(6);
                chatProvider.addMessage('system', '📋 기획을 시작합니다...');
                await planAndDevelop(request, apiKey);
            } else if (cmd.startsWith('/bug ')) {
                const bugDesc = command.substring(5);
                chatProvider.addMessage('system', '🐛 버그 수정을 시작합니다...');
                await askClaudeWithAutomation(`다음 버그를 수정해줘: ${bugDesc}`, apiKey);
            } else if (cmd.startsWith('/feature ')) {
                const featureDesc = command.substring(9);
                chatProvider.addMessage('system', '✨ 새 기능 개발을 시작합니다...');
                await planAndDevelop(featureDesc, apiKey);
            } else {
                chatProvider.addMessage('system', `❓ 알 수 없는 명령어입니다. /help를 입력해보세요.`);
            }
        }
        
        // 🆕 채팅 패널 프로바이더 생성
        const chatProvider = new ChatPanelProvider(context.extensionUri);
        
        // 🆕 채팅 뷰 등록
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(
                ChatPanelProvider.viewType,
                chatProvider
            )
        );
        
        // 🆕 채팅 패널과 Claude 연결
        chatProvider.onSendMessage(async (message) => {
            if (!apiKey) {
                const input = await vscode.window.showInputBox({
                    prompt: 'Anthropic API Key를 입력하세요',
                    password: true,
                    placeHolder: 'sk-ant-...'
                });
                
                if (input) {
                    await config.update('apiKey', input, vscode.ConfigurationTarget.Global);
                    apiKey = input;
                    chatProvider.addMessage('system', '✅ API Key가 설정되었습니다.');
                } else {
                    chatProvider.addMessage('system', '❌ API Key를 먼저 설정해주세요.');
                    return;
                }
            }
            
            // 사용자 메시지 표시
            chatProvider.addMessage('user', message);
            
            // 로딩 표시
            chatProvider.showLoading(true);
            
            try {
                // 명령어 감지 및 처리
                if (message.startsWith('/')) {
                    await handleChatCommand(message, apiKey, chatProvider);
                } else {
                    // 일반 대화
                    await askClaudeForChat(message, apiKey, chatProvider);
                }
            } catch (error: any) {
                chatProvider.addMessage('system', '❌ 오류가 발생했습니다: ' + error.message);
            } finally {
                chatProvider.showLoading(false);
            }
        });
        
        // ... 나머지 기존 코드들 (다른 명령어 등록 등)
        
    } catch (error: any) {
        console.error('❌ Extension activation failed:', error);
        vscode.window.showErrorMessage(`Extension 활성화 실패: ${error}`);
    }
}

// API 키 입력 프롬프트
async function promptForApiKey(config: vscode.WorkspaceConfiguration): Promise<string | undefined> {
    const action = await vscode.window.showWarningMessage(
        'Claude API Key가 필요합니다.',
        'API Key 입력',
        '나중에'
    );
    
    if (action === 'API Key 입력') {
        const inputKey = await vscode.window.showInputBox({
            prompt: 'Anthropic API Key를 입력하세요',
            placeHolder: 'sk-ant-...',
            password: true,
            validateInput: (value) => {
                if (!value.startsWith('sk-ant-')) {
                    return 'API Key는 sk-ant-로 시작해야 합니다.';
                }
                return null;
            }
        });
        
        if (inputKey) {
            await config.update('apiKey', inputKey, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('✅ API Key가 안전하게 저장되었습니다!');
            return inputKey;
        }
    }
    
    return undefined;
}

// Extension 비활성화
export function deactivate() {
    console.log('👋 Claude Dev Assistant deactivated');
    // 캐시 정리
    projectCache.clear();
    conversationHistory = [];
}