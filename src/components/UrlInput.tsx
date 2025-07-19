import React, { useState } from 'react';
import { WikiService } from '../services/WikiService';

interface UrlInputProps {
  onAddNode: (url: string, parentId?: string) => void;
  disabled?: boolean;
}

const UrlInput: React.FC<UrlInputProps> = ({ onAddNode, disabled }) => {
  const [url, setUrl] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) return;

    if (!WikiService.isValidWikipediaUrl(url)) {
      setIsValid(false);
      return;
    }

    setIsLoading(true);
    try {
      await onAddNode(url);
      setUrl('');
      setIsValid(true);
    } catch (error) {
      console.error('Error adding node:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    
    if (newUrl && !WikiService.isValidWikipediaUrl(newUrl)) {
      setIsValid(false);
    } else {
      setIsValid(true);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <input
            type="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://ja.wikipedia.org/wiki/記事名"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              !isValid ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={disabled || isLoading}
          />
          {!isValid && (
            <p className="text-red-500 text-sm mt-1">
              有効なWikipedia URLを入力してください
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={disabled || isLoading || !url.trim() || !isValid}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? '追加中...' : '追加'}
        </button>
      </form>
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>使い方:</strong></p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Wikipediaの記事URLを入力して「追加」ボタンを押してください</li>
          <li>樹形図のノードをクリックすると、そのページから新しい記事を追加できます</li>
          <li>閲覧履歴が樹形図として表示されます</li>
        </ol>
      </div>
    </div>
  );
};

export default UrlInput;
