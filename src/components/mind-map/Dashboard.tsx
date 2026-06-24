"use client";

import { Folder, Home, LayoutGrid, Moon, Plus, Search, Star, Sun, Trash2, Copy, Trash, BookOpen } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatDate, cn } from "@/lib/utils";
import type { MindMap, MindMapStatus } from "@/types/mind-map";
import { TemplateGallery } from "@/components/mind-map/TemplateGallery";

import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type TabType = "home" | "maps" | "favorites" | "trash" | "templates";

type DashboardProps = {
  maps: MindMap[];
  onCreate: (title: string) => void;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onChangeStatus: (id: string, status: MindMapStatus) => void;
  onDuplicate: (map: MindMap) => void;
  onDelete: (id: string) => void;
  onUseTemplate: (type: string, name: string) => void;
  storageMode: string;
  user?: User | null;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
  error?: string | null;
};

export function Dashboard({ 
  maps, 
  onCreate, 
  onSelect, 
  onToggleFavorite,
  onChangeStatus,
  onDuplicate,
  onDelete,
  onUseTemplate,
  storageMode, 
  user,
  theme = "light",
  onToggleTheme,
  error
}: DashboardProps) {
  const [search, setSearch] = useState("");
  const [currentTab, setCurrentTab] = useState<TabType>("home");

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
      window.location.reload();
    }
  };

  const filteredMaps = maps.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (currentTab === "trash") return m.status === "archived";
    if (m.status === "archived") return false;

    if (currentTab === "favorites") return m.isFavorite;
    return true; // home and maps show all active/draft
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className="flex min-h-dvh w-full bg-[var(--background)] text-[var(--foreground)]">
      {/* Sidebar */}
      <aside className="w-[260px] flex-shrink-0 bg-[var(--sidebar-bg)] text-[var(--sidebar-fg)] flex flex-col">
        <div className="p-4 flex items-center gap-2">
          <div className="bg-[#e91e63] text-white p-1.5 rounded-md">
            <LayoutGrid size={18} />
          </div>
          <span className="font-black text-lg tracking-tight">MindMeister Clone</span>
        </div>

        <div className="px-3 py-2">
          <Button 
            className="w-full justify-start bg-[var(--sidebar-active)] text-white hover:bg-blue-700 border-0" 
            icon={<Plus size={16} />}
            onClick={() => onCreate("Novo Mapa Mental")}
          >
            Novo mapa
          </Button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <button 
            onClick={() => setCurrentTab("home")}
            className={cn("flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition", currentTab === "home" ? "bg-[var(--sidebar-hover)] text-white" : "text-gray-400 hover:bg-[var(--sidebar-hover)] hover:text-white")}
          >
            <Home size={16} />
            Lar
          </button>
          <button 
            onClick={() => setCurrentTab("maps")}
            className={cn("flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition", currentTab === "maps" ? "bg-[var(--sidebar-hover)] text-white" : "text-gray-400 hover:bg-[var(--sidebar-hover)] hover:text-white")}
          >
            <Folder size={16} />
            Meus mapas
          </button>
          <button 
            onClick={() => setCurrentTab("favorites")}
            className={cn("flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition", currentTab === "favorites" ? "bg-[var(--sidebar-hover)] text-white" : "text-gray-400 hover:bg-[var(--sidebar-hover)] hover:text-white")}
          >
            <Star size={16} />
            Favoritos
          </button>
          <button 
            onClick={() => setCurrentTab("trash")}
            className={cn("flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition", currentTab === "trash" ? "bg-[var(--sidebar-hover)] text-white" : "text-gray-400 hover:bg-[var(--sidebar-hover)] hover:text-white")}
          >
            <Trash2 size={16} />
            Lixeira
          </button>

          <div className="border-t border-white/10 my-2" />

          <button 
            onClick={() => setCurrentTab("templates")}
            className={cn("flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition", currentTab === "templates" ? "bg-[var(--sidebar-hover)] text-white" : "text-gray-400 hover:bg-[var(--sidebar-hover)] hover:text-white")}
          >
            <BookOpen size={16} />
            Modelos prontos
          </button>
        </nav>

        <div className="p-4">
          <div className="text-xs text-[var(--muted)] font-medium">Modo de Armazenamento</div>
          <div className="text-sm font-bold mt-1 text-[var(--sidebar-fg)]">
            {storageMode === "supabase" ? "Nuvem (Supabase)" : "Local (Navegador)"}
          </div>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[var(--panel)]">
        {/* Header/Topo */}
        <header className="h-16 flex items-center justify-between px-8 bg-[var(--panel)] border-b border-[var(--line)]">
          <div className="flex items-center gap-2">
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-lg hover:bg-[var(--panel-strong)] transition text-[var(--muted)] hover:text-[var(--foreground)]"
                title={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-[var(--foreground)]">{user.email}</span>
              <button 
                onClick={handleLogout}
                className="text-xs font-bold text-[var(--muted)] hover:text-red-500 transition"
              >
                Sair
              </button>
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </header>

        {currentTab === "templates" ? (
          <TemplateGallery onUseTemplate={onUseTemplate} />
        ) : (
        <div className="flex-1 max-w-5xl mx-auto w-full p-8 flex flex-col">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm font-semibold shadow-sm">
              {error}
            </div>
          )}

          {/* Saudação e Criação */}
          {currentTab === "home" && (
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">
                {getGreeting()}{user?.email ? `, ${user.email.split('@')[0]}` : ""}!
              </h1>
              
              <div className="grid grid-cols-3 gap-4">
                <button 
                  onClick={() => onCreate("Novo Mapa Mental")}
                  className="flex flex-col items-center justify-center h-32 rounded-xl border border-dashed border-[var(--line)] bg-[var(--background)] hover:border-blue-500 hover:bg-blue-500/5 transition text-[var(--muted)] hover:text-blue-500"
                >
                  <Plus size={24} className="mb-2" />
                  <span className="text-sm font-semibold">Mapa Mental em Branco</span>
                </button>
                <button 
                  onClick={() => onUseTemplate("brainstorming", "Brainstorming")}
                  className="flex flex-col items-start justify-between p-4 h-32 rounded-xl border border-[var(--line)] bg-[var(--background)] hover:border-[var(--muted)] hover:shadow-sm transition text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-600">💡</div>
                  <span className="text-sm font-semibold text-[var(--foreground)]">Brainstorming</span>
                </button>
                <button 
                  onClick={() => onUseTemplate("orgchart", "Organograma")}
                  className="flex flex-col items-start justify-between p-4 h-32 rounded-xl border border-[var(--line)] bg-[var(--background)] hover:border-[var(--muted)] hover:shadow-sm transition text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">🏢</div>
                  <span className="text-sm font-semibold text-[var(--foreground)]">Organograma</span>
                </button>
              </div>
            </div>
          )}

          {/* Lista de Mapas */}
          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-base font-bold text-[var(--foreground)]">
                  {currentTab === "home" ? "Mapas recentes" : 
                   currentTab === "maps" ? "Meus mapas" : 
                   currentTab === "favorites" ? "Favoritos" : "Lixeira"}
                </h2>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input 
                    type="text" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Pesquisar mapas" 
                    className="pl-8 pr-4 py-1.5 text-sm rounded-md border border-[var(--line)] outline-none focus:border-blue-500 w-64 bg-[var(--background)] text-[var(--foreground)]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[var(--background)] rounded-lg border border-[var(--line)] overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-[var(--panel-strong)] text-[var(--muted)] font-semibold border-b border-[var(--line)]">
                  <tr>
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3 w-48">Localização</th>
                    <th className="px-4 py-3 w-40">Modificado</th>
                    <th className="px-4 py-3 w-28 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {filteredMaps.map((map) => (
                    <tr 
                      key={map.id} 
                      className="hover:bg-[var(--panel-strong)] cursor-pointer transition group"
                      onClick={() => currentTab !== "trash" && onSelect(map.id)}
                    >
                      <td className="px-4 py-3 font-semibold text-[var(--foreground)] flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center text-blue-500 text-xs">
                          🧠
                        </div>
                        {map.title}
                      </td>
                      <td className="px-4 py-3 text-[var(--muted)]">
                        <div className="flex items-center gap-2">
                          <Folder size={14} /> Meus mapas
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--muted)]">
                        {formatDate(map.updatedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {currentTab !== "trash" ? (
                            <>
                              <button 
                                className={cn("p-1.5 rounded-md hover:bg-[var(--line)]", map.isFavorite ? "text-yellow-500" : "text-[var(--muted)]")} 
                                onClick={(e) => { e.stopPropagation(); onToggleFavorite(map.id); }}
                                title="Favoritar"
                              >
                                <Star size={16} fill={map.isFavorite ? "currentColor" : "none"} />
                              </button>
                              <button 
                                className="text-[var(--muted)] hover:text-[var(--foreground)] p-1.5 rounded-md hover:bg-[var(--line)]" 
                                onClick={(e) => { e.stopPropagation(); onDuplicate(map); }}
                                title="Duplicar"
                              >
                                <Copy size={16} />
                              </button>
                              <button 
                                className="text-[var(--muted)] hover:text-red-500 p-1.5 rounded-md hover:bg-red-500/10" 
                                onClick={(e) => { e.stopPropagation(); onChangeStatus(map.id, "archived"); }}
                                title="Mover para lixeira"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                className="text-blue-500 hover:text-blue-400 p-1.5 rounded-md hover:bg-blue-500/10 text-xs font-semibold mr-2" 
                                onClick={(e) => { e.stopPropagation(); onChangeStatus(map.id, "active"); }}
                              >
                                Restaurar
                              </button>
                              <button 
                                className="text-red-500 hover:text-red-400 p-1.5 rounded-md hover:bg-red-500/10" 
                                onClick={(e) => { e.stopPropagation(); onDelete(map.id); }}
                                title="Excluir permanentemente"
                              >
                                <Trash size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredMaps.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-[var(--muted)]">
                        {currentTab === "trash" ? "Lixeira vazia." : "Nenhum mapa encontrado. Crie o seu primeiro acima!"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}
