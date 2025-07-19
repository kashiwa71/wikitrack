import React from 'react';
import type { WikiNode } from '../types/wiki';

interface BreadcrumbNavigationProps {
  currentPath: WikiNode[];
  onNodeClick: (node: WikiNode) => void;
  onGoBack: () => void;
}

const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({ 
  currentPath, 
  onNodeClick, 
  onGoBack 
}) => {
  if (currentPath.length === 0) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="text-gray-500 text-center">閲覧履歴がありません</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">閲覧パス</h3>
        {currentPath.length > 1 && (
          <button
            onClick={onGoBack}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            ← 戻る
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        {currentPath.map((node, index) => (
          <div key={node.id} className="flex items-center">
            <div className="flex items-center space-x-2">
              {/* 深度インジケーター */}
              <div 
                className="w-4 h-4 rounded-full text-xs flex items-center justify-center text-white"
                style={{ 
                  backgroundColor: `hsl(${(index * 60) % 360}, 70%, 50%)`,
                  marginLeft: `${index * 16}px`
                }}
              >
                {index + 1}
              </div>
              
              {/* ノード情報 */}
              <button
                onClick={() => onNodeClick(node)}
                className={`text-left px-3 py-2 rounded-lg border transition-colors ${
                  index === currentPath.length - 1
                    ? 'bg-blue-100 border-blue-300 text-blue-800 font-medium'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium truncate max-w-xs">
                    {node.title}
                  </span>
                  {node.visitCount > 1 && (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                      {node.visitCount}回
                    </span>
                  )}
                  {index === currentPath.length - 1 && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                      現在
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {node.language} • {node.timestamp.toLocaleTimeString('ja-JP')}
                </div>
              </button>
            </div>
            
            {/* 接続線 */}
            {index < currentPath.length - 1 && (
              <div className="ml-4 border-l-2 border-gray-300 h-6"></div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>💡 <strong>使い方:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>「子記事を追加」で深掘りを記録</li>
          <li>「戻る」ボタンで前の記事に戻る</li>
          <li>パンくずの記事をクリックで任意の段階に移動</li>
        </ul>
      </div>
    </div>
  );
};

export default BreadcrumbNavigation;
