export interface WikiNode {
  id: string;
  title: string;
  url: string;
  language: string;
  parentId: string | null;
  children: string[];
  depth: number;
  timestamp: Date;
  visitCount: number;
  isCurrentlyViewing: boolean;
}

export interface WikiPath {
  id: string;
  nodes: string[]; // Array of node IDs representing the path
  isActive: boolean;
  lastModified: Date;
}

export interface WikiGraph {
  nodes: WikiNode[];
  paths: WikiPath[];
  currentPath: string | null;
  rootNodeId: string | null;
}

export interface Position {
  x: number;
  y: number;
}
