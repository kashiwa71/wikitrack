export interface WikiNode {
  id: string;
  title: string;
  url: string;
  language: string;
  parentId: string | null;
  children: string[];
  depth: number;
  timestamp: Date;
}

export interface WikiGraph {
  nodes: WikiNode[];
  rootNodeId: string | null;
}

export interface Position {
  x: number;
  y: number;
}
