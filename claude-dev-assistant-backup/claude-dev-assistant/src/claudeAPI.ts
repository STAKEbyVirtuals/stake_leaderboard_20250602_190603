import * as vscode from 'vscode';
import axios from 'axios';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export class ClaudeAPI {
    private apiKey: string = '';
    private baseURL = 'https://api.anthropic.com/v1/messages';
    private chatHistory: ChatMessage[] = [];
    
    constructor() {
        this.loadConfig();
    }
    
    private loadConfig() {
        const config = vscode.workspace.getConfiguration('claude');
        this.apiKey = config.get('apiKey', '');
        
        if (!this.apiKey) {
            console.log('⚠️ Claude API key not configured');
        }
    }
    
    private getHeaders() {
        return {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
        };
    }
    
    private getProjectContext(): string {
        const config = vscode.workspace.getConfiguration('claude');
        const projectContext = config.get('projectContext', '');
        
        return `
You are a development assistant for the ${projectContext}.

Key project details:
- Frontend: Next.js 13 + TypeScript + Tailwind CSS
- Web3: RainbowKit + Wagmi (Base chain)
- Data: Python scripts + Google Sheets integration
- Key components: Leaderboard, Referral system, Dashboard
- File structure: components/, pages/, utils/, python-scripts/

When modifying code:
1. Maintain existing patterns and styling
2. Follow TypeScript best practices
3. Ensure mobile responsiveness
4. Keep STAKE project theme (gaming style, glow effects)
5. Always provide complete, working code
6. Include necessary imports and dependencies

Current workspace: ${vscode.workspace.workspaceFolders?.[0]?.name || 'Unknown'}
        `.trim();
    }
    
    async sendMessage(userMessage: string): Promise<string> {
        if (!this.apiKey) {
            throw new Error('Claude API key not configured. Use "Claude: Configure API Key" command.');
        }
        
        // Add user message to history
        this.chatHistory.push({
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        });
        
        try {
            const config = vscode.workspace.getConfiguration('claude');
            const model = config.get('model', 'claude-3-sonnet-20240229');
            const maxTokens = config.get('maxTokens', 4000);
            
            // Prepare messages for API
            const messages = [
                {
                    role: 'user',
                    content: this.getProjectContext()
                },
                ...this.chatHistory.slice(-10).map(msg => ({
                    role: msg.role,
                    content: msg.content
                }))
            ];
            
            const response = await axios.post(this.baseURL, {
                model: model,
                max_tokens: maxTokens,
                messages: messages
            }, {
                headers: this.getHeaders(),
                timeout: 60000
            });
            
            const assistantMessage = response.data.content[0].text;
            
            // Add assistant response to history
            this.chatHistory.push({
                role: 'assistant',
                content: assistantMessage,
                timestamp: new Date()
            });
            
            return assistantMessage;
            
        } catch (error: any) {
            console.error('Claude API Error:', error);
            
            if (error.response?.status === 401) {
                throw new Error('Invalid API key. Please check your Claude API key.');
            } else if (error.response?.status === 429) {
                throw new Error('Rate limit exceeded. Please wait and try again.');
            } else if (error.code === 'ECONNABORTED') {
                throw new Error('Request timeout. Please try again.');
            } else {
                throw new Error(`API Error: ${error.message}`);
            }
        }
    }
    
    async analyzeCode(fileName: string, code: string): Promise<string> {
        const prompt = `
Please analyze this code file and provide:

1. **Code Quality Assessment**
   - Potential bugs or issues
   - Performance improvements
   - Security considerations

2. **STAKE Project Specific Review**
   - Integration with existing components
   - Consistency with project patterns
   - Mobile responsiveness check

3. **Improvement Suggestions**
   - Code optimization opportunities
   - Better TypeScript typing
   - Accessibility improvements

**File:** ${fileName}
**Code:**
\`\`\`
${code}
\`\`\`
        `;
        
        return await this.sendMessage(prompt);
    }
    
    async fixCode(code: string, language: string): Promise<string> {
        const prompt = `
Please fix any issues in this ${language} code and return ONLY the corrected code (no explanations, no markdown formatting).

Requirements:
- Fix syntax errors, logic bugs, and type issues
- Optimize for the STAKE project context
- Maintain existing functionality
- Improve code quality and readability
- Ensure mobile responsiveness for React/JSX components

Code to fix:
\`\`\`${language}
${code}
\`\`\`

Return only the fixed code:
        `;
        
        const response = await this.sendMessage(prompt);
        
        // Extract code from response (remove markdown if present)
        const codeMatch = response.match(/```[\w]*\n([\s\S]*?)\n```/);
        return codeMatch ? codeMatch[1] : response;
    }
    
    async generateTests(fileName: string, code: string): Promise<string> {
        const language = fileName.endsWith('.tsx') ? 'tsx' : 
                        fileName.endsWith('.ts') ? 'ts' : 
                        fileName.endsWith('.jsx') ? 'jsx' : 'js';
        
        const prompt = `
Generate comprehensive test suite for this ${language} file.

Use appropriate testing framework:
- React components: Jest + React Testing Library
- Utilities: Jest
- TypeScript: Include proper typing

**File:** ${fileName}
**Code:**
\`\`\`${language}
${code}
\`\`\`

Generate tests for:
1. All public functions/methods
2. Component rendering (if React)
3. User interactions (if applicable)
4. Edge cases and error conditions
5. STAKE project specific functionality

Return complete test file with proper imports and setup:
        `;
        
        return await this.sendMessage(prompt);
    }
    
    getChatHistory(): ChatMessage[] {
        return [...this.chatHistory];
    }
    
    clearHistory() {
        this.chatHistory = [];
    }
    
    // STAKE-specific helper methods
    async updateLeaderboard(requirements: string): Promise<string> {
        const prompt = `
Help me update the STAKE leaderboard system with these requirements:
${requirements}

Consider:
- Data structure in leaderboard.json
- React components in components/
- Python data processing scripts
- Mobile responsiveness
- Real-time updates

Provide step-by-step implementation with code examples.
        `;
        
        return await this.sendMessage(prompt);
    }
    
    async enhanceReferralSystem(requirements: string): Promise<string> {
        const prompt = `
Enhance the STAKE referral system with:
${requirements}

Focus on:
- ReferralSystem.jsx component
- URL parameter handling
- Points calculation logic
- Dashboard visualization
- Cross-device compatibility

Provide complete implementation details.
        `;
        
        return await this.sendMessage(prompt);
    }
}