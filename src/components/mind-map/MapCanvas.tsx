"use client";

import {
  Controls,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import { GitBranchPlus, Plus, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState, useEffect } from "react";
import { nodeColors } from "@/constants/default-mind-map";
import { Button } from "@/components/ui/Button";
import { MindMapNodeCard } from "@/components/mind-map/MindMapNodeCard";
import type { MindMap, MindMapEdge, MindMapNode, MindMapNodeSide, Viewport } from "@/types/mind-map";

type MapCanvasProps = {
  map: MindMap;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onChange: (map: MindMap) => void;
  onViewportChange?: (viewport: Viewport) => void;
  theme?: "light" | "dark";
};

import { MindMapEdge as MindMapEdgeComponent } from "@/components/mind-map/MindMapEdge";

const nodeTypes = {
  mindMapNode: MindMapNodeCard,
};

const edgeTypes = {
  mindMapEdge: MindMapEdgeComponent,
};

function createNodeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `node-${Date.now()}`;
}

function resolveSide(parent: MindMapNode | undefined, index: number): MindMapNodeSide {
  if (parent?.data.side) {
    return parent.data.side;
  }
  if (parent && parent.id !== "root") {
    return parent.position.x < 0 ? "left" : "right";
  }
  return index % 2 === 0 ? "right" : "left";
}

function createStyledEdge(source: MindMapNode, target: MindMapNode, side: MindMapNodeSide): MindMapEdge {
  const color = target.data.color;
  const isFromRoot = source.id === "root";
  const isBranchToLeaf = target.data.variant === "leaf";

  return {
    id: `${source.id}-${target.id}`,
    source: source.id,
    target: target.id,
    sourceHandle: isFromRoot ? side : `${side}-source`,
    targetHandle: side === "right" ? "left-target" : "right-target",
    type: "mindMapEdge",
    animated: false,
    style: {
      stroke: color,
      strokeWidth: isFromRoot ? 3 : isBranchToLeaf ? 1.8 : 2.2,
    },
  };
}

function getDescendants(nodeId: string, edges: MindMapEdge[]): string[] {
  const children = edges.filter(e => e.source === nodeId).map(e => e.target);
  return children.reduce((acc, childId) => [...acc, childId, ...getDescendants(childId, edges)], [] as string[]);
}

function getAncestors(nodeId: string, edges: MindMapEdge[]): string[] {
  const parentEdge = edges.find(e => e.target === nodeId);
  if (!parentEdge) return [];
  return [parentEdge.source, ...getAncestors(parentEdge.source, edges)];
}

export function MapCanvas({ map, selectedNodeId, onSelectNode, onChange, onViewportChange, theme = "light" }: MapCanvasProps) {
  const [viewportKey, setViewportKey] = useState(0);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  const nodes = useMemo(() => map.nodes, [map.nodes]);
  const edges = useMemo(() => map.edges, [map.edges]);

  const updateNodes = useCallback(
    (nextNodes: MindMapNode[]) => {
      onChange({ ...map, nodes: nextNodes });
    },
    [map, onChange],
  );

  const updateEdges = useCallback(
    (nextEdges: MindMapEdge[]) => {
      onChange({ ...map, edges: nextEdges });
    },
    [map, onChange],
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const positionChanges = changes.filter(c => c.type === 'position' && (c as { dragging?: boolean }).dragging) as { id: string; position?: { x: number; y: number } }[];
      let nextNodes = applyNodeChanges(changes, nodes) as MindMapNode[];
      
      // Aplicar drag a todos os descendentes
      if (positionChanges.length > 0) {
        positionChanges.forEach(change => {
           const node = nodes.find(n => n.id === change.id);
           const nextNode = nextNodes.find(n => n.id === change.id);
           if (node && nextNode && nextNode.position && node.position) {
             const dx = nextNode.position.x - node.position.x;
             const dy = nextNode.position.y - node.position.y;
             
             if (dx !== 0 || dy !== 0) {
               const descendants = getDescendants(node.id, edges);
               nextNodes = nextNodes.map(n => {
                 if (descendants.includes(n.id)) {
                   return { ...n, position: { x: n.position.x + dx, y: n.position.y + dy } };
                 }
                 return n;
               });
             }
           }
        });
      }

      updateNodes(nextNodes);
    },
    [nodes, edges, updateNodes],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      updateEdges(applyEdgeChanges(changes, edges) as MindMapEdge[]);
    },
    [edges, updateEdges],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);
      const color = targetNode?.data.color ?? sourceNode?.data.color ?? nodeColors[0];

      updateEdges(
        addEdge(
          {
            ...connection,
            animated: false,
            type: "mindMapEdge",
            style: { stroke: color, strokeWidth: 2 },
          },
          edges,
        ) as MindMapEdge[],
      );
    },
    [edges, nodes, updateEdges],
  );

  const handleLabelChange = useCallback((id: string, newLabel: string) => {
    const nextNodes = nodes.map(n => n.id === id ? { ...n, data: { ...n.data, label: newLabel } } : n);
    updateNodes(nextNodes);
    setEditingNodeId(null);
  }, [nodes, updateNodes]);

  const handleToggleCollapse = useCallback((id: string) => {
    const nextNodes = nodes.map(n => n.id === id ? { ...n, data: { ...n.data, isCollapsed: !n.data.isCollapsed } } : n);
    updateNodes(nextNodes);
  }, [nodes, updateNodes]);

  const addChildNode = useCallback((parentId?: string) => {
    const targetParentId = parentId ?? selectedNodeId ?? "root";
    const parent = nodes.find((node) => node.id === targetParentId) ?? nodes[0];
    if (!parent) return;

    const children = edges.filter(e => e.source === parent.id);
    const index = children.length;
    const id = createNodeId();
    const side = resolveSide(parent, index);
    const direction = side === "right" ? 1 : -1;
    const isRootChild = parent.id === "root";
    const color = isRootChild ? nodeColors[index % nodeColors.length] : parent.data.color;
    
    const x = parent.position.x + direction * (isRootChild ? 320 : 275);
    const y = parent.position.y + (children.length * 50) - ((children.length) * 25);

    const nextNode: MindMapNode = {
      id,
      type: "mindMapNode",
      position: { x, y },
      data: {
        label: "",
        color,
        side,
        variant: isRootChild ? "branch" : "leaf",
      },
    };

    const nextNodes = [...nodes, nextNode];
    const nextEdges = [...edges, createStyledEdge(parent, nextNode, side)];
    const finalNodes = nextNodes.map(n => n.id === parent.id ? { ...n, data: { ...n.data, isCollapsed: false } } : n);

    onChange({ ...map, nodes: finalNodes, edges: nextEdges });
    onSelectNode(id);
    setTimeout(() => setEditingNodeId(id), 50);
  }, [edges, map, nodes, onChange, onSelectNode, selectedNodeId]);

  const addSiblingNode = useCallback((siblingId?: string) => {
    const targetId = siblingId ?? selectedNodeId;
    if (!targetId || targetId === "root") {
      addChildNode();
      return;
    }
    const node = nodes.find(n => n.id === targetId);
    if (!node) return;
    const parentEdge = edges.find(e => e.target === targetId);
    if (!parentEdge) return;
    const parent = nodes.find(n => n.id === parentEdge.source);
    if (!parent) return;

    const side = node.data.side ?? "right";
    const id = createNodeId();

    // Place sibling right below the current node
    const x = node.position.x;
    const y = node.position.y + 52; 

    const nextNode: MindMapNode = {
      id,
      type: "mindMapNode",
      position: { x, y },
      data: {
        label: "",
        color: node.data.color,
        side,
        variant: node.data.variant,
      },
    };

    const nextNodes = [...nodes, nextNode];
    const nextEdges = [...edges, createStyledEdge(parent, nextNode, side)];

    onChange({ ...map, nodes: nextNodes, edges: nextEdges });
    onSelectNode(id);
    setTimeout(() => setEditingNodeId(id), 50);
  }, [edges, map, nodes, onChange, onSelectNode, selectedNodeId, addChildNode]);

  const deleteNode = useCallback((nodeId: string) => {
    if (!nodeId || nodeId === "root" || nodes.length <= 1) {
      return;
    }
    const descendants = getDescendants(nodeId, edges);
    const toDelete = [nodeId, ...descendants];

    // Find parent to select after deletion
    const parentEdge = edges.find(e => e.target === nodeId);
    const nextSelectedId = parentEdge?.source ?? null;

    onChange({
      ...map,
      nodes: nodes.filter((node) => !toDelete.includes(node.id)),
      edges: edges.filter((edge) => !toDelete.includes(edge.source) && !toDelete.includes(edge.target)),
    });
    onSelectNode(nextSelectedId);
    setEditingNodeId(null);
  }, [edges, map, nodes, onChange, onSelectNode]);

  const deleteSelectedNode = useCallback(() => {
    if (!selectedNodeId) return;
    deleteNode(selectedNodeId);
  }, [selectedNodeId, deleteNode]);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (editingNodeId) return;

    if (e.key === "Tab") {
      e.preventDefault();
      addChildNode();
    } else if (e.key === "Enter") {
      e.preventDefault();
      addSiblingNode();
    } else if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      deleteSelectedNode();
    } else if ((e.key === " " || e.key === "F2") && selectedNodeId) {
      e.preventDefault();
      setEditingNodeId(selectedNodeId);
    } else if (e.key === "Escape") {
      setEditingNodeId(null);
      onSelectNode(null);
    }
  }, [editingNodeId, addChildNode, addSiblingNode, deleteSelectedNode, selectedNodeId, onSelectNode]);

  const onMoveEnd = useCallback((_event?: unknown, vp?: { x: number; y: number; zoom: number }) => {
    if (vp && onViewportChange) {
      onViewportChange({ x: vp.x, y: vp.y, zoom: vp.zoom });
    }
  }, [onViewportChange]);

  const collapsedNodeIds = useMemo(() => new Set(nodes.filter(n => n.data.isCollapsed).map(n => n.id)), [nodes]);
  
  const visibleNodes = useMemo(() => {
    return nodes.filter(node => {
      if (node.id === "root") return true;
      const ancestors = getAncestors(node.id, edges);
      return !ancestors.some(id => collapsedNodeIds.has(id));
    }).map(node => ({
      ...node,
      data: {
        ...node.data,
        isEditing: editingNodeId === node.id,
        hasChildren: edges.some(e => e.source === node.id),
        onLabelChange: (label: string) => handleLabelChange(node.id, label),
        onToggleCollapse: () => handleToggleCollapse(node.id),
        onAddChild: () => addChildNode(node.id),
        onAddSibling: () => addSiblingNode(node.id),
        onDelete: () => deleteNode(node.id),
        onStartEditing: () => setEditingNodeId(node.id),
        onChangeColor: (color: string) => {
          // Also update all descendant nodes' color
          const descendants = getDescendants(node.id, edges);
          const nextNodes = nodes.map(n => {
            if (n.id === node.id || descendants.includes(n.id)) {
              return { ...n, data: { ...n.data, color } };
            }
            return n;
          });
          // Update edges too
          const nextEdges = edges.map(e => {
            if (e.target === node.id || descendants.includes(e.target)) {
              return { ...e, style: { ...e.style, stroke: color } };
            }
            return e;
          });
          onChange({ ...map, nodes: nextNodes, edges: nextEdges });
        },
        onChangeEmoji: (emoji: string) => {
          const nextNodes = nodes.map(n => n.id === node.id ? { ...n, data: { ...n.data, emoji } } : n);
          updateNodes(nextNodes);
        }
      }
    }));
  }, [nodes, edges, collapsedNodeIds, editingNodeId, handleLabelChange, handleToggleCollapse, onSelectNode, addChildNode, addSiblingNode, updateNodes, deleteNode, onChange, map]);

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map(n => n.id)), [visibleNodes]);
  const visibleEdges = useMemo(() => edges.filter(e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)), [edges, visibleNodeIds]);

  return (
    <section 
      className="absolute inset-0 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--panel)] shadow-[var(--shadow)] outline-none"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
        <Button icon={<Plus size={16} />} onClick={() => addChildNode()} title="Adicionar filho (Tab)">
          Filho
        </Button>
        <Button icon={<Plus size={16} />} onClick={() => addSiblingNode()} title="Adicionar irmão (Enter)" variant="ghost">
          Irmão
        </Button>
        {selectedNodeId && selectedNodeId !== "root" && (
          <Button 
            icon={<Trash2 size={16} />} 
            onClick={deleteSelectedNode} 
            title="Excluir selecionado (Delete)" 
            variant="ghost"
            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
          >
            Excluir
          </Button>
        )}
        <Button
          icon={<GitBranchPlus size={16} />}
          onClick={() => setViewportKey((key) => key + 1)}
          title="Reenquadrar mapa"
          variant="ghost"
        >
          Reenquadrar
        </Button>
      </div>

      <ReactFlow
        className="mind-map-flow"
        key={`${map.id}-${viewportKey}`}
        colorMode={theme}
        nodes={visibleNodes}
        edges={visibleEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onConnect={handleConnect}
        onEdgesChange={handleEdgesChange}
        onNodesChange={handleNodesChange}
        onNodeClick={(_, node) => {
          onSelectNode(node.id);
        }}
        onNodeDoubleClick={(_, node) => {
          setEditingNodeId(node.id);
        }}
        onPaneClick={() => {
          onSelectNode(null);
          setEditingNodeId(null);
        }}
        onMoveEnd={onMoveEnd}
        defaultViewport={map.viewport || undefined}
        defaultEdgeOptions={{ type: "mindMapEdge" }}
        fitView={!map.viewport}
        fitViewOptions={{ padding: 0.22 }}
        minZoom={0.2}
        maxZoom={1.35}
        proOptions={{ hideAttribution: true }}
        deleteKeyCode={null}
      >
        <Controls position="bottom-left" showInteractive={false} />
      </ReactFlow>
    </section>
  );
}