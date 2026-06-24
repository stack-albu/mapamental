export type MindMapStatus = "draft" | "active" | "archived";

export type MindMapNodeVariant = "root" | "branch" | "leaf";
export type MindMapNodeSide = "left" | "right";

export type MindMapNodeData = {
  label: string;
  note?: string;
  color: string;
  emoji?: string;
  variant?: MindMapNodeVariant;
  side?: MindMapNodeSide;
  isCollapsed?: boolean;
};

export type MindMapNode = {
  id: string;
  type?: string;
  position: {
    x: number;
    y: number;
  };
  data: MindMapNodeData;
};

export type MindMapEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  animated?: boolean;
  type?: string;
  style?: {
    stroke?: string;
    strokeWidth?: number;
  };
};

export type Viewport = {
  x: number;
  y: number;
  zoom: number;
};

export type MindMap = {
  id: string;
  title: string;
  description: string;
  status: MindMapStatus;
  isFavorite?: boolean;
  tags: string[];
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  viewport?: Viewport;
  createdAt: string;
  updatedAt: string;
};

export type MindMapInput = {
  title: string;
  description?: string;
  tags?: string[];
};

import { z } from "zod";

export const mindMapNodeDataSchema = z.object({
  label: z.string(),
  note: z.string().optional(),
  color: z.string(),
  emoji: z.string().optional(),
  variant: z.enum(["root", "branch", "leaf"]).optional(),
  side: z.enum(["left", "right"]).optional(),
  isCollapsed: z.boolean().optional(),
});

export const mindMapNodeSchema = z.object({
  id: z.string(),
  type: z.string().optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: mindMapNodeDataSchema,
});

export const mindMapEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().nullable().optional(),
  targetHandle: z.string().nullable().optional(),
  animated: z.boolean().optional(),
  type: z.string().optional(),
  style: z.object({
    stroke: z.string().optional(),
    strokeWidth: z.number().optional(),
  }).optional(),
});

export const viewportSchema = z.object({
  x: z.number(),
  y: z.number(),
  zoom: z.number(),
});

export const mindMapSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum(["draft", "active", "archived"]),
  isFavorite: z.boolean().optional(),
  tags: z.array(z.string()),
  nodes: z.array(mindMapNodeSchema),
  edges: z.array(mindMapEdgeSchema),
  viewport: viewportSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});