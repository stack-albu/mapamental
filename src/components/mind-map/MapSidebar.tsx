"use client";

import { Copy, Database, FilePlus2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { formatDate } from "@/lib/utils";
import type { MindMap } from "@/types/mind-map";

type MapSidebarProps = {
  activeId: string | null;
  maps: MindMap[];
  storageMode: string;
  onCreate: (title: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (map: MindMap) => void;
  onSelect: (id: string) => void;
};

export function MapSidebar({
  activeId,
  maps,
  storageMode,
  onCreate,
  onDelete,
  onDuplicate,
  onSelect,
}: MapSidebarProps) {
  const [title, setTitle] = useState("");

  return (
    <aside className="grid min-h-0 gap-4 border-b border-[var(--line)] bg-[var(--panel)] p-4 lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black tracking-normal">MapaMental</h1>
          <p className="text-sm text-[var(--muted)]">CRUD visual para ideias conectadas.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-2.5 py-1 text-xs font-semibold text-[var(--muted)]">
          <Database size={14} /> {storageMode === "supabase" ? "Supabase" : "Local"}
        </span>
      </div>

      <form
        className="grid gap-2 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!title.trim()) {
            return;
          }
          onCreate(title.trim());
          setTitle("");
        }}
      >
        <TextField
          label="Novo mapa"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ex.: Plano de estudos"
          value={title}
        />
        <Button icon={<FilePlus2 size={16} />} type="submit" variant="primary">
          Criar mapa
        </Button>
      </form>

      <div className="grid gap-2 overflow-y-auto pr-1">
        {maps.map((map) => (
          <article
            className={[
              "grid gap-3 rounded-lg border p-3 text-left transition",
              activeId === map.id
                ? "border-[var(--foreground)] bg-white shadow-sm"
                : "border-[var(--line)] bg-[var(--panel)] hover:border-[var(--foreground)]",
            ].join(" ")}
            key={map.id}
          >
            <button className="grid gap-1 text-left" onClick={() => onSelect(map.id)} type="button">
              <span className="text-sm font-bold text-[var(--foreground)]">{map.title}</span>
              <span className="line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
                {map.description || `${map.nodes.length} ideias conectadas`}
              </span>
              <span className="text-xs text-[var(--muted)]">Atualizado em {formatDate(map.updatedAt)}</span>
            </button>
            <div className="flex gap-2">
              <Button
                aria-label={`Duplicar ${map.title}`}
                className="h-9 min-h-9 flex-1 px-2"
                icon={<Copy size={15} />}
                onClick={() => onDuplicate(map)}
                title="Duplicar mapa"
                variant="ghost"
              >
                Duplicar
              </Button>
              <Button
                aria-label={`Excluir ${map.title}`}
                className="h-9 min-h-9 px-2"
                disabled={maps.length <= 1}
                icon={<Trash2 size={15} />}
                onClick={() => onDelete(map.id)}
                title="Excluir mapa"
                variant="ghost"
              />
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}
