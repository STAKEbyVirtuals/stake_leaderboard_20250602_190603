import * as vscode from 'vscode';
import * as path from 'path';
import { ClaudeAPI, ChatMessage } from './claudeAPI';
import { FileManager } from './fileManager';
import { STAKEHelpers } from './stakeHelpers';

export class ChatPanel {
    private panel: vscode.WebviewPanel | undefined;
    private messages: ChatMessage[] = [];
    private disposables: vscode.Disposable[] = [];

    constructor(
        private readonly extensionUri: vscode.Uri,
        private readonly claudeAPI: ClaudeAPI,
        private readonly fileManager: FileManager,
        private readonly stakeHelpers: STAKEHelpers
    ) {}

    public show() {
        if (this.panel) {
            this.panel.reveal();
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'claudeChat',
            '🤖 Claude Assistant for STAKE',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                localResourceRoots: [this.extensionUri],
                retainContextWhenHidden: true
            }
        );

        this.panel.webview.html = this.getWebviewContent();
        this.setupWebviewMessageHandling();

        this.panel.onDidDispose(() => {
            this.panel = undefined;
            this.dispose();
        }, null, this.disposables);
    }

    public async analyzeFile(fileName: string, content: string) {
        if (!this.panel) {
            this.show();
        }

        const userMessage: ChatMessage = {
            role: 'user',
            content: `현재 열린 파일을 분석해주세요: ${fileName}`,
            timestamp: new Date()
        };
        this.messages.push(userMessage);

        this.panel?.webview.postMessage({
            type: 'userMessage',
            message: userMessage
        });

        try {
            const analysis = await this.claudeAPI.analyzeCode(fileName, content);
            
            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: analysis,
                timestamp: new Date()
            };
            this.messages.push(assistantMessage);

            this.panel?.webview.postMessage({
                type: 'assistantMessage',
                message: assistantMessage
            });
        } catch (error) {
            this.showError(`파일 분석 중 오류가 발생했습니다: ${error}`);
        }
    }

    public showProjectAnalysis(analysisContent: string) {
        if (!this.panel) {
            this.show();
        }

        const analysisMessage: ChatMessage = {
            role: 'assistant',
            content: analysisContent,
            timestamp: new Date()
        };
        this.messages.push(analysisMessage);

        this.panel?.webview.postMessage({
            type: 'assistantMessage',
            message: analysisMessage
        });
    }

    private setupWebviewMessageHandling() {
        if (!this.panel) return;

        this.panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.type) {
                    case 'sendMessage':
                        await this.handleUserMessage(message.content);
                        break;
                    case 'quickAction':
                        await this.handleQuickAction(message.action);
                        break;
                    case 'applyCode':
                        await this.handleApplyCode(message.code, message.filePath);
                        break;
                    case 'createFile':
                        await this.handleCreateFile(message.filePath, message.content);
                        break;
                }
            },
            null,
            this.disposables
        );
    }

    private async handleUserMessage(content: string) {
        const userMessage: ChatMessage = {
            role: 'user',
            content: content,
            timestamp: new Date()
        };
        this.messages.push(userMessage);

        this.panel?.webview.postMessage({
            type: 'showTyping'
        });

        try {
            const projectContext = await this.stakeHelpers.getProjectContext();
            const systemPrompt = this.buildSystemPrompt(projectContext);
            const response = await this.claudeAPI.sendMessage(this.messages, systemPrompt);

            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: response.content,
                timestamp: new Date()
            };
            this.messages.push(assistantMessage);

            this.panel?.webview.postMessage({
                type: 'assistantMessage',
                message: assistantMessage
            });

        } catch (error) {
            this.showError(`Claude 응답 중 오류가 발생했습니다: ${error}`);
        }
    }

    private async handleQuickAction(action: string) {
        this.panel?.webview.postMessage({
            type: 'showQuickActionProgress',
            action: action
        });

        try {
            const result = await this.stakeHelpers.executeQuickAction(action);
            
            this.panel?.webview.postMessage({
                type: 'quickActionComplete',
                result: result
            });

            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: `✅ ${result.message}\n\n${result.details || ''}`,
                timestamp: new Date()
            };
            this.messages.push(assistantMessage);

        } catch (error) {
            this.showError(`Quick action 실행 중 오류가 발생했습니다: ${error}`);
        }
    }

    private async handleApplyCode(code: string, filePath: string) {
        try {
            const result = await this.fileManager.writeFile(filePath, code);
            
            if (result.success) {
                vscode.window.showInformationMessage(`✅ 코드가 ${filePath}에 저장되었습니다!`);
                
                const document = await vscode.workspace.openTextDocument(filePath);
                vscode.window.showTextDocument(document);
            } else {
                this.showError(`파일 저장 실패: ${result.error}`);
            }
        } catch (error) {
            this.showError(`코드 적용 중 오류가 발생했습니다: ${error}`);
        }
    }

    private async handleCreateFile(filePath: string, content: string) {
        try {
            const result = await this.fileManager.createFile(filePath, content);
            
            if (result.success) {
                vscode.window.showInformationMessage(`✅ 새 파일이 생성되었습니다: ${filePath}`);
                
                const document = await vscode.workspace.openTextDocument(filePath);
                vscode.window.showTextDocument(document);
            } else {
                this.showError(`파일 생성 실패: ${result.error}`);
            }
        } catch (error) {
            this.showError(`파일 생성 중 오류가 발생했습니다: ${error}`);
        }
    }

    private buildSystemPrompt(projectContext: any): string {
        return `당신은 STAKE 프로젝트 전문 개발 어시스턴트입니다.

현재 프로젝트 구조:
${JSON.stringify(projectContext, null, 2)}

개발 원칙:
1. 코드 생성 전 항상 사용자 의도 확인
2. 여러 옵션 제시하고 사용자가 선택하게 함  
3. 파일 저장 위치와 적용 방법 상세 안내
4. 후속 작업 단계별 가이드 제공
5. 초보자도 이해할 수 있게 친절한 설명

응답할 때:
- 한국어로 자연스럽게 대화
- 코드 작성 전 반드시 확인 질문
- 완성 후 적용 방법과 후속 절차 안내
- 항상 초보자 관점에서 설명

STAKE 프로젝트의 특징을 고려하여 최적의 솔루션을 제공하세요.`;
    }

    private showError(message: string) {
        vscode.window.showErrorMessage(message);
        
        this.panel?.webview.postMessage({
            type: 'error',
            message: message
        });
    }

    private getWebviewContent(): string {
        return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Assistant for STAKE</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
            color: #ffffff;
            height: 100vh;
            overflow: hidden;
        }

        .container {
            display: flex;
            flex-direction: column;
            height: 100vh;
        }

        .header {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 215, 0, 0.3);
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header-title {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .title-icon {
            font-size: 24px;
        }

        .header-title h1 {
            font-size: 18px;
            background: linear-gradient(45deg, #ffd700, #ffed4e);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .header-status {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            background: #00ff88;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .quick-actions {
            background: rgba(255, 255, 255, 0.02);
            padding: 15px 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .quick-actions h3 {
            margin-bottom: 12px;
            color: #ffd700;
            font-size: 14px;
        }

        .action-buttons {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 8px;
        }

        .action-btn {
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
            border: 1px solid rgba(255, 215, 0, 0.3);
            color: #ffffff;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(5px);
        }

        .action-btn:hover {
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1));
            border-color: rgba(255, 215, 0, 0.5);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
        }

        .chat-container {
            flex: 1;
            overflow: hidden;
            padding: 20px;
        }

        .messages {
            height: 100%;
            overflow-y: auto;
            scroll-behavior: smooth;
        }

        .welcome-message {
            text-align: center;
            padding: 40px 20px;
            background: rgba(255, 255, 255, 0.02);
            border-radius: 16px;
            border: 1px solid rgba(255, 215, 0, 0.2);
        }

        .welcome-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }

        .welcome-message h2 {
            color: #ffd700;
            margin-bottom: 8px;
            font-size: 24px;
        }

        .welcome-message p {
            color: #cccccc;
            margin-bottom: 24px;
        }

        .welcome-features {
            display: flex;
            flex-direction: column;
            gap: 12px;
            align-items: center;
        }

        .feature {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #ffffff;
            font-size: 14px;
        }

        .message {
            margin-bottom: 16px;
            padding: 16px;
            border-radius: 12px;
            animation: fadeIn 0.3s ease;
            line-height: 1.6;
            word-wrap: break-word;
        }

        .user-message {
            background: linear-gradient(135deg, rgba(0, 123, 255, 0.1), rgba(0, 123, 255, 0.05));
            border: 1px solid rgba(0, 123, 255, 0.3);
            margin-left: 60px;
        }

        .assistant-message {
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
            border: 1px solid rgba(255, 215, 0, 0.3);
            margin-right: 60px;
        }

        .assistant-message strong {
            color: #ffd700 !important;
            font-weight: bold;
        }

        .assistant-message code {
            background: rgba(255, 215, 0, 0.2) !important;
            color: #ffd700 !important;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Consolas', 'Monaco', monospace;
        }

        .assistant-message pre {
            background: rgba(0, 0, 0, 0.3) !important;
            border: 1px solid rgba(255, 215, 0, 0.3);
            border-radius: 8px;
            padding: 12px;
            overflow-x: auto;
            margin: 8px 0;
        }

        .assistant-message pre code {
            background: none !important;
            color: #ffffff !important;
            padding: 0;
        }

        .input-container {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding: 20px;
        }

        .input-wrapper {
            display: flex;
            gap: 12px;
            align-items: flex-end;
        }

        #messageInput {
            flex: 1;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 12px 16px;
            color: #ffffff;
            font-size: 14px;
            resize: none;
            outline: none;
            transition: all 0.3s ease;
        }

        #messageInput:focus {
            border-color: rgba(255, 215, 0, 0.5);
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.1);
        }

        #messageInput::placeholder {
            color: rgba(255, 255, 255, 0.5);
        }

        .send-button {
            background: linear-gradient(135deg, #ffd700, #ffed4e);
            border: none;
            border-radius: 12px;
            width: 48px;
            height: 48px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        .send-button:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 20px rgba(255, 215, 0, 0.4);
        }

        .send-icon {
            font-size: 18px;
            color: #000000;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .messages::-webkit-scrollbar {
            width: 6px;
        }

        .messages::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
        }

        .messages::-webkit-scrollbar-thumb {
            background: rgba(255, 215, 0, 0.3);
            border-radius: 3px;
        }

        .messages::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 215, 0, 0.5);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-title">
                <span class="title-icon">🤖</span>
                <h1>Claude Assistant for STAKE</h1>
            </div>
            <div class="header-status">
                <span class="status-dot"></span>
                <span class="status-text">Connected</span>
            </div>
        </div>

        <div class="quick-actions">
            <h3>⚡ 빠른 액션</h3>
            <div class="action-buttons">
                <button class="action-btn" data-action="addReferralChart">
                    📊 추천인 차트 추가
                </button>
                <button class="action-btn" data-action="fixMobileIssues">
                    📱 모바일 이슈 수정
                </button>
                <button class="action-btn" data-action="addNewTier">
                    🏆 새 등급 추가
                </button>
                <button class="action-btn" data-action="optimizePerformance">
                    ⚡ 성능 최적화
                </button>
                <button class="action-btn" data-action="syncLeaderboard">
                    🔄 리더보드 동기화
                </button>
                <button class="action-btn" data-action="deployPreview">
                    🚀 배포 미리보기
                </button>
            </div>
        </div>

        <div class="chat-container">
            <div class="messages" id="messages">
                <div class="welcome-message">
                    <div class="welcome-icon">🎮</div>
                    <h2>Welcome to STAKE Development Assistant!</h2>
                    <p>STAKE 프로젝트 개발을 도와드릴 준비가 되었습니다!</p>
                    <div class="welcome-features">
                        <div class="feature">
                            <span>⚡</span>
                            <span>빠른 액션 버튼으로 즉시 실행</span>
                        </div>
                        <div class="feature">
                            <span>💬</span>
                            <span>자유로운 대화로 맞춤 개발</span>
                        </div>
                        <div class="feature">
                            <span>🎯</span>
                            <span>STAKE 프로젝트 완전 특화</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="input-container">
            <div class="input-wrapper">
                <textarea 
                    id="messageInput" 
                    placeholder="STAKE 프로젝트에 대해 무엇이든 물어보세요... 예: '추천인 시스템에 실시간 알림 추가해줘'"
                    rows="3"
                ></textarea>
                <button id="sendButton" class="send-button">
                    <span class="send-icon">⚡</span>
                </button>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        const messagesContainer = document.getElementById('messages');
        
        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        document.querySelectorAll('.action-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const action = btn.getAttribute('data-action');
                executeQuickAction(action);
            });
        });

        function sendMessage() {
            const content = messageInput.value.trim();
            if (!content) return;

            addMessage(content, 'user');
            messageInput.value = '';
            
            vscode.postMessage({
                type: 'sendMessage',
                content: content
            });
        }

        function executeQuickAction(action) {
            vscode.postMessage({
                type: 'quickAction',
                action: action
            });
        }

        function addMessage(content, role) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ' + role + '-message';
            messageDiv.innerHTML = formatMessage(content);
            
            const welcomeMessage = messagesContainer.querySelector('.welcome-message');
            if (welcomeMessage) {
                welcomeMessage.remove();
            }
            
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function formatMessage(content) {
            // 안전한 문자열 처리 (정규식 없음)
            content = content.split('<strong>').join('');
            content = content.split('</strong>').join('');
            content = content.split('\\n').join('<br>');
            
            return content;
        }

        window.addEventListener('message', function(event) {
            const message = event.data;
            
            switch (message.type) {
                case 'userMessage':
                    addMessage(message.message.content, 'user');
                    break;
                case 'assistantMessage':
                    addMessage(message.message.content, 'assistant');
                    break;
                case 'showTyping':
                    showTypingIndicator();
                    break;
                case 'error':
                    showError(message.message);
                    break;
            }
        });

        function showTypingIndicator() {
            const typingDiv = document.createElement('div');
            typingDiv.className = 'message assistant-message typing';
            typingDiv.innerHTML = '🤖 Claude가 답변을 작성하고 있습니다...';
            typingDiv.id = 'typing-indicator';
            
            messagesContainer.appendChild(typingDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            setTimeout(function() {
                const indicator = document.getElementById('typing-indicator');
                if (indicator) {
                    indicator.remove();
                }
            }, 1000);
        }

        function showError(message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'message error-message';
            errorDiv.innerHTML = '❌ ' + message;
            errorDiv.style.background = 'rgba(255, 0, 0, 0.1)';
            errorDiv.style.borderColor = 'rgba(255, 0, 0, 0.3)';
            
            messagesContainer.appendChild(errorDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    </script>
</body>
</html>`;
    }

    public dispose() {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
    }
}