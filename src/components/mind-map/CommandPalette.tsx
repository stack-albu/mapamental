"use client";

import { useEffect, useState, useRef } from "react";
import { Search, File, Hash, Map as MapIcon, X } from "lucide-react";
import type { MindMap } from "@/types/mind-map";
import { cn } from "@/lib/utils";

type CommandPaletteProps = {
  maps: MindMap[];
  onSelectMap: (id: string) => void;
  onSelectNode: (mapId: string, nodeId: string) => void;
};

export function CommandPalette({ maps, onSelectMap, onSelectNode }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else {
      setQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const searchResults = () => {
    if (!query.trim()) return [];
    
    const q = query.toLowerCase();
    const results: Array<{
      type: "map" | "node";
      title: string;
      subtitle?: string;
      mapId: string;
      nodeId?: string;
    }> = [];

    maps.forEach((map) => {
      // Busca no mapa
      if (map.title.toLowerCase().includes(q) || map.description.toLowerCase().includes(q)) {
        results.push({
          type: "map",
          title: map.title,
          subtitle: map.description || "Mapa Mental",
          mapId: map.id,
        });
      }

      // Busca nos nós e notas
      map.nodes.forEach((node) => {
        if (node.data.label.toLowerCase().includes(q) || (node.data.note && node.data.note.toLowerCase().includes(q))) {
          results.push({
            type: "node",
            title: node.data.label,
            subtitle: `Em: ${map.title}`,
            mapId: map.id,
            nodeId: node.id,
          });
        }
      });
    });

    return results.slice(0, 10);
  };

  const results = searchResults();

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
      <div 
        className="w-full max-w-lg bg-[var(--panel)] border border-[var(--line)] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-[var(--line)]">
          <Search className="w-5 h-5 text-[var(--muted)] mr-3" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent outline-none text-[var(--foreground)] placeholder:text-[var(--muted)]"
            placeholder="Buscar mapas, ideias ou notas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={() => setIsOpen(false)} className="p-1 rounded-md hover:bg-[var(--line)] text-[var(--muted)]">
            <X size={16} />
          </button>
        </div>

        {query.trim() && (
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {results.length === 0 ? (
              <p className="p-4 text-center text-sm text-[var(--muted)]">Nenhum resultado encontrado.</p>
            ) : (
              results.map((result, i) => (
                <button
                  key={`${result.type}-${result.mapId}-${result.nodeId || i}`}
                  className="w-full flex items-start gap-3 p-3 rounded-lg text-left hover:bg-[var(--line)] transition-colors"
                  onClick={() => {
                    if (result.type === "map") {
                      onSelectMap(result.mapId);
                    } else if (result.type === "node" && result.nodeId) {
                      onSelectNode(result.mapId, result.nodeId);
                    }
                    setIsOpen(false);
                  }}
                >
                  <div className={cn("mt-0.5 w-8 h-8 rounded flex items-center justify-center shrink-0", 
                    result.type === "map" ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"
                  )}>
                    {result.type === "map" ? <MapIcon size={16} /> : <Hash size={16} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--foreground)]">{result.title}</h4>
                    {result.subtitle && <p className="text-xs text-[var(--muted)]">{result.subtitle}</p>}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
        
        <div className="px-4 py-2 border-t border-[var(--line)] bg-[var(--panel-strong)] flex items-center gap-4 text-xs text-[var(--muted)]">
          <span><kbd className="px-1.5 py-0.5 rounded border border-[var(--line)] bg-[var(--panel)]">↑↓</kbd> Navegar</span>
          <span><kbd className="px-1.5 py-0.5 rounded border border-[var(--line)] bg-[var(--panel)]">Enter</kbd> Selecionar</span>
          <span><kbd className="px-1.5 py-0.5 rounded border border-[var(--line)] bg-[var(--panel)]">Esc</kbd> Fechar</span>
        </div>
      </div>
    </div>
  );
}
