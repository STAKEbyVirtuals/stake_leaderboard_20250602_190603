import * as vscode from 'vscode';
import { ClaudeAPI } from './src/claudeAPI';
import { FileManager } from './src/fileManager';
import { ChatPanel } from './src/chatPanel';
import { STAKEHelpers } from './src/stakeHelpers';

let chatPanel: ChatPanel | undefined;
let claudeAPI: ClaudeAPI;
let fileManager: FileManager;
let stakeHelpers: STAKEHelpers;

export function activate(context: vscode.ExtensionContext) {
    console.log('🤖 Claude Dev Assistant for STAKE v2 is activating...');

    // Initialize core services
    claudeAPI = new ClaudeAPI();
    fileManager = new FileManager();
    stakeHelpers = new STAKEHelpers(fileManager, claudeAPI);

    // Register all commands
    registerCommands(context);
    
    // Create status bar
    createStatusBar(context);

    // Show activation message
    vscode.window.showInformationMessage('🎉 Claude Dev Assistant for STAKE is ready!');

    console.log('✅ Claude Dev Assistant for STAKE v2 activated successfully!');
}

function registerCommands(context: vscode.ExtensionContext) {
    // 💬 Main chat command
    const openChatCommand = vscode.commands.registerCommand('claude.openChat', async () => {
        console.log('🤖 Claude openChat command executed!');
        vscode.window.showInformationMessage('Claude 채팅을 여는 중...'); // 임시 확인용
        
        if (!chatPanel) {
            console.log('Creating new ChatPanel...');
            chatPanel = new ChatPanel(context.extensionUri, claudeAPI, fileManager, stakeHelpers);
        }
        console.log('Showing ChatPanel...');
        chatPanel.show();
    });

    // 🔍 Analyze current file (수정된 버전)
    const analyzeFileCommand = vscode.commands.registerCommand('claude.analyzeFile', async () => {
        console.log('🔍 Claude analyzeFile command executed!');
        
        try {
            // 활성 편집기에서 파일 정보 가져오기
            const activeFileData = await fileManager.readActiveFile();
            
            if (!activeFileData) {
                vscode.window.showWarningMessage('❌ 분석할 파일이 열려있지 않습니다.');
                return;
            }

            console.log('📄 분석할 파일:', activeFileData.fileName);
            
            // Open chat and analyze file
            if (!chatPanel) {
                chatPanel = new ChatPanel(context.extensionUri, claudeAPI, fileManager, stakeHelpers);
            }
            chatPanel.show();
            chatPanel.analyzeFile(activeFileData.fileName, activeFileData.content);
            
        } catch (error) {
            console.error('❌ 파일 분석 오류:', error);
            vscode.window.showErrorMessage(`파일 분석 중 오류가 발생했습니다: ${error}`);
        }
    });

    // 🔑 Configure API Key
    const configureApiKeyCommand = vscode.commands.registerCommand('claude.configureApiKey', async () => {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your Claude API Key',
            password: true,
            placeHolder: 'sk-ant-api03-...'
        });

        if (apiKey) {
            const config = vscode.workspace.getConfiguration('claude');
            await config.update('apiKey', apiKey, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('✅ Claude API Key configured successfully!');
        }
    });

    // ⚡ Quick Action: Add Referral Chart
    const addReferralChartCommand = vscode.commands.registerCommand('claude.quickAction.addReferralChart', async () => {
        await executeQuickAction('addReferralChart');
    });

    // 📱 Quick Action: Fix Mobile Issues
    const fixMobileIssuesCommand = vscode.commands.registerCommand('claude.quickAction.fixMobileIssues', async () => {
        await executeQuickAction('fixMobileIssues');
    });

    // 🏆 Quick Action: Add New Tier
    const addNewTierCommand = vscode.commands.registerCommand('claude.quickAction.addNewTier', async () => {
        await executeQuickAction('addNewTier');
    });

    // ⚡ Quick Action: Optimize Performance
    const optimizePerformanceCommand = vscode.commands.registerCommand('claude.quickAction.optimizePerformance', async () => {
        await executeQuickAction('optimizePerformance');
    });

    // 🔄 Quick Action: Sync Leaderboard
    const syncLeaderboardCommand = vscode.commands.registerCommand('claude.quickAction.syncLeaderboard', async () => {
        await executeQuickAction('syncLeaderboard');
    });

    // 🚀 Quick Action: Deploy Preview
    const deployPreviewCommand = vscode.commands.registerCommand('claude.quickAction.deployPreview', async () => {
        await executeQuickAction('deployPreview');
    });

    // 🔍 Advanced: Analyze Project Structure
    const analyzeProjectCommand = vscode.commands.registerCommand('claude.analyzeProject', async () => {
        console.log('🏗️ 프로젝트 구조 분석 시작...');
        
        try {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: '🔍 STAKE 프로젝트 구조를 분석하고 있습니다...',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0, message: '프로젝트 파일 스캔 중...' });
                
                const projectContext = await stakeHelpers.getProjectContext();
                
                progress.report({ increment: 50, message: 'Claude 분석 중...' });
                
                // Open chat and show project analysis
                if (!chatPanel) {
                    chatPanel = new ChatPanel(context.extensionUri, claudeAPI, fileManager, stakeHelpers);
                }
                chatPanel.show();
                
                // Send project analysis to chat
                const analysisMessage = `📊 STAKE 프로젝트 구조 분석 결과:

**발견된 컴포넌트**: ${projectContext.structure?.components?.length || 0}개
**페이지**: ${projectContext.structure?.pages?.length || 0}개  
**유틸리티**: ${projectContext.structure?.utils?.length || 0}개
**STAKE 관련 파일**: ${Object.values(projectContext.stakeFiles || {}).flat().length}개

어떤 부분을 자세히 분석하거나 개선하고 싶으신가요?`;
                
                // Simulate sending message to chat
                chatPanel.showProjectAnalysis(analysisMessage);
                
                progress.report({ increment: 100, message: '분석 완료!' });
            });
            
        } catch (error) {
            console.error('❌ 프로젝트 분석 오류:', error);
            vscode.window.showErrorMessage(`프로젝트 분석 중 오류가 발생했습니다: ${error}`);
        }
    });

    // Register all commands
    context.subscriptions.push(
        openChatCommand,
        analyzeFileCommand,
        configureApiKeyCommand,
        addReferralChartCommand,
        fixMobileIssuesCommand,
        addNewTierCommand,
        optimizePerformanceCommand,
        syncLeaderboardCommand,
        deployPreviewCommand,
        analyzeProjectCommand
    );
}

