import { useState } from 'react';
import TreeVisualization from './components/TreeVisualization';
import UrlInput from './components/UrlInput';
import NodeDetails from './components/NodeDetails';
import { WikiService } from './services/WikiService';
import type { WikiNode } from './types/wiki';
import './App.css';

function App() {
  const [nodes, setNodes] = useState<WikiNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<WikiNode | null>(null);

  const addNode = async (url: string, parentId?: string) => {
    const title = WikiService.extractWikipediaTitle(url);
    if (!title) {
      throw new Error('Invalid Wikipedia URL');
    }

    // Check if node already exists
    const existingNode = nodes.find(node => node.url === url);
    if (existingNode) {
      setSelectedNode(existingNode);
      return;
    }

    const depth = parentId ? 
      (nodes.find(n => n.id === parentId)?.depth ?? 0) + 1 : 0;

    const newNode = WikiService.createNode(title, url, parentId, depth);
    
    setNodes(prevNodes => {
      const updatedNodes = [...prevNodes, newNode];
      
      // Update parent's children array if this is a child node
      if (parentId) {
        return updatedNodes.map(node => 
          node.id === parentId 
            ? { ...node, children: [...node.children, newNode.id] }
            : node
        );
      }
      
      return updatedNodes;
    });

    setSelectedNode(newNode);
  };

  const handleNodeClick = (node: WikiNode) => {
    setSelectedNode(node);
  };

  const handleAddChild = async (parentId: string, url: string) => {
    await addNode(url, parentId);
  };

  const clearGraph = () => {
    setNodes([]);
    setSelectedNode(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              WikiTracker - Wikipedia閲覧履歴の可視化
            </h1>
            {nodes.length > 0 && (
              <button
                onClick={clearGraph}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                グラフをクリア
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <UrlInput onAddNode={addNode} />
        </div>

        {nodes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl text-gray-600 mb-2">Wikipedia記事を追加して開始しましょう</h2>
            <p className="text-gray-500">
              上のフォームにWikipedia記事のURLを入力して、閲覧履歴の樹形図を作成できます。
            </p>
          </div>
        ) : (
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow border">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-800">
                    閲覧履歴ツリー ({nodes.length}記事)
                  </h2>
                </div>
                <div className="p-4">
                  <TreeVisualization 
                    nodes={nodes}
                    onNodeClick={handleNodeClick}
                    width={800}
                    height={600}
                  />
                </div>
              </div>
            </div>

            <div className="w-80">
              <NodeDetails 
                node={selectedNode}
                onAddChild={handleAddChild}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-gray-500 text-sm">
            WikiTracker - Wikipediaの閲覧履歴を樹形図で可視化
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
