import React, { useState, useEffect } from 'react';
import type { WikiNode } from '../types/wiki';
import { WikiService } from '../services/WikiService';

interface NodeDetailsProps {
  node: WikiNode | null;
  onAddChild?: (parentId: string, url: string) => void;
  onClose?: () => void;
}

interface WikiInfo {
  title: string;
  summary: string;
}

const NodeDetails: React.FC<NodeDetailsProps> = ({ node, onAddChild, onClose }) => {
  const [wikiInfo, setWikiInfo] = useState<WikiInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [childUrl, setChildUrl] = useState('');

  useEffect(() => {
    if (!node) {
      setWikiInfo(null);
      return;
    }

    const fetchInfo = async () => {
      setLoading(true);
      try {
        console.log('Fetching info for:', node.title, 'Language:', node.language);
        const info = await WikiService.fetchWikipediaInfo(node.title, node.language);
        console.log('Received info:', info);
        setWikiInfo(info);
      } catch (error) {
        console.error('Error fetching wiki info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [node]);

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!node || !onAddChild || !childUrl.trim()) return;

    if (!WikiService.isValidWikipediaUrl(childUrl)) {
      alert('有効なWikipedia URLを入力してください');
      return;
    }

    try {
      await onAddChild(node.id, childUrl);
      setChildUrl('');
    } catch (error) {
      console.error('Error adding child node:', error);
    }
  };

  if (!node) {
    return (
      <div className="w-80 p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-500 text-center">ノードを選択してください</p>
      </div>
    );
  }

  return (
    <div className="w-80 p-4 bg-white border border-gray-300 rounded-lg shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
          {node.title}
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 ml-2"
          >
            ✕
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600">言語: {node.language}</p>
          <p className="text-sm text-gray-600">深度: {node.depth}</p>
          <p className="text-sm text-gray-600">
            追加日時: {node.timestamp.toLocaleString('ja-JP')}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm text-gray-600">情報を読み込み中...</span>
          </div>
        ) : wikiInfo ? (
          <div>
            <h4 className="font-medium text-gray-800 mb-2">概要</h4>
            <p className="text-sm text-gray-700 line-clamp-4">
              {wikiInfo.summary}
            </p>
          </div>
        ) : (
          <div>
            <h4 className="font-medium text-gray-800 mb-2">概要</h4>
            <p className="text-sm text-gray-500">
              概要の読み込みに失敗しましたが、記事は正常に追加されました。
              詳細を確認するには下のリンクからWikipediaページを開いてください。
            </p>
          </div>
        )}

        <div>
          <a
            href={node.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
          >
            Wikipediaで開く
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {onAddChild && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2">子記事を追加</h4>
            <form onSubmit={handleAddChild} className="space-y-2">
              <input
                type="url"
                value={childUrl}
                onChange={(e) => setChildUrl(e.target.value)}
                placeholder="Wikipedia URLを入力"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!childUrl.trim()}
                className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                追加
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeDetails;