async function executeQuickAction(actionType: string) {
    try {
        // Check API key
        const config = vscode.workspace.getConfiguration('claude');
        const apiKey = config.get<string>('apiKey');
        
        if (!apiKey) {
            const result = await vscode.window.showWarningMessage(
                'Claude API Key is required for quick actions',
                'Configure Now'
            );
            if (result === 'Configure Now') {
                vscode.commands.executeCommand('claude.configureApiKey');
            }
            return;
        }

        // Show progress
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `🤖 Claude is working on: ${getActionDescription(actionType)}`,
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0, message: 'Analyzing project structure...' });
            
            // Execute the quick action
            const result = await stakeHelpers.executeQuickAction(actionType);
            
            progress.report({ increment: 50, message: 'Generating code...' });
            
            if (result.success) {
                progress.report({ increment: 100, message: 'Completed!' });
                
                // Show completion message with options
                const choice = await vscode.window.showInformationMessage(
                    `✅ ${result.message}`,
                    'View Changes',
                    'Open Chat',
                    'Continue Working'
                );

                if (choice === 'View Changes' && result.filePath) {
                    // Open the modified file
                    const document = await vscode.workspace.openTextDocument(result.filePath);
                    vscode.window.showTextDocument(document);
                } else if (choice === 'Open Chat') {
                    // Open chat for further discussion
                    if (!chatPanel) {
                        chatPanel = new ChatPanel(vscode.Uri.file(''), claudeAPI, fileManager, stakeHelpers);
                    }
                    chatPanel.show();
                }
            } else {
                vscode.window.showErrorMessage(`❌ ${result.message}`);
            }
        });

    } catch (error) {
        console.error('❌ Quick action 실행 오류:', error);
        vscode.window.showErrorMessage(`Error executing quick action: ${error}`);
    }
}

function getActionDescription(actionType: string): string {
    const descriptions: Record<string, string> = {
        'addReferralChart': 'Adding referral performance chart',
        'fixMobileIssues': 'Fixing mobile responsiveness',
        'addNewTier': 'Adding new user tier',
        'optimizePerformance': 'Optimizing code performance',
        'syncLeaderboard': 'Syncing leaderboard data',
        'deployPreview': 'Creating deployment preview'
    };
    return descriptions[actionType] || 'Processing request';
}

function createStatusBar(context: vscode.ExtensionContext) {
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '🤖 Claude';
    statusBarItem.tooltip = 'Claude Assistant for STAKE - 클릭해서 채팅 시작';
    statusBarItem.command = 'claude.openChat';
    statusBarItem.show();

    // 디버그: 상태바 생성 확인
    console.log('✅ Status bar created with command:', statusBarItem.command);
    
    context.subscriptions.push(statusBarItem);
    
    // 강제로 명령어 테스트
    setTimeout(() => {
        console.log('Testing if claude.openChat command exists...');
        vscode.commands.getCommands().then(commands => {
            const hasCommand = commands.includes('claude.openChat');
            console.log('claude.openChat command exists:', hasCommand);
        });
    }, 1000);
}

export function deactivate() {
    if (chatPanel) {
        chatPanel.dispose();
    }
}