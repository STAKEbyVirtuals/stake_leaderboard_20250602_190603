// src/chatPanel.ts
import * as vscode from 'vscode';

export class ChatPanelProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'claude.chatView';
    private _view?: vscode.WebviewView;
    private _onSendMessage: ((message: string) => void) | undefined;

    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // 메시지 수신
        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'sendMessage':
                    if (this._onSendMessage) {
                        this._onSendMessage(data.message);
                    }
                    break;
                case 'clear':
                    this.clearChat();
                    break;
            }
        });
    }

    public onSendMessage(callback: (message: string) => void) {
        this._onSendMessage = callback;
    }

    public addMessage(role: 'user' | 'assistant' | 'system', content: string) {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'addMessage',
                role: role,
                content: content
            });
        }
    }

    public clearChat() {
        if (this._view) {
            this._view.webview.postMessage({ type: 'clear' });
        }
    }

    public showLoading(show: boolean) {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'loading',
                show: show
            });
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));

        return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Chat</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        #chat-container {
            flex: 1;
            overflow-y: auto;
            padding: 10px;
            scroll-behavior: smooth;
        }
        
        .message {
            margin-bottom: 15px;
            padding: 10px;
            border-radius: 8px;
            word-wrap: break-word;
        }
        
        .user-message {
            background-color: var(--vscode-input-background);
            border-left: 3px solid var(--vscode-button-background);
            margin-left: 20px;
        }
        
        .assistant-message {
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            border-left: 3px solid var(--vscode-progressBar-background);
            margin-right: 20px;
        }
        
        .system-message {
            background-color: var(--vscode-notifications-background);
            border-left: 3px solid var(--vscode-notificationsWarningIcon-foreground);
            font-style: italic;
            opacity: 0.8;
        }
        
        .message-role {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 0.9em;
            opacity: 0.7;
        }
        
        .message-content {
            white-space: pre-wrap;
            line-height: 1.5;
        }
        
        #input-container {
            padding: 10px;
            border-top: 1px solid var(--vscode-panel-border);
            background-color: var(--vscode-editor-background);
        }
        
        #message-input {
            width: 100%;
            min-height: 60px;
            padding: 8px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
            resize: vertical;
            font-family: inherit;
            font-size: inherit;
        }
        
        #message-input:focus {
            outline: 1px solid var(--vscode-focusBorder);
        }
        
        .button-container {
            display: flex;
            gap: 10px;
            margin-top: 8px;
        }
        
        button {
            padding: 6px 14px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: inherit;
            transition: opacity 0.2s;
        }
        
        #send-button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            flex: 1;
        }
        
        #send-button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        #clear-button {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        
        #clear-button:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
        
        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .loading {
            display: none;
            text-align: center;
            padding: 10px;
            color: var(--vscode-descriptionForeground);
        }
        
        .loading.show {
            display: block;
        }
        
        code {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 2px 4px;
            border-radius: 3px;
            font-family: var(--vscode-editor-font-family);
        }
        
        pre {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
        }
        
        pre code {
            background: none;
            padding: 0;
        }
        
        .welcome-message {
            text-align: center;
            padding: 40px 20px;
            color: var(--vscode-descriptionForeground);
        }
        
        .welcome-message h2 {
            color: var(--vscode-foreground);
            margin-bottom: 10px;
        }
        
        .shortcuts {
            margin-top: 20px;
            font-size: 0.9em;
        }
        
        .shortcut-item {
            margin: 5px 0;
        }
        
        .shortcut-key {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div id="chat-container">
        <div class="welcome-message">
            <h2>🤖 Claude Assistant</h2>
            <p>STAKE 프로젝트 전용 AI 개발 도우미</p>
            <div class="shortcuts">
                <div class="shortcut-item">
                    <span class="shortcut-key">Enter</span> 메시지 전송
                </div>
                <div class="shortcut-item">
                    <span class="shortcut-key">Shift+Enter</span> 줄바꿈
                </div>
                <div class="shortcut-item">
                    <span class="shortcut-key">Ctrl+L</span> 대화 초기화
                </div>
            </div>
        </div>
    </div>
    
    <div class="loading" id="loading">
        <span>Claude가 생각중입니다...</span>
    </div>
    
    <div id="input-container">
        <textarea 
            id="message-input" 
            placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
            rows="3"
        ></textarea>
        <div class="button-container">
            <button id="send-button">전송</button>
            <button id="clear-button">초기화</button>
        </div>
    </div>

    <script>
        (function() {
            const vscode = acquireVsCodeApi();
            const chatContainer = document.getElementById('chat-container');
            const messageInput = document.getElementById('message-input');
            const sendButton = document.getElementById('send-button');
            const clearButton = document.getElementById('clear-button');
            const loading = document.getElementById('loading');
            
            // 메시지 전송
            function sendMessage() {
                const message = messageInput.value.trim();
                if (!message) return;
                
                vscode.postMessage({
                    type: 'sendMessage',
                    message: message
                });
                
                messageInput.value = '';
                messageInput.style.height = 'auto';
                sendButton.disabled = true;
            }
            
            // 메시지 추가
            function addMessage(role, content) {
                // 환영 메시지 제거
                const welcomeMsg = chatContainer.querySelector('.welcome-message');
                if (welcomeMsg) {
                    welcomeMsg.remove();
                }
                
                const messageDiv = document.createElement('div');
                messageDiv.className = 'message ' + role + '-message';
                
                const roleDiv = document.createElement('div');
                roleDiv.className = 'message-role';
                roleDiv.textContent = role === 'user' ? '👤 You' : 
                                   role === 'assistant' ? '🤖 Claude' : 
                                   '📢 System';
                
                const contentDiv = document.createElement('div');
                contentDiv.className = 'message-content';
                
                // 마크다운 간단 처리
                let processedContent = content
                    .replace(/\`\`\`(\\w+)?\\n([\\s\\S]*?)\`\`\`/g, '<pre><code>$2</code></pre>')
                    .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\\n/g, '<br>');
                
                contentDiv.innerHTML = processedContent;
                
                messageDiv.appendChild(roleDiv);
                messageDiv.appendChild(contentDiv);
                chatContainer.appendChild(messageDiv);
                
                // 스크롤 하단으로
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
            
            // 대화 초기화
            function clearChat() {
                chatContainer.innerHTML = \`
                    <div class="welcome-message">
                        <h2>🤖 Claude Assistant</h2>
                        <p>STAKE 프로젝트 전용 AI 개발 도우미</p>
                        <div class="shortcuts">
                            <div class="shortcut-item">
                                <span class="shortcut-key">Enter</span> 메시지 전송
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Shift+Enter</span> 줄바꿈
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Ctrl+L</span> 대화 초기화
                            </div>
                        </div>
                    </div>
                \`;
            }
            
            // 이벤트 리스너
            sendButton.addEventListener('click', sendMessage);
            clearButton.addEventListener('click', function() {
                vscode.postMessage({ type: 'clear' });
            });
            
            messageInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                } else if (e.key === 'l' && e.ctrlKey) {
                    e.preventDefault();
                    vscode.postMessage({ type: 'clear' });
                }
            });
            
            messageInput.addEventListener('input', function() {
                messageInput.style.height = 'auto';
                messageInput.style.height = messageInput.scrollHeight + 'px';
            });
            
            // VS Code로부터 메시지 수신
            window.addEventListener('message', function(event) {
                const message = event.data;
                switch (message.type) {
                    case 'addMessage':
                        addMessage(message.role, message.content);
                        sendButton.disabled = false;
                        break;
                    case 'clear':
                        clearChat();
                        break;
                    case 'loading':
                        loading.classList.toggle('show', message.show);
                        break;
                }
            });
            
            // 초기 포커스
            messageInput.focus();
        })();
    </script>
</body>
</html>`;
    }
}