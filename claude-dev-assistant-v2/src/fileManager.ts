import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface FileOperation {
    success: boolean;
    message?: string;
    error?: string;
    filePath?: string;
}

export interface ProjectStructure {
    components: string[];
    pages: string[];
    utils: string[];
    styles: string[];
    data: string[];
}

export class FileManager {
    private workspaceRoot: string;

    constructor() {
        this.workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    }

    // 📁 프로젝트 구조 분석
    async getProjectStructure(): Promise<ProjectStructure> {
        const structure: ProjectStructure = {
            components: [],
            pages: [],
            utils: [],
            styles: [],
            data: []
        };

        try {
            // components 폴더 스캔
            const componentsPath = path.join(this.workspaceRoot, 'components');
            if (fs.existsSync(componentsPath)) {
                structure.components = await this.scanDirectory(componentsPath, ['.jsx', '.tsx', '.js', '.ts']);
            }

            // pages 폴더 스캔
            const pagesPath = path.join(this.workspaceRoot, 'pages');
            if (fs.existsSync(pagesPath)) {
                structure.pages = await this.scanDirectory(pagesPath, ['.jsx', '.tsx', '.js', '.ts']);
            }

            // utils 폴더 스캔
            const utilsPath = path.join(this.workspaceRoot, 'utils');
            if (fs.existsSync(utilsPath)) {
                structure.utils = await this.scanDirectory(utilsPath, ['.js', '.ts']);
            }

            // styles 폴더 스캔
            const stylesPath = path.join(this.workspaceRoot, 'styles');
            if (fs.existsSync(stylesPath)) {
                structure.styles = await this.scanDirectory(stylesPath, ['.css', '.scss', '.sass']);
            }

            // public/data 폴더 스캔
            const dataPath = path.join(this.workspaceRoot, 'public', 'data');
            if (fs.existsSync(dataPath)) {
                structure.data = await this.scanDirectory(dataPath, ['.json']);
            }

            return structure;
        } catch (error) {
            console.error('Error scanning project structure:', error);
            return structure;
        }
    }

    // 📄 파일 읽기
    async readFile(filePath: string): Promise<string> {
        try {
            const fullPath = this.resolveFilePath(filePath);
            return fs.readFileSync(fullPath, 'utf8');
        } catch (error) {
            throw new Error(`파일을 읽을 수 없습니다: ${filePath} - ${error}`);
        }
    }

    // ✏️ 파일 쓰기
    async writeFile(filePath: string, content: string): Promise<FileOperation> {
        try {
            const fullPath = this.resolveFilePath(filePath);
            const dirPath = path.dirname(fullPath);

            // 디렉토리가 없으면 생성
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            fs.writeFileSync(fullPath, content, 'utf8');

            return {
                success: true,
                message: `파일이 성공적으로 저장되었습니다: ${filePath}`,
                filePath: fullPath
            };
        } catch (error) {
            return {
                success: false,
                error: `파일 저장 실패: ${error}`
            };
        }
    }

    // 📝 새 파일 생성
    async createFile(filePath: string, content: string): Promise<FileOperation> {
        try {
            const fullPath = this.resolveFilePath(filePath);

            // 파일이 이미 존재하는지 확인
            if (fs.existsSync(fullPath)) {
                const choice = await vscode.window.showWarningMessage(
                    `파일이 이미 존재합니다: ${filePath}`,
                    '덮어쓰기',
                    '취소'
                );

                if (choice !== '덮어쓰기') {
                    return {
                        success: false,
                        error: '사용자가 취소했습니다.'
                    };
                }
            }

            return await this.writeFile(filePath, content);
        } catch (error) {
            return {
                success: false,
                error: `파일 생성 실패: ${error}`
            };
        }
    }

    // 🔍 STAKE 관련 파일 찾기
    async findSTAKEFiles(): Promise<{ [key: string]: string[] }> {
        const stakeFiles: { [key: string]: string[] } = {
            components: [],
            utils: [],
            data: [],
            configs: []
        };

        try {
            const structure = await this.getProjectStructure();

            // STAKE 관련 컴포넌트 찾기
            stakeFiles.components = structure.components.filter(file => 
                file.toLowerCase().includes('referral') ||
                file.toLowerCase().includes('leaderboard') ||
                file.toLowerCase().includes('dashboard') ||
                file.toLowerCase().includes('stake')
            );

            // STAKE 관련 유틸리티 찾기
            stakeFiles.utils = structure.utils.filter(file =>
                file.toLowerCase().includes('referral') ||
                file.toLowerCase().includes('tier') ||
                file.toLowerCase().includes('points') ||
                file.toLowerCase().includes('calculation')
            );

            // 데이터 파일 찾기
            stakeFiles.data = structure.data.filter(file =>
                file.toLowerCase().includes('leaderboard') ||
                file.toLowerCase().includes('referral') ||
                file.toLowerCase().includes('users')
            );

            return stakeFiles;
        } catch (error) {
            console.error('Error finding STAKE files:', error);
            return stakeFiles;
        }
    }

    // 📊 STAKE 컴포넌트 템플릿 생성
    generateSTAKEComponent(componentName: string, componentType: 'chart' | 'dashboard' | 'modal' | 'form'): string {
        const templates = {
            chart: this.getChartTemplate(componentName),
            dashboard: this.getDashboardTemplate(componentName),
            modal: this.getModalTemplate(componentName),
            form: this.getFormTemplate(componentName)
        };

        return templates[componentType];
    }

    // 🎯 Git 자동 커밋용 스마트 메시지 생성
    generateCommitMessage(filePath: string, changeType: 'create' | 'update' | 'fix'): string {
        const fileName = path.basename(filePath, path.extname(filePath));
        const fileType = this.getFileType(filePath);

        const messages = {
            create: {
                component: `feat: Add ${fileName} component for STAKE project`,
                util: `feat: Add ${fileName} utility function`,
                data: `feat: Add ${fileName} data structure`,
                config: `feat: Add ${fileName} configuration`,
                style: `style: Add ${fileName} styles`
            },
            update: {
                component: `update: Enhance ${fileName} component functionality`,
                util: `update: Improve ${fileName} utility logic`,
                data: `update: Update ${fileName} data structure`,
                config: `update: Modify ${fileName} configuration`,
                style: `style: Update ${fileName} styles`
            },
            fix: {
                component: `fix: Resolve issues in ${fileName} component`,
                util: `fix: Fix ${fileName} utility function`,
                data: `fix: Correct ${fileName} data structure`,
                config: `fix: Fix ${fileName} configuration`,
                style: `fix: Fix ${fileName} styles`
            }
        };

        return messages[changeType][fileType] || `${changeType}: Update ${fileName}`;
    }

    // Private helper methods
    private async scanDirectory(dirPath: string, extensions: string[]): Promise<string[]> {
        const files: string[] = [];
        
        try {
            const items = fs.readdirSync(dirPath);
            
            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                const stat = fs.statSync(itemPath);
                
                if (stat.isDirectory()) {
                    // 재귀적으로 하위 디렉토리 스캔
                    const subFiles = await this.scanDirectory(itemPath, extensions);
                    files.push(...subFiles.map(f => path.relative(this.workspaceRoot, f)));
                } else if (extensions.some(ext => item.endsWith(ext))) {
                    files.push(path.relative(this.workspaceRoot, itemPath));
                }
            }
        } catch (error) {
            console.error(`Error scanning directory ${dirPath}:`, error);
        }
        
        return files;
    }

    private resolveFilePath(filePath: string): string {
        if (path.isAbsolute(filePath)) {
            return filePath;
        }
        return path.join(this.workspaceRoot, filePath);
    }

    private getFileType(filePath: string): 'component' | 'util' | 'data' | 'config' | 'style' {
        const lowercasePath = filePath.toLowerCase();
        
        if (lowercasePath.includes('components/') || lowercasePath.endsWith('.jsx') || lowercasePath.endsWith('.tsx')) {
            return 'component';
        }
        if (lowercasePath.includes('utils/') || lowercasePath.includes('lib/')) {
            return 'util';
        }
        if (lowercasePath.includes('data/') || lowercasePath.endsWith('.json')) {
            return 'data';
        }
        if (lowercasePath.includes('config') || lowercasePath.includes('.config.')) {
            return 'config';
        }
        if (lowercasePath.endsWith('.css') || lowercasePath.endsWith('.scss')) {
            return 'style';
        }
        
        return 'component'; // default
    }

    // 📊 컴포넌트 템플릿들
    private getChartTemplate(componentName: string): string {
        return `import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ${componentName}Props {
  data?: any[];
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ 
  data = [], 
  className = '' 
}) => {
  const [chartData, setChartData] = useState(data);

  useEffect(() => {
    setChartData(data);
  }, [data]);

  return (
    <div className={\`w-full h-64 \${className}\`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date" 
            stroke="#ffd700"
            fontSize={12}
          />
          <YAxis 
            stroke="#ffd700"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid #ffd700',
              borderRadius: '8px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#ffd700" 
            strokeWidth={2}
            dot={{ fill: '#ffd700', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ${componentName};`;
    }

    private getDashboardTemplate(componentName: string): string {
        return `import React, { useState, useEffect } from 'react';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className = '' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // STAKE 데이터 로드 로직
    const loadData = async () => {
      try {
        setIsLoading(true);
        // 여기에 데이터 로드 로직 추가
        setData({});
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className={\`flex items-center justify-center p-8 \${className}\`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className={\`bg-gray-900/50 backdrop-blur-sm border border-yellow-400/30 rounded-lg p-6 \${className}\`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-yellow-400">
          ${componentName.replace(/([A-Z])/g, ' $1').trim()}
        </h2>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-sm text-gray-400">실시간</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 대시보드 콘텐츠 */}
        <div className="bg-black/20 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-2">총 사용자</h3>
          <p className="text-2xl font-bold text-white">1,234</p>
        </div>
        
        <div className="bg-black/20 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-2">활성 사용자</h3>
          <p className="text-2xl font-bold text-green-400">987</p>
        </div>
        
        <div className="bg-black/20 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-2">총 포인트</h3>
          <p className="text-2xl font-bold text-yellow-400">5.6M</p>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};`;
    }

    private getModalTemplate(componentName: string): string {
        return `import React from 'react';

interface ${componentName}Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

const ${componentName}: React.FC<${componentName}Props> = ({ 
  isOpen, 
  onClose, 
  title = '',
  children 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-900 border border-yellow-400/30 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-yellow-400/20">
          <h3 className="text-lg font-semibold text-yellow-400">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {children}
        </div>
        
        {/* Footer */}
        <div className="flex justify-end space-x-2 p-4 border-t border-yellow-400/20">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            취소
          </button>
          <button
            className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-300 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};`;
    }

    private getFormTemplate(componentName: string): string {
        return `import React, { useState } from 'react';

interface ${componentName}Props {
  onSubmit: (data: any) => void;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onSubmit, className = '' }) => {
  const [formData, setFormData] = useState({
    // 폼 필드들
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('폼 제출 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={\`space-y-4 \${className}\`}>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          라벨
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="입력하세요..."
        />
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 px-4 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? '처리 중...' : '제출'}
      </button>
    </form>
  );
};

export default ${componentName};`;
    }
}