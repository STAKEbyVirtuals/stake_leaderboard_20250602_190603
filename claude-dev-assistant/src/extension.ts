import * as vscode from 'vscode';
import axios from 'axios';

// Claude API 설정
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export function activate(context: vscode.ExtensionContext) {
    console.log('Claude Dev Assistant is now active!');
    
    // API 키 확인
    const config = vscode.workspace.getConfiguration('claude');
    let apiKey = config.get<string>('apiKey');
    
    // 1. Start Chat 명령어
    let chatCommand = vscode.commands.registerCommand('claude.openChat', async () => {
        // API 키 확인
        if (!apiKey) {
            const action = await vscode.window.showWarningMessage(
                'Claude API Key가 필요합니다.',
                'API Key 입력'
            );
            
            if (action === 'API Key 입력') {
                const inputKey = await vscode.window.showInputBox({
                    prompt: 'Anthropic API Key를 입력하세요',
                    placeHolder: 'sk-ant-...',
                    password: true
                });
                
                if (inputKey) {
                    await config.update('apiKey', inputKey, vscode.ConfigurationTarget.Global);
                    apiKey = inputKey;
                    vscode.window.showInformationMessage('API Key가 저장되었습니다!');
                } else {
                    return;
                }
            } else {
                return;
            }
        }
        
        // 사용자 입력 받기
        const userInput = await vscode.window.showInputBox({
            prompt: 'Claude에게 질문하세요',
            placeHolder: '예: STAKE 프로젝트의 포인트 계산 로직을 설명해줘',
            ignoreFocusOut: true
        });
        
        if (userInput) {
            await askClaude(userInput, apiKey);
        }
    });
    
    // 2. Analyze File 명령어
    let analyzeCommand = vscode.commands.registerCommand('claude.analyzeFile', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('분석할 파일을 열어주세요.');
            return;
        }
        
        if (!apiKey) {
            vscode.window.showWarningMessage('먼저 API Key를 설정해주세요.');
            return;
        }
        
        const document = editor.document;
        const fileName = document.fileName.split(/[\\/]/).pop();
        const content = document.getText();
        
        const prompt = `다음 코드를 분석해주세요:\n\n파일명: ${fileName}\n\n\`\`\`\n${content}\n\`\`\`\n\n개선점, 버그, 최적화 방안을 알려주세요.`;
        
        await askClaude(prompt, apiKey);
    });
    
    // 3. Fix Code 명령어
    let fixCommand = vscode.commands.registerCommand('claude.fixCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('수정할 코드를 선택해주세요.');
            return;
        }
        
        if (!apiKey) {
            vscode.window.showWarningMessage('먼저 API Key를 설정해주세요.');
            return;
        }
        
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        
        if (!selectedText) {
            vscode.window.showWarningMessage('수정할 코드를 선택해주세요.');
            return;
        }
        
        const prompt = `다음 코드의 문제를 수정해주세요:\n\n\`\`\`\n${selectedText}\n\`\`\`\n\n수정된 코드만 보여주세요.`;
        
        await askClaude(prompt, apiKey, true);
    });
    
    // 4. Generate Tests 명령어
    let testCommand = vscode.commands.registerCommand('claude.generateTests', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('테스트를 생성할 코드를 열어주세요.');
            return;
        }
        
        if (!apiKey) {
            vscode.window.showWarningMessage('먼저 API Key를 설정해주세요.');
            return;
        }
        
        const content = editor.document.getText();
        const fileName = editor.document.fileName.split(/[\\/]/).pop();
        
        const prompt = `다음 코드에 대한 단위 테스트를 생성해주세요:\n\n파일명: ${fileName}\n\n\`\`\`\n${content}\n\`\`\`\n\nJest나 적절한 테스트 프레임워크를 사용한 테스트 코드를 제공해주세요.`;
        
        await askClaude(prompt, apiKey);
    });
    
    // 명령어 등록
    context.subscriptions.push(chatCommand, analyzeCommand, fixCommand, testCommand);
    
    // 상태바 아이템 추가
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(comment) Claude';
    statusBarItem.tooltip = 'Claude Assistant';
    statusBarItem.command = 'claude.openChat';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
}

async function askClaude(prompt: string, apiKey: string, replaceSelection: boolean = false) {
    // 진행 상태 표시
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Claude가 생각중입니다...",
        cancellable: false
    }, async (progress) => {
        try {
            progress.report({ increment: 30 });
            
            // 모델 설정 가져오기
            const config = vscode.workspace.getConfiguration('claude');
            const model = config.get<string>('model') || 'claude-opus-4-20250514';
            
            // API 호출
            const response = await axios.post(
                ANTHROPIC_API_URL,
                {
                    model: model,
                    messages: [{
                        role: "user",
                        content: prompt
                    }],
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
            
            progress.report({ increment: 70 });
            
            const claudeResponse = response.data.content[0].text;
            
            // 선택한 텍스트 교체 모드
            if (replaceSelection) {
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    await editor.edit(editBuilder => {
                        editBuilder.replace(editor.selection, claudeResponse);
                    });
                    vscode.window.showInformationMessage('코드가 수정되었습니다!');
                }
            } else {
                // 새 편집기에 결과 표시
                const doc = await vscode.workspace.openTextDocument({
                    content: `# Claude의 응답\n\n${claudeResponse}`,
                    language: 'markdown'
                });
                
                await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
            }
            
            progress.report({ increment: 100 });
            
        } catch (error: any) {
            let errorMessage = 'Claude API 오류가 발생했습니다.';
            
            if (error.response) {
                if (error.response.status === 401) {
                    errorMessage = 'API Key가 올바르지 않습니다.';
                } else if (error.response.status === 429) {
                    errorMessage = 'API 요청 한도를 초과했습니다.';
                } else {
                    errorMessage = `오류: ${error.response.data?.error?.message || error.message}`;
                }
            }
            
            vscode.window.showErrorMessage(errorMessage);
            console.error('Claude API Error:', error);
        }
    });
}

export function deactivate() {
    console.log('Claude Dev Assistant deactivated');
}