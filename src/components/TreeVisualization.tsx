import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { WikiNode } from '../types/wiki';

interface TreeVisualizationProps {
  nodes: WikiNode[];
  onNodeClick?: (node: WikiNode) => void;
  width?: number;
  height?: number;
}

interface D3Node extends d3.HierarchyPointNode<WikiNode> {
  _children?: D3Node[];
}

const TreeVisualization: React.FC<TreeVisualizationProps> = ({ 
  nodes, 
  onNodeClick, 
  width = 800, 
  height = 600 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!nodes.length || !svgRef.current) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll("*").remove();

    // Build hierarchy from flat node array
    const root = buildHierarchy(nodes);
    if (!root) return;

    // Set up dimensions and margins
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG and main group
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create tree layout
    const tree = d3.tree<WikiNode>()
      .size([innerHeight, innerWidth]);

    const treeData = tree(root);

    // Add links
    g.selectAll('.link')
      .data(treeData.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal<any, D3Node>()
        .x((d: D3Node) => d.y)
        .y((d: D3Node) => d.x)
      )
      .style('fill', 'none')
      .style('stroke', '#555')
      .style('stroke-width', '2px');

    // Add nodes
    const node = g.selectAll('.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: D3Node) => `translate(${d.y},${d.x})`)
      .style('cursor', 'pointer')
      .on('click', (_, d) => {
        if (onNodeClick) {
          onNodeClick(d.data);
        }
      });

    // Add circles for nodes
    node.append('circle')
      .attr('r', 8)
      .style('fill', (d: D3Node) => d.children ? '#555' : '#999')
      .style('stroke', '#fff')
      .style('stroke-width', '2px');

    // Add labels
    node.append('text')
      .attr('dy', '.35em')
      .attr('x', (d: D3Node) => d.children ? -13 : 13)
      .style('text-anchor', (d: D3Node) => d.children ? 'end' : 'start')
      .style('font-size', '12px')
      .style('fill', '#333')
      .text((d: D3Node) => truncateText(d.data.title, 20));

    // Add tooltips
    node.append('title')
      .text((d: D3Node) => `${d.data.title}\n${d.data.url}`);

  }, [nodes, width, height, onNodeClick]);

  const buildHierarchy = (flatNodes: WikiNode[]): d3.HierarchyNode<WikiNode> | null => {
    if (flatNodes.length === 0) return null;

    // Find root node (node with no parent)
    const rootNode = flatNodes.find(node => node.parentId === null);
    if (!rootNode) return null;

    // Create node map for quick lookup
    const nodeMap = new Map(flatNodes.map(node => [node.id, node]));

    // Build children relationships
    flatNodes.forEach(node => {
      node.children = flatNodes
        .filter(child => child.parentId === node.id)
        .map(child => child.id);
    });

    // Convert to d3 hierarchy
    const buildTree = (nodeId: string): any => {
      const node = nodeMap.get(nodeId);
      if (!node) return null;

      return {
        ...node,
        children: node.children.map(buildTree).filter(Boolean)
      };
    };

    return d3.hierarchy(buildTree(rootNode.id));
  };

  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="w-full h-full">
      <svg ref={svgRef} className="w-full h-full border border-gray-300 rounded"></svg>
    </div>
  );
};

export default TreeVisualization;
