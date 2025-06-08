import * as vscode from 'vscode';
import { ClaudeAPI, ChatMessage } from './claudeAPI';
import { FileManager, FileOperation } from './fileManager';

export class ChatPanel {
    public static currentPanel: ChatPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    
    constructor(
        extensionUri: vscode.Uri,
        private claudeAPI: ClaudeAPI,
        private fileManager: FileManager
    ) {
        this._extensionUri = extensionUri;
        
        // Create webview panel
        this._panel = vscode.window.createWebviewPanel(
            'claude-chat',
            'Claude Assistant',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'webview')
                ]
            }
        );
        
        // Set the webview's initial html content
        this._update();
        
        // Listen for when the panel is disposed
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        
        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.type) {
                    case 'sendMessage':
                        await this.handleUserMessage(message.content);
                        break;
                    case 'applyCode':
                        await this.handleApplyCode(message.filePath, message.content);
                        break;
                    case 'createFile':
                        await this.handleCreateFile(message.filePath, message.content);
                        break;
                    case 'getCurrentFile':
                        await this.handleGetCurrentFile();
                        break;
                    case 'getProjectStructure':
                        await this.handleGetProjectStructure();
                        break;
                    case 'clearHistory':
                        this.claudeAPI.clearHistory();
                        this._panel.webview.postMessage({ type: 'historyCleared' });
                        break;
                }
            },
            null,
            this._disposables
        );
        
        ChatPanel.currentPanel = this;
    }
    
    public reveal() {
        this._panel.reveal(vscode.ViewColumn.Beside);
    }
    
    public dispose() {
        ChatPanel.currentPanel = undefined;
        this._panel.dispose();
        
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
    
    private async handleUserMessage(userMessage: string) {
        try {
            // Show thinking state
            this._panel.webview.postMessage({ 
                type: 'thinking',
                message: 'Claude is thinking...'
            });
            
            // Get Claude's response
            const response = await this.claudeAPI.sendMessage(userMessage);
            
            // Parse response for code blocks and file operations
            const codeBlocks = this.extractCodeBlocks(response);
            
            // Send response back to webview
            this._panel.webview.postMessage({
                type: 'assistantMessage',
                content: response,
                codeBlocks: codeBlocks,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            this._panel.webview.postMessage({
                type: 'error',
                message: `Error: ${error}`
            });
        }
    }
    
    private async handleApplyCode(filePath: string, content: string) {
        try {
            const result = await this.fileManager.writeFile(filePath, content);
            
            this._panel.webview.postMessage({
                type: 'fileOperationResult',
                operation: result,
                message: result.success ? 
                    `✅ Successfully ${result.type === 'create' ? 'created' : 'updated'} ${filePath}` :
                    `❌ Failed to update ${filePath}: ${result.error}`
            });
            
            if (result.success) {
                // Open the file
                await this.fileManager.openFile(filePath);
            }
            
        } catch (error) {
            this._panel.webview.postMessage({
                type: 'error',
                message: `Failed to apply code: ${error}`
            });
        }
    }
    
    private async handleCreateFile(filePath: string, content: string) {
        try {
            const result = await this.fileManager.createFile(filePath, content);
            
            this._panel.webview.postMessage({
                type: 'fileOperationResult',
                operation: result,
                message: result.success ? 
                    `✅ Successfully created ${filePath}` :
                    `❌ Failed to create ${filePath}: ${result.error}`
            });
            
            if (result.success) {
                await this.fileManager.openFile(filePath);
            }
            
        } catch (error) {
            this._panel.webview.postMessage({
                type: 'error',
                message: `Failed to create file: ${error}`
            });
        }
    }
    
    private async handleGetCurrentFile() {
        const fileInfo = this.fileManager.getCurrentFileInfo();
        
        this._panel.webview.postMessage({
            type: 'currentFileInfo',
            fileInfo: fileInfo
        });
    }
    
    private async handleGetProjectStructure() {
        try {
            const structure = await this.fileManager.getStakeProjectStructure();
            
            this._panel.webview.postMessage({
                type: 'projectStructure',
                structure: structure
            });
            
        } catch (error) {
            this._panel.webview.postMessage({
                type: 'error',
                message: `Failed to get project structure: ${error}`
            });
        }
    }
    
    private extractCodeBlocks(text: string): Array<{language: string, code: string, suggestedPath?: string}> {
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)\n```/g;
        const blocks: Array<{language: string, code: string, suggestedPath?: string}> = [];
        let match;
        
        while ((match = codeBlockRegex.exec(text)) !== null) {
            const language = match[1] || 'text';
            const code = match[2];
            let suggestedPath;
            
            // Try to infer file path from context
            const lines = code.split('\n');
            const firstLine = lines[0];
            
            // Check for React components
            if ((language === 'jsx' || language === 'tsx') && 
                (code.includes('export default') || code.includes('const ') && code.includes('= () =>'))) {
                const componentMatch = code.match(/(?:export default |const )(\w+)/);
                if (componentMatch) {
                    suggestedPath = `components/${componentMatch[1]}.${language}`;
                }
            }
            
            // Check for utility functions
            if ((language === 'js' || language === 'ts') && 
                (code.includes('export ') || code.includes('function '))) {
                const funcMatch = code.match(/(?:export (?:function |const )?)(\w+)/);
                if (funcMatch) {
                    suggestedPath = `utils/${funcMatch[1]}.${language}`;
                }
            }
            
            // Check for JSON data
            if (language === 'json') {
                if (code.includes('leaderboard') || code.includes('rank')) {
                    suggestedPath = 'public/leaderboard.json';
                }
            }
            
            // Check for Python scripts
            if (language === 'python' || language === 'py') {
                if (code.includes('stake') || code.includes('leaderboard')) {
                    suggestedPath = 'python-scripts/update_script.py';
                }
            }
            
            blocks.push({
                language,
                code,
                suggestedPath
            });
        }
        
        return blocks;
    }
    
    private _update() {
        const webview = this._panel.webview;
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }
    
    private _getHtmlForWebview(webview: vscode.Webview) {
        // Get resource URIs
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'webview', 'chat.css')
        );
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'webview', 'chat.js')
        );
        
        // Get nonce for security
        const nonce = this.getNonce();
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="${styleUri}" rel="stylesheet">
    <title>Claude Assistant</title>
</head>
<body>
    <div class="chat-container">
        <div class="chat-header">
            <div class="header-content">
                <span class="chat-title">🤖 Claude Assistant</span>
                <div class="header-actions">
                    <button id="getCurrentFile" class="action-btn" title="Get Current File">📄</button>
                    <button id="getProjectStructure" class="action-btn" title="Project Structure">📁</button>
                    <button id="clearHistory" class="action-btn" title="Clear Chat">🗑️</button>
                </div>
            </div>
        </div>
        
        <div class="chat-messages" id="chatMessages">
            <div class="message assistant">
                <div class="message-content">
                    <div class="welcome-message">
                        <h3>🥩 Welcome to STAKE Development Assistant!</h3>
                        <p>I'm here to help you with your STAKE Leaderboard project. I can:</p>
                        <ul>
                            <li>✨ Generate and modify React components</li>
                            <li>🔧 Fix bugs and optimize code</li>
                            <li>📊 Update leaderboard and referral systems</li>
                            <li>🧪 Create tests and documentation</li>
                            <li>🎨 Improve UI/UX and styling</li>
                        </ul>
                        <p><strong>Try asking:</strong></p>
                        <div class="example-prompts">
                            <button class="prompt-btn" onclick="sendExamplePrompt('Add a new chart to the referral dashboard')">Add referral chart</button>
                            <button class="prompt-btn" onclick="sendExamplePrompt('Fix the mobile responsiveness in the leaderboard')">Fix mobile issues</button>
                            <button class="prompt-btn" onclick="sendExamplePrompt('Create a new tier called Mega Staker')">Add new tier</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="current-file-info" id="currentFileInfo" style="display: none;">
            <span class="file-path" id="filePath"></span>
            <span class="file-language" id="fileLanguage"></span>
        </div>
        
        <div class="chat-input-container">
            <div class="chat-input">
                <textarea 
                    id="messageInput" 
                    placeholder="Ask Claude to help with your STAKE project..." 
                    rows="3"
                ></textarea>
                <button id="sendButton" class="send-btn">
                    <span class="send-icon">⚡</span>
                </button>
            </div>
        </div>
    </div>
    
    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }
    
    private getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}