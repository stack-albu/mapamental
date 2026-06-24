"use client";

import { Archive, Check, Circle, Save, Edit3, Eye, Sparkles } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/Button";
import { TextAreaField, TextField } from "@/components/ui/Field";
import { nodeColors } from "@/constants/default-mind-map";
import { cn, parseTags } from "@/lib/utils";
import type { MindMap, MindMapNode, MindMapStatus } from "@/types/mind-map";

type MapDetailsPanelProps = {
  error: string | null;
  map: MindMap;
  saving: boolean;
  selectedNode: MindMapNode | null;
  onChange: (map: MindMap) => void;
  onSave: () => void;
};

const statusOptions: Array<{ value: MindMapStatus; label: string }> = [
  { value: "active", label: "Ativo" },
  { value: "draft", label: "Rascunho" },
  { value: "archived", label: "Arquivado" },
];

export function MapDetailsPanel({
  error,
  map,
  saving,
  selectedNode,
  onChange,
  onSave,
}: MapDetailsPanelProps) {
  const [noteMode, setNoteMode] = useState<"edit" | "preview">("edit");

  function updateMap(partial: Partial<MindMap>) {
    onChange({ ...map, ...partial });
  }

  function updateSelectedNode(data: Partial<MindMapNode["data"]>) {
    if (!selectedNode) {
      return;
    }

    onChange({
      ...map,
      nodes: map.nodes.map((node) =>
        node.id === selectedNode.id ? { ...node, data: { ...node.data, ...data } } : node,
      ),
    });
  }

  return (
    <aside className="grid min-h-0 gap-4 border-t border-[var(--line)] bg-[var(--panel)] p-4 lg:border-l lg:border-t-0">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black">Propriedades</h2>
          <p className="text-sm text-[var(--muted)]">{map.nodes.length} ideias, {map.edges.length} conexões</p>
        </div>
        <Button
          disabled={saving}
          icon={saving ? <Circle className="animate-spin" size={16} /> : <Save size={16} />}
          onClick={onSave}
          title="Salvar mapa"
          variant="primary"
        >
          {saving ? "Salvando" : "Salvar"}
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3">
        <TextField
          label="Título"
          onChange={(event) => updateMap({ title: event.target.value })}
          value={map.title}
        />
        <TextAreaField
          label="Descrição"
          onChange={(event) => updateMap({ description: event.target.value })}
          value={map.description}
        />
        <TextField
          hint="Separe por vírgulas."
          label="Tags"
          onChange={(event) => updateMap({ tags: parseTags(event.target.value) })}
          value={map.tags.join(", ")}
        />
        <div className="grid gap-1.5 text-sm">
          <span className="font-semibold text-[var(--foreground)]">Status</span>
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-[var(--line)] bg-[var(--background)] p-1">
            {statusOptions.map((option) => (
              <button
                className={cn(
                  "inline-flex min-h-9 items-center justify-center rounded-md px-2 text-xs font-bold transition",
                  map.status === option.value
                    ? "bg-[var(--foreground)] text-white"
                    : "text-[var(--muted)] hover:bg-[var(--panel-strong)]",
                )}
                key={option.value}
                onClick={() => updateMap({ status: option.value })}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 rounded-lg border border-[var(--line)] bg-[var(--background)] p-3">
        <div className="flex items-center gap-2">
          {selectedNode ? <Check size={16} /> : <Archive size={16} />}
          <h3 className="text-sm font-black">{selectedNode ? "Ideia selecionada" : "Nenhum nó selecionado"}</h3>
        </div>

        {selectedNode ? (
          <>
            <TextField
              label="Nome da ideia"
              onChange={(event) => updateSelectedNode({ label: event.target.value })}
              value={selectedNode.data.label}
            />
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Nota (Markdown)</span>
                <div className="flex bg-[var(--panel-strong)] rounded-md border border-[var(--line)] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setNoteMode("edit")}
                    className={cn(
                      "px-2 py-1 flex items-center gap-1.5 text-xs font-semibold transition-colors",
                      noteMode === "edit" ? "bg-[var(--foreground)] text-[var(--panel)]" : "text-[var(--muted)] hover:bg-[var(--line)]"
                    )}
                  >
                    <Edit3 size={12} /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoteMode("preview")}
                    className={cn(
                      "px-2 py-1 flex items-center gap-1.5 text-xs font-semibold transition-colors",
                      noteMode === "preview" ? "bg-[var(--foreground)] text-[var(--panel)]" : "text-[var(--muted)] hover:bg-[var(--line)]"
                    )}
                  >
                    <Eye size={12} /> Visualizar
                  </button>
                </div>
              </div>
              
              {noteMode === "edit" ? (
                <TextAreaField
                  label="Markdown"
                  onChange={(event) => updateSelectedNode({ note: event.target.value })}
                  value={selectedNode.data.note ?? ""}
                  placeholder="Escreva em markdown..."
                  className="min-h-[120px]"
                />
              ) : (
                <div className="min-h-[120px] max-h-[300px] overflow-y-auto p-3 text-sm text-[var(--foreground)] bg-[var(--panel-strong)] rounded-md border border-[var(--line)] prose prose-sm dark:prose-invert">
                  {selectedNode.data.note ? (
                    <ReactMarkdown>{selectedNode.data.note}</ReactMarkdown>
                  ) : (
                    <span className="text-[var(--muted)] italic">Nenhuma nota adicionada.</span>
                  )}
                </div>
              )}
            </div>
            <div className="grid gap-1.5">
              <span className="text-sm font-semibold">Cor</span>
              <div className="flex flex-wrap gap-2">
                {nodeColors.map((color) => (
                  <button
                    aria-label={`Selecionar cor ${color}`}
                    className={cn(
                      "h-8 w-8 rounded-full border-2 transition",
                      selectedNode.data.color === color ? "border-[var(--foreground)]" : "border-white",
                    )}
                    key={color}
                    onClick={() => updateSelectedNode({ color })}
                    style={{ background: color }}
                    title={color}
                    type="button"
                  />
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--line)]">
              <Button 
                variant="primary" 
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0 shadow-md flex items-center justify-center gap-2"
                onClick={async () => {
                  alert("IA Co-Pilot disparado! (API Mock configurada em /api/generate-nodes). Edite o arquivo para integrar com sua chave real.");
                  // Exemplo de como chamaria a API:
                  // const res = await fetch("/api/generate-nodes", { method: "POST", body: JSON.stringify({ prompt: selectedNode.data.label, parentId: selectedNode.id }) });
                  // const { suggestions } = await res.json();
                  // Aqui você faria um loop chamando `onAddChild` simulado para cada string do array.
                }}
              >
                <Sparkles size={14} /> Expandir com IA
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            Selecione uma ideia no canvas para editar nome, nota, cor ou usar a IA. Arraste entre os pontos dos nós para
            criar novas conexões.
          </p>
        )}
      </div>
    </aside>
  );
}
