import * as vscode from 'vscode';
import * as path from 'path';

export interface FileOperation {
    type: 'create' | 'update' | 'delete';
    filePath: string;
    content?: string;
    success: boolean;
    error?: string;
}

export class FileManager {
    private workspaceRoot: string;
    
    constructor() {
        this.workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    }
    
    // Read file content
    async readFile(relativePath: string): Promise<string> {
        try {
            const fullPath = path.join(this.workspaceRoot, relativePath);
            const uri = vscode.Uri.file(fullPath);
            const content = await vscode.workspace.fs.readFile(uri);
            return content.toString();
        } catch (error) {
            throw new Error(`Failed to read file ${relativePath}: ${error}`);
        }
    }
    
    // Write file content
    async writeFile(relativePath: string, content: string): Promise<FileOperation> {
        try {
            const fullPath = path.join(this.workspaceRoot, relativePath);
            const uri = vscode.Uri.file(fullPath);
            
            // Create directory if it doesn't exist
            const dirPath = path.dirname(fullPath);
            const dirUri = vscode.Uri.file(dirPath);
            
            try {
                await vscode.workspace.fs.stat(dirUri);
            } catch {
                await vscode.workspace.fs.createDirectory(dirUri);
            }
            
            // Check if file exists
            let isNewFile = false;
            try {
                await vscode.workspace.fs.stat(uri);
            } catch {
                isNewFile = true;
            }
            
            // Write file
            await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
            
            // Auto-save if the file is currently open
            const openEditor = vscode.window.visibleTextEditors.find(
                editor => editor.document.uri.fsPath === fullPath
            );
            
            if (openEditor) {
                await openEditor.document.save();
            }
            
            return {
                type: isNewFile ? 'create' : 'update',
                filePath: relativePath,
                content: content,
                success: true
            };
            
        } catch (error) {
            return {
                type: 'update',
                filePath: relativePath,
                success: false,
                error: `Failed to write file: ${error}`
            };
        }
    }
    
    // Create new file
    async createFile(relativePath: string, content: string): Promise<FileOperation> {
        const fullPath = path.join(this.workspaceRoot, relativePath);
        
        // Check if file already exists
        try {
            const uri = vscode.Uri.file(fullPath);
            await vscode.workspace.fs.stat(uri);
            
            // File exists, ask user what to do
            const choice = await vscode.window.showWarningMessage(
                `File ${relativePath} already exists. What would you like to do?`,
                'Overwrite',
                'Create with suffix',
                'Cancel'
            );
            
            if (choice === 'Cancel') {
                return {
                    type: 'create',
                    filePath: relativePath,
                    success: false,
                    error: 'Creation cancelled by user'
                };
            } else if (choice === 'Create with suffix') {
                const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
                const parsedPath = path.parse(relativePath);
                relativePath = path.join(parsedPath.dir, `${parsedPath.name}_${timestamp}${parsedPath.ext}`);
            }
            
        } catch {
            // File doesn't exist, proceed normally
        }
        
        return await this.writeFile(relativePath, content);
    }
    
    // Get file list in directory
    async listFiles(directoryPath: string, extensions?: string[]): Promise<string[]> {
        try {
            const fullPath = path.join(this.workspaceRoot, directoryPath);
            const uri = vscode.Uri.file(fullPath);
            const entries = await vscode.workspace.fs.readDirectory(uri);
            
            let files = entries
                .filter(([_, type]) => type === vscode.FileType.File)
                .map(([name, _]) => name);
            
            if (extensions) {
                files = files.filter(file => 
                    extensions.some(ext => file.endsWith(ext))
                );
            }
            
            return files;
            
        } catch (error) {
            throw new Error(`Failed to list files in ${directoryPath}: ${error}`);
        }
    }
    
    // Get current file content and info
    getCurrentFileInfo(): { path: string; content: string; language: string } | null {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return null;
        }
        
        const document = editor.document;
        const relativePath = path.relative(this.workspaceRoot, document.fileName);
        
        return {
            path: relativePath,
            content: document.getText(),
            language: document.languageId
        };
    }
    
    // Open file in editor
    async openFile(relativePath: string): Promise<void> {
        try {
            const fullPath = path.join(this.workspaceRoot, relativePath);
            const uri = vscode.Uri.file(fullPath);
            const document = await vscode.workspace.openTextDocument(uri);
            await vscode.window.showTextDocument(document);
        } catch (error) {
            throw new Error(`Failed to open file ${relativePath}: ${error}`);
        }
    }
    
    // STAKE project specific methods
    async updateComponent(componentName: string, newContent: string): Promise<FileOperation> {
        const componentPath = `components/${componentName}.jsx`;
        
        // Try .jsx first, then .tsx
        try {
            await this.readFile(componentPath);
        } catch {
            const tsxPath = `components/${componentName}.tsx`;
            try {
                await this.readFile(tsxPath);
                return await this.writeFile(tsxPath, newContent);
            } catch {
                // Component doesn't exist, create new one
                const extension = newContent.includes('interface ') || newContent.includes(': React.') ? '.tsx' : '.jsx';
                return await this.createFile(`components/${componentName}${extension}`, newContent);
            }
        }
        
        return await this.writeFile(componentPath, newContent);
    }
    
    async updateUtility(utilityName: string, newContent: string): Promise<FileOperation> {
        const utilityPath = `utils/${utilityName}.js`;
        
        // Try .js first, then .ts
        try {
            await this.readFile(utilityPath);
        } catch {
            const tsPath = `utils/${utilityName}.ts`;
            try {
                await this.readFile(tsPath);
                return await this.writeFile(tsPath, newContent);
            } catch {
                // Utility doesn't exist, create new one
                const extension = newContent.includes('export interface') || newContent.includes(': ') ? '.ts' : '.js';
                return await this.createFile(`utils/${utilityName}${extension}`, newContent);
            }
        }
        
        return await this.writeFile(utilityPath, newContent);
    }
    
    async updateLeaderboardData(data: any): Promise<FileOperation> {
        const jsonContent = JSON.stringify(data, null, 2);
        return await this.writeFile('public/leaderboard.json', jsonContent);
    }
    
    async getStakeProjectStructure(): Promise<{ [key: string]: string[] }> {
        const structure: { [key: string]: string[] } = {};
        
        const directories = ['components', 'pages', 'utils', 'public/data', 'python-scripts'];
        
        for (const dir of directories) {
            try {
                structure[dir] = await this.listFiles(dir);
            } catch {
                structure[dir] = [];
            }
        }
        
        return structure;
    }
    
    // Backup current state
    async createBackup(description: string): Promise<string> {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const backupDir = `backups/backup_${timestamp}`;
        
        // Get all important files
        const filesToBackup = [
            'package.json',
            'next.config.js',
            'tailwind.config.js'
        ];
        
        // Add all components and utils
        try {
            const components = await this.listFiles('components', ['.jsx', '.tsx']);
            filesToBackup.push(...components.map(f => `components/${f}`));
            
            const utils = await this.listFiles('utils', ['.js', '.ts']);
            filesToBackup.push(...utils.map(f => `utils/${f}`));
            
            const pages = await this.listFiles('pages', ['.jsx', '.tsx', '.js', '.ts']);
            filesToBackup.push(...pages.map(f => `pages/${f}`));
        } catch (error) {
            console.warn('Could not backup all files:', error);
        }
        
        // Create backup info
        const backupInfo = {
            timestamp: new Date().toISOString(),
            description: description,
            files: filesToBackup
        };
        
        await this.writeFile(`${backupDir}/backup-info.json`, JSON.stringify(backupInfo, null, 2));
        
        // Copy files
        for (const file of filesToBackup) {
            try {
                const content = await this.readFile(file);
                await this.writeFile(`${backupDir}/${file}`, content);
            } catch (error) {
                console.warn(`Could not backup ${file}:`, error);
            }
        }
        
        return backupDir;
    }
}