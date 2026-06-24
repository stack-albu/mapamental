"use client";

import { Handle, Position, NodeToolbar, type Node, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import type { MindMapNodeData } from "@/types/mind-map";
import { useState, useRef, useEffect } from "react";
import { Plus, Minus, Trash2 } from "lucide-react";
import { nodeColors } from "@/constants/default-mind-map";

type ExtendedNodeData = MindMapNodeData & {
  isEditing?: boolean;
  hasChildren?: boolean;
  onLabelChange?: (label: string) => void;
  onToggleCollapse?: () => void;
  onAddChild?: () => void;
  onAddSibling?: () => void;
  onDelete?: () => void;
  onChangeColor?: (color: string) => void;
  onChangeEmoji?: (emoji: string) => void;
  onStartEditing?: () => void;
};

type FlowNode = Node<ExtendedNodeData, "mindMapNode">;

const EMOJIS = ["🔥", "💡", "✅", "❌", "🚀", "⭐", "📌", ""];

function HiddenHandles() {
  return (
    <>
      <Handle className="mind-map-handle" id="left" position={Position.Left} type="source" />
      <Handle className="mind-map-handle" id="right" position={Position.Right} type="source" />
      <Handle className="mind-map-handle" id="left-source" position={Position.Left} type="source" />
      <Handle className="mind-map-handle" id="right-source" position={Position.Right} type="source" />
      <Handle className="mind-map-handle" id="left-target" position={Position.Left} type="target" />
      <Handle className="mind-map-handle" id="right-target" position={Position.Right} type="target" />
    </>
  );
}

function CollapseButton({ isCollapsed, onToggle, color }: { isCollapsed: boolean; onToggle: () => void; color: string }) {
  return (
    <button
      className="mm-collapse-btn flex-shrink-0 flex items-center justify-center w-[18px] h-[18px] rounded-full border-[1.5px] shadow-sm transition-all duration-150 hover:scale-110 z-20"
      style={{
        borderColor: color,
        backgroundColor: isCollapsed ? color : "var(--background)",
        color: isCollapsed ? "var(--background)" : color,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      title={isCollapsed ? "Expandir filhos" : "Recolher filhos"}
    >
      {isCollapsed ? <Plus size={10} strokeWidth={3} /> : <Minus size={10} strokeWidth={3} />}
    </button>
  );
}

function InlineInput({ value, onChange, className, color }: { value: string; onChange: (val: string) => void; className: string; color?: string }) {
  const [val, setVal] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleCommit = () => {
    const trimmed = val.trim();
    if (trimmed) {
      onChange(trimmed);
    } else {
      // If empty, keep original value
      onChange(value);
    }
  };

  return (
    <input
      ref={inputRef}
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={handleCommit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          handleCommit();
        }
        if (e.key === "Escape") {
          e.stopPropagation();
          onChange(value);
        }
        // Stop Tab from propagating so it doesn't add a child while typing
        if (e.key === "Tab") {
          e.stopPropagation();
        }
      }}
      className={cn("bg-transparent outline-none w-full text-inherit", className)}
      style={{
        minWidth: "80px",
        caretColor: color || "#2563eb",
      }}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    />
  );
}

function AddChildButton({ onAdd, isLeft, color }: { onAdd: () => void; isLeft?: boolean; color: string }) {
  return (
    <div className={cn("mm-add-child-btn flex items-center z-20", isLeft ? "flex-row-reverse" : "flex-row")}>
      {/* Connecting Stick */}
      <div className="w-[10px] h-[1.5px] transition-opacity" style={{ backgroundColor: color, opacity: 0.5 }} />

      {/* Button */}
      <button
        className="w-[20px] h-[20px] flex-shrink-0 rounded-full bg-[var(--background)] flex items-center justify-center shadow-sm transition-all duration-150 hover:scale-125 active:scale-95 border-[1.5px]"
        style={{ borderColor: color, color }}
        onClick={(e) => {
          e.stopPropagation();
          onAdd();
        }}
        title="Adicionar filho (Tab)"
      >
        <Plus size={11} strokeWidth={2.5} />
      </button>
    </div>
  );
}

function AddSiblingButton({ onAdd, color }: { onAdd: () => void; color: string }) {
  return (
    <div className="mm-add-sibling-btn absolute -bottom-[20px] left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
      {/* Connecting Stick */}
      <div className="w-[1.5px] h-[6px] transition-opacity" style={{ backgroundColor: color, opacity: 0.5 }} />

      {/* Button */}
      <button
        className="w-[20px] h-[20px] flex-shrink-0 rounded-full bg-[var(--background)] flex items-center justify-center shadow-sm transition-all duration-150 hover:scale-125 active:scale-95 border-[1.5px]"
        style={{ borderColor: color, color }}
        onClick={(e) => {
          e.stopPropagation();
          onAdd();
        }}
        title="Adicionar irmão (Enter)"
      >
        <Plus size={11} strokeWidth={2.5} />
      </button>
    </div>
  );
}

export function MindMapNodeCard({ data, selected }: NodeProps<FlowNode>) {
  const [isHovered, setIsHovered] = useState(false);
  const variant = data.variant ?? "leaf";
  const side = data.side ?? "right";
  const isLeft = side === "left";
  const showControls = selected || isHovered;
  const color = data.color;

  const renderLabel = (className: string) => {
    if (data.isEditing && data.onLabelChange) {
      return <InlineInput value={data.label} onChange={data.onLabelChange} className={className} color={color} />;
    }
    return (
      <span
        className={cn(className, "cursor-text select-none")}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (data.onStartEditing) data.onStartEditing();
        }}
      >
        {data.emoji && <span className="mr-1.5">{data.emoji}</span>}
        {data.label || <span className="text-[var(--muted)] italic">Clique duplo para editar</span>}
      </span>
    );
  };

  const renderToolbar = () => {
    if (!showControls) return null;
    if (!data.onChangeColor && !data.onChangeEmoji && !data.onDelete) return null;
    return (
      <NodeToolbar isVisible={showControls} position={Position.Top} className="mm-node-toolbar flex flex-col gap-1.5 p-2 bg-[var(--panel-strong)] border border-[var(--line)] rounded-xl shadow-lg z-50" style={{ minWidth: 'max-content' }}>
        {data.onChangeEmoji && (
          <div className="flex items-center gap-0.5 border-b border-[var(--line)] pb-1.5">
            {EMOJIS.map((emoji, i) => (
              <button
                key={i}
                onClick={() => data.onChangeEmoji!(emoji)}
                className={cn(
                  "w-7 h-7 flex items-center justify-center hover:bg-[var(--line)] rounded-md text-sm transition-all duration-100 hover:scale-110 active:scale-95",
                  data.emoji === emoji && "bg-blue-500/10 ring-1 ring-blue-500"
                )}
                title={emoji ? `Emoji: ${emoji}` : "Remover emoji"}
              >
                {emoji || "🚫"}
              </button>
            ))}
          </div>
        )}
        {data.onChangeColor && (
          <div className="flex items-center gap-1 pt-0.5">
            {nodeColors.map((c) => (
              <button
                key={c}
                onClick={() => data.onChangeColor!(c)}
                className={cn(
                  "w-5 h-5 rounded-full border-2 transition-all duration-100 hover:scale-125 active:scale-95",
                  data.color === c ? "border-[var(--foreground)] ring-2 ring-[var(--muted)]" : "border-transparent shadow-sm"
                )}
                style={{ backgroundColor: c }}
                title={`Cor: ${c}`}
              />
            ))}
          </div>
        )}
        {data.onDelete && variant !== "root" && (
          <div className="flex items-center justify-end border-t border-[var(--line)] pt-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.onDelete!();
              }}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-red-500 hover:text-red-400 hover:bg-red-500/10 px-2 py-1 rounded-md transition-colors"
              title="Excluir nó e filhos (Delete)"
            >
              <Trash2 size={12} />
              Excluir
            </button>
          </div>
        )}
      </NodeToolbar>
    );
  };

  // ─── Nó Central (Root) ───
  if (variant === "root") {
    return (
      <div
        className={cn(
          "mm-node mm-node-root relative grid min-h-[64px] w-[200px] place-items-center rounded-2xl px-5 py-4 text-center transition-all duration-200",
          selected ? "ring-2 ring-blue-500 ring-offset-2 shadow-lg" : "shadow-md hover:shadow-lg",
        )}
        style={{
          background: `linear-gradient(145deg, #dfd0ff, #eadeff)`,
          border: `1.5px solid ${color}60`,
        } as React.CSSProperties}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {renderToolbar()}
        <HiddenHandles />
        {renderLabel("whitespace-pre-line text-[14px] font-bold leading-[1.3] text-gray-800")}

        {/* Container for Front Controls */}
        <div className="absolute top-1/2 -translate-y-1/2 -right-0 translate-x-full flex items-center">
          {data.hasChildren && data.onToggleCollapse && (
            <CollapseButton isCollapsed={!!data.isCollapsed} onToggle={data.onToggleCollapse} color={color} />
          )}
          {showControls && data.onAddChild && (
            <AddChildButton onAdd={data.onAddChild} color={color} />
          )}
        </div>
      </div>
    );
  }

  // ─── Nós Filhos (Branch / Leaf) ───
  const isBranch = variant === "branch";

  return (
    <div
      className={cn(
        "mm-node relative flex items-center gap-1.5 transition-all duration-150 rounded-lg",
        isLeft ? "flex-row-reverse text-right" : "text-left",
        isBranch ? "min-h-[32px] max-w-[300px] px-3 py-1.5" : "min-h-[28px] max-w-[280px] px-2.5 py-1",
        selected
          ? "bg-[var(--background)] border-[1.5px] shadow-md z-10"
          : "border-[1.5px] border-transparent hover:bg-[var(--panel-strong)] hover:border-[var(--line)]",
      )}
      style={{
        borderColor: selected ? color : undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (data.onStartEditing) data.onStartEditing();
      }}
    >
      {renderToolbar()}
      <HiddenHandles />

      {/* Color indicator dot */}
      <div
        className={cn(
          "flex-shrink-0 rounded-full transition-all duration-150",
          isBranch ? "w-[6px] h-[6px]" : "w-[5px] h-[5px]",
          selected && "scale-0"
        )}
        style={{ backgroundColor: color }}
      />

      {renderLabel(cn(
        "block leading-snug text-[var(--foreground)]",
        isLeft ? "text-right" : "text-left",
        isBranch ? "text-[13.5px] font-semibold" : "text-[13px] font-medium",
        selected && "font-semibold"
      ))}

      {/* Container for Front Controls */}
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 flex items-center",
          isLeft ? "-left-0 -translate-x-full flex-row-reverse" : "-right-0 translate-x-full flex-row"
        )}
      >
        {data.hasChildren && data.onToggleCollapse && (
          <CollapseButton isCollapsed={!!data.isCollapsed} onToggle={data.onToggleCollapse} color={color} />
        )}
        {showControls && data.onAddChild && (
          <AddChildButton onAdd={data.onAddChild} isLeft={isLeft} color={color} />
        )}
      </div>

      {showControls && data.onAddSibling && (
        <AddSiblingButton onAdd={data.onAddSibling} color={color} />
      )}
    </div>
  );
}