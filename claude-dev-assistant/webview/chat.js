// VS Code API
const vscode = acquireVsCodeApi();

// DOM elements
let chatMessages, messageInput, sendButton;
let currentFileInfo, filePath, fileLanguage;

// State
let isThinking = false;
let currentFile = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    loadChatHistory();
});

function initializeElements() {
    chatMessages = document.getElementById('chatMessages');
    messageInput = document.getElementById('messageInput');
    sendButton = document.getElementById('sendButton');
    currentFileInfo = document.getElementById('currentFileInfo');
    filePath = document.getElementById('filePath');
    fileLanguage = document.getElementById('fileLanguage');
}

function setupEventListeners() {
    // Send message
    sendButton.addEventListener('click', sendMessage);
    
    // Enter to send (Shift+Enter for new line)
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    // Header actions
    document.getElementById('getCurrentFile')?.addEventListener('click', getCurrentFile);
    document.getElementById('getProjectStructure')?.addEventListener('click', getProjectStructure);
    document.getElementById('clearHistory')?.addEventListener('click', clearHistory);
    
    // Listen for messages from extension
    window.addEventListener('message', handleExtensionMessage);
}

function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || isThinking) return;
    
    // Add user message to chat
    addUserMessage(message);
    
    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Send to extension
    vscode.postMessage({
        type: 'sendMessage',
        content: message
    });
    
    // Show thinking indicator
    showThinking();
}

function sendExamplePrompt(prompt) {
    messageInput.value = prompt;
    sendMessage();
}

function addUserMessage(message) {
    const messageElement = createMessageElement('user', message);
    chatMessages.appendChild(messageElement);
    scrollToBottom();
}

function addAssistantMessage(content, codeBlocks = []) {
    hideThinking();
    
    const messageElement = createMessageElement('assistant', content, codeBlocks);
    chatMessages.appendChild(messageElement);
    scrollToBottom();
}

function createMessageElement(role, content, codeBlocks = []) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Process content for markdown-like formatting
    let processedContent = content;
    
    // Convert **bold** to <strong>
    processedContent = processedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *italic* to <em>
    processedContent = processedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert `code` to <code>
    processedContent = processedContent.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Convert line breaks
    processedContent = processedContent.replace(/\n/g, '<br>');
    
    messageContent.innerHTML = processedContent;
    messageDiv.appendChild(messageContent);
    
    // Add code blocks if present
    if (codeBlocks && codeBlocks.length > 0) {
        codeBlocks.forEach(block => {
            const codeBlockElement = createCodeBlock(block);
            messageDiv.appendChild(codeBlockElement);
        });
    }
    
    return messageDiv;
}

function createCodeBlock(block) {
    const codeBlockDiv = document.createElement('div');
    codeBlockDiv.className = 'code-block';
    
    // Header
    const headerDiv = document.createElement('div');
    headerDiv.className = 'code-header';
    
    const langSpan = document.createElement('span');
    langSpan.textContent = block.language;
    headerDiv.appendChild(langSpan);
    
    // Actions
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'code-actions';
    
    if (block.suggestedPath) {
        // Apply to existing file
        const applyBtn = document.createElement('button');
        applyBtn.className = 'code-btn';
        applyBtn.textContent = 'Apply';
        applyBtn.onclick = () => applyCode(block.suggestedPath, block.code);
        actionsDiv.appendChild(applyBtn);
        
        // Create new file
        const createBtn = document.createElement('button');
        createBtn.className = 'code-btn create';
        createBtn.textContent = 'Create';
        createBtn.onclick = () => createFile(block.suggestedPath, block.code);
        actionsDiv.appendChild(createBtn);
    } else {
        // Copy to clipboard
        const copyBtn = document.createElement('button');
        copyBtn.className = 'code-btn';
        copyBtn.textContent = 'Copy';
        copyBtn.onclick = () => copyToClipboard(block.code);
        actionsDiv.appendChild(copyBtn);
    }
    
    headerDiv.appendChild(actionsDiv);
    codeBlockDiv.appendChild(headerDiv);
    
    // Content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'code-content';
    contentDiv.textContent = block.code;
    codeBlockDiv.appendChild(contentDiv);
    
    return codeBlockDiv;
}

function applyCode(filePath, content) {
    vscode.postMessage({
        type: 'applyCode',
        filePath: filePath,
        content: content
    });
    
    showNotification(`Applying code to ${filePath}...`);
}

function createFile(filePath, content) {
    vscode.postMessage({
        type: 'createFile',
        filePath: filePath,
        content: content
    });
    
    showNotification(`Creating ${filePath}...`);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Code copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showNotification('Failed to copy code', 'error');
    });
}

function getCurrentFile() {
    vscode.postMessage({ type: 'getCurrentFile' });
}

function getProjectStructure() {
    vscode.postMessage({ type: 'getProjectStructure' });
}

function clearHistory() {
    if (confirm('Clear chat history?')) {
        vscode.postMessage({ type: 'clearHistory' });
    }
}

function showThinking() {
    if (isThinking) return;
    
    isThinking = true;
    sendButton.disabled = true;
    
    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'thinking-indicator';
    thinkingDiv.id = 'thinking-indicator';
    
    thinkingDiv.innerHTML = `
        <span>Claude is thinking</span>
        <div class="thinking-dots">
            <div class="thinking-dot"></div>
            <div class="thinking-dot"></div>
            <div class="thinking-dot"></div>
        </div>
    `;
    
    chatMessages.appendChild(thinkingDiv);
    scrollToBottom();
}

function hideThinking() {
    isThinking = false;
    sendButton.disabled = false;
    
    const thinkingIndicator = document.getElementById('thinking-indicator');
    if (thinkingIndicator) {
        thinkingIndicator.remove();
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateCurrentFileInfo(fileInfo) {
    if (fileInfo) {
        currentFile = fileInfo;
        filePath.textContent = fileInfo.path;
        fileLanguage.textContent = fileInfo.language;
        currentFileInfo.style.display = 'flex';
    } else {
        currentFileInfo.style.display = 'none';
        currentFile = null;
    }
}

function handleExtensionMessage(event) {
    const message = event.data;
    
    switch (message.type) {
        case 'assistantMessage':
            addAssistantMessage(message.content, message.codeBlocks);
            break;
            
        case 'thinking':
            showThinking();
            break;
            
        case 'error':
            hideThinking();
            showNotification(message.message, 'error');
            break;
            
        case 'fileOperationResult':
            showNotification(message.message, message.operation.success ? 'success' : 'error');
            break;
            
        case 'currentFileInfo':
            updateCurrentFileInfo(message.fileInfo);
            if (message.fileInfo) {
                addSystemMessage(`📄 Current file: ${message.fileInfo.path} (${message.fileInfo.language})`);
            }
            break;
            
        case 'projectStructure':
            displayProjectStructure(message.structure);
            break;
            
        case 'historyCleared':
            clearChatMessages();
            showNotification('Chat history cleared');
            break;
            
        default:
            console.log('Unknown message type:', message.type);
    }
}

function addSystemMessage(content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.style.background = 'rgba(255, 215, 0, 0.1)';
    messageContent.style.border = '1px solid rgba(255, 215, 0, 0.3)';
    messageContent.style.color = '#ffd700';
    messageContent.style.fontSize = '13px';
    messageContent.textContent = content;
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function displayProjectStructure(structure) {
    let structureText = '📁 **STAKE Project Structure:**\n\n';
    
    for (const [directory, files] of Object.entries(structure)) {
        structureText += `**${directory}/**: ${files.length} files\n`;
        if (files.length > 0) {
            const displayFiles = files.slice(0, 5); // Show first 5 files
            structureText += displayFiles.map(file => `  • ${file}`).join('\n');
            if (files.length > 5) {
                structureText += `\n  • ... and ${files.length - 5} more`;
            }
            structureText += '\n\n';
        }
    }
    
    addAssistantMessage(structureText);
}

function clearChatMessages() {
    // Keep welcome message, clear others
    const messages = chatMessages.querySelectorAll('.message');
    for (let i = 1; i < messages.length; i++) {
        messages[i].remove();
    }
}

function loadChatHistory() {
    // Try to restore previous state from VS Code
    const state = vscode.getState();
    if (state && state.chatHistory) {
        // Restore chat history if needed
        console.log('Restoring chat history:', state.chatHistory.length, 'messages');
    }
}

function saveState() {
    // Save current state to VS Code
    const messages = Array.from(chatMessages.querySelectorAll('.message')).map(msg => ({
        role: msg.classList.contains('user') ? 'user' : 'assistant',
        content: msg.querySelector('.message-content').textContent
    }));
    
    vscode.setState({
        chatHistory: messages,
        currentFile: currentFile
    });
}

// Auto-save state periodically
setInterval(saveState, 5000);

// STAKE-specific helper functions
function insertStakeComponent(componentName) {
    const prompt = `Create a new React component called ${componentName} for the STAKE project. Make it responsive and follow the existing design patterns with gaming-style glow effects.`;
    messageInput.value = prompt;
    sendMessage();
}

function fixStakeBug(description) {
    const prompt = `Fix this bug in the STAKE project: ${description}. Analyze the current file and provide a complete solution.`;
    messageInput.value = prompt;
    sendMessage();
}

function updateStakeData() {
    const prompt = `Update the STAKE leaderboard data. Check the current data structure and suggest improvements for real-time updates.`;
    messageInput.value = prompt;
    sendMessage();
}

// Add STAKE-specific quick actions
document.addEventListener('DOMContentLoaded', function() {
    // Add quick action buttons to welcome message if they don't exist
    setTimeout(() => {
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage && !welcomeMessage.querySelector('.stake-actions')) {
            const stakeActionsDiv = document.createElement('div');
            stakeActionsDiv.className = 'stake-actions';
            stakeActionsDiv.innerHTML = `
                <h4 style="color: #ffd700; margin: 16px 0 8px 0;">🥩 STAKE Quick Actions:</h4>
                <div class="example-prompts">
                    <button class="prompt-btn" onclick="insertStakeComponent('NewFeature')">🆕 New Component</button>
                    <button class="prompt-btn" onclick="fixStakeBug('describe the issue')">🔧 Fix Bug</button>
                    <button class="prompt-btn" onclick="updateStakeData()">📊 Update Data</button>
                    <button class="prompt-btn" onclick="sendExamplePrompt('Optimize the referral system performance')">⚡ Optimize Code</button>
                    <button class="prompt-btn" onclick="sendExamplePrompt('Add TypeScript types to all components')">🔷 Add Types</button>
                </div>
            `;
            welcomeMessage.appendChild(stakeActionsDiv);
        }
    }, 1000);
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter: Send message
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        sendMessage();
    }
    
    // Ctrl/Cmd + L: Clear history
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        clearHistory();
    }
    
    // Ctrl/Cmd + F: Get current file
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        getCurrentFile();
    }
});

// Focus input on load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (messageInput) {
            messageInput.focus();
        }
    }, 100);
});