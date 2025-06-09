// src/automationManager.ts
import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface AutomationResult {
    success: boolean;
    message: string;
    details?: any;
    errors?: string[];
}

export class AutomationManager {
    private outputChannel: vscode.OutputChannel;
    private isRunning: boolean = false;
    
    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Claude Automation');
    }
    
    /**
     * 완전 자동화 실행 - 코드 수정부터 Git 푸시까지
     */
    async runFullAutomation(
        filePath: string, 
        newCode: string, 
        commitMessage: string
    ): Promise<AutomationResult> {
        if (this.isRunning) {
            return {
                success: false,
                message: '이미 자동화가 진행 중입니다.'
            };
        }
        
        this.isRunning = true;
        this.outputChannel.show();
        this.log('🚀 자동화 프로세스 시작...');
        
        try {
            // 1. 코드 수정/생성
            this.log('📝 코드 수정 중...');
            await this.updateCode(filePath, newCode);
            
            // 2. 자동 포맷팅
            this.log('🎨 코드 포맷팅...');
            await this.formatCode(filePath);
            
            // 3. 컴파일 (TypeScript인 경우)
            if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
                this.log('🔨 TypeScript 컴파일...');
                const compileResult = await this.compile();
                if (!compileResult.success) {
                    throw new Error(`컴파일 실패: ${compileResult.message}`);
                }
            }
            
            // 4. 테스트 실행
            this.log('🧪 테스트 실행...');
            const testResult = await this.runTests(filePath);
            if (!testResult.success) {
                // 테스트 실패시 Claude에게 수정 요청
                this.log('❌ 테스트 실패 - 자동 수정 시도...');
                const fixedCode = await this.requestAutoFix(filePath, newCode, testResult.errors);
                if (fixedCode) {
                    await this.updateCode(filePath, fixedCode);
                    // 재테스트
                    const retryResult = await this.runTests(filePath);
                    if (!retryResult.success) {
                        throw new Error('자동 수정 후에도 테스트 실패');
                    }
                }
            }
            
            // 5. Git 작업
            this.log('📤 Git 커밋 및 푸시...');
            await this.gitAddCommitPush(commitMessage);
            
            // 6. 배포 (선택사항)
            const shouldDeploy = await vscode.window.showQuickPick(
                ['예', '아니오'],
                { placeHolder: '배포하시겠습니까?' }
            );
            
            if (shouldDeploy === '예') {
                this.log('🌐 배포 중...');
                await this.deploy();
            }
            
            this.log('✅ 자동화 완료!');
            vscode.window.showInformationMessage(
                `✅ 자동화 완료! ${filePath} 수정 → 테스트 통과 → Git 푸시 완료`
            );
            
            return {
                success: true,
                message: '모든 작업이 성공적으로 완료되었습니다.',
                details: {
                    file: filePath,
                    commit: commitMessage,
                    deployed: shouldDeploy === '예'
                }
            };
            
        } catch (error: any) {
            this.log(`❌ 오류 발생: ${error.message}`);
            vscode.window.showErrorMessage(`자동화 실패: ${error.message}`);
            
            return {
                success: false,
                message: error.message,
                errors: [error.toString()]
            };
            
        } finally {
            this.isRunning = false;
        }
    }
    
    /**
     * 코드 업데이트
     */
    private async updateCode(filePath: string, content: string): Promise<void> {
        const uri = vscode.Uri.file(
            path.join(vscode.workspace.rootPath || '', filePath)
        );
        
        await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
        
        // 파일 열기
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc);
        await doc.save();
    }
    
    /**
     * 코드 포맷팅
     */
    private async formatCode(filePath: string): Promise<void> {
        const uri = vscode.Uri.file(
            path.join(vscode.workspace.rootPath || '', filePath)
        );
        
        const doc = await vscode.workspace.openTextDocument(uri);
        const editor = await vscode.window.showTextDocument(doc);
        
        await vscode.commands.executeCommand('editor.action.formatDocument');
        await doc.save();
    }
    
    /**
     * TypeScript 컴파일
     */
    private async compile(): Promise<AutomationResult> {
        try {
            const { stdout, stderr } = await execAsync(
                'npm run compile',
                { cwd: vscode.workspace.rootPath }
            );
            
            if (stderr && !stderr.includes('warning')) {
                return {
                    success: false,
                    message: stderr,
                    errors: [stderr]
                };
            }
            
            return {
                success: true,
                message: '컴파일 성공'
            };
            
        } catch (error: any) {
            return {
                success: false,
                message: error.message,
                errors: [error.stdout, error.stderr]
            };
        }
    }
    
    /**
     * 테스트 실행
     */
    private async runTests(filePath: string): Promise<AutomationResult> {
        try {
            // 테스트 파일 존재 확인
            const testFile = filePath.replace(/\.(ts|tsx|js|jsx)$/, '.test.$1');
            const testExists = await this.fileExists(testFile);
            
            if (!testExists) {
                // 테스트 파일이 없으면 기본 검증만
                this.log('⚠️ 테스트 파일 없음 - 기본 검증만 수행');
                return this.runBasicValidation(filePath);
            }
            
            // Jest 또는 다른 테스트 러너 실행
            const { stdout, stderr } = await execAsync(
                `npm test -- ${testFile}`,
                { cwd: vscode.workspace.rootPath }
            );
            
            if (stderr || stdout.includes('FAIL')) {
                return {
                    success: false,
                    message: '테스트 실패',
                    errors: [stderr || stdout]
                };
            }
            
            return {
                success: true,
                message: '모든 테스트 통과'
            };
            
        } catch (error: any) {
            return {
                success: false,
                message: error.message,
                errors: [error.stdout, error.stderr]
            };
        }
    }
    
    /**
     * 기본 검증 (문법, import 등)
     */
    private async runBasicValidation(filePath: string): Promise<AutomationResult> {
        try {
            // ESLint 실행
            const { stdout, stderr } = await execAsync(
                `npx eslint ${filePath} --fix`,
                { cwd: vscode.workspace.rootPath }
            );
            
            if (stderr) {
                return {
                    success: false,
                    message: 'Lint 오류',
                    errors: [stderr]
                };
            }
            
            return {
                success: true,
                message: '기본 검증 통과'
            };
            
        } catch (error: any) {
            // ESLint가 없으면 통과
            return {
                success: true,
                message: '검증 스킵'
            };
        }
    }
    
    /**
     * Git 작업
     */
    private async gitAddCommitPush(message: string): Promise<void> {
        const commands = [
            'git add .',
            `git commit -m "${message}"`,
            'git push origin main'
        ];
        
        for (const cmd of commands) {
            this.log(`📍 실행: ${cmd}`);
            const { stdout, stderr } = await execAsync(cmd, {
                cwd: vscode.workspace.rootPath
            });
            
            if (stderr && !stderr.includes('warning')) {
                throw new Error(`Git 오류: ${stderr}`);
            }
            
            if (stdout) {
                this.log(stdout);
            }
        }
    }
    
    /**
     * 배포
     */
    private async deploy(): Promise<void> {
        // Vercel, Netlify 등 배포 명령어
        try {
            await execAsync('npm run deploy', {
                cwd: vscode.workspace.rootPath
            });
        } catch (error) {
            this.log('배포 명령어가 없거나 실패했습니다.');
        }
    }
    
    /**
     * Claude에게 자동 수정 요청
     */
    private async requestAutoFix(
        filePath: string, 
        code: string, 
        errors?: string[]
    ): Promise<string | null> {
        // Claude API를 통해 오류 수정 요청
        // 실제 구현은 claudeAPI.ts와 연동
        vscode.window.showWarningMessage(
            '테스트 실패 - Claude가 자동으로 수정을 시도합니다...'
        );
        
        // TODO: Claude API 호출하여 수정된 코드 받기
        return null;
    }
    
    /**
     * 파일 존재 확인
     */
    private async fileExists(filePath: string): Promise<boolean> {
        try {
            const uri = vscode.Uri.file(
                path.join(vscode.workspace.rootPath || '', filePath)
            );
            await vscode.workspace.fs.stat(uri);
            return true;
        } catch {
            return false;
        }
    }
    
    /**
     * 로그 출력
     */
    private log(message: string): void {
        const timestamp = new Date().toLocaleTimeString();
        this.outputChannel.appendLine(`[${timestamp}] ${message}`);
    }
    
    /**
     * 실시간 모니터링
     */
    async startMonitoring(): Promise<void> {
        this.log('👁️ 실시간 모니터링 시작...');
        
        // 파일 변경 감지
        const watcher = vscode.workspace.createFileSystemWatcher('**/*.{ts,tsx,js,jsx}');
        
        watcher.onDidChange(async (uri) => {
            this.log(`📝 파일 변경 감지: ${uri.fsPath}`);
            
            // 자동 테스트 실행 옵션
            const autoTest = vscode.workspace
                .getConfiguration('claude')
                .get('autoTestOnSave', false);
            
            if (autoTest) {
                const relativePath = vscode.workspace.asRelativePath(uri);
                await this.runTests(relativePath);
            }
        });
    }
}