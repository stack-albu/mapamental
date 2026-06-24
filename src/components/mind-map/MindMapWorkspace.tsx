"use client";

import { Copy, Download, Loader2, Sparkles, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createMindMap, createTemplateMap } from "@/constants/default-mind-map";
import { mindMapStore } from "@/lib/mind-map-store";
import { Button } from "@/components/ui/Button";
import dynamic from "next/dynamic";
const MapCanvas = dynamic(() => import("@/components/mind-map/MapCanvas").then(mod => mod.MapCanvas), { 
  ssr: false, 
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[var(--muted)]" />
    </div>
  ) 
});
import { useRouter } from "next/navigation";
import { Dashboard } from "@/components/mind-map/Dashboard";
import { createSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/client";
import type { MindMap, Viewport } from "@/types/mind-map";
import { mindMapSchema } from "@/types/mind-map";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { userPreferencesStore } from "@/lib/user-preferences-store";
import { toPng } from "html-to-image";
import { Image as ImageIcon } from "lucide-react";

import { CommandPalette } from "@/components/mind-map/CommandPalette";

export function MindMapWorkspace() {
  const [maps, setMaps] = useState<MindMap[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"dashboard" | "editor">("dashboard");
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const lastSavedMapRef = useRef<string>("");
  const viewportDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Apply theme immediately on mount to prevent white flash
  useEffect(() => {
    const localPrefs = userPreferencesStore.get();
    setTheme(localPrefs.theme);
    userPreferencesStore.set(localPrefs);
  }, []);

  // Sync theme with server if user is logged in
  useEffect(() => {
    if (user) {
      userPreferencesStore.loadFromServer().then((prefs) => {
        setTheme(prefs.theme);
      });
    }
  }, [user]);

  const toggleTheme = useCallback(async () => {
    const nextTheme: "light" | "dark" = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    const newPrefs = { theme: nextTheme };
    userPreferencesStore.set(newPrefs);
    if (user) {
      try {
        await userPreferencesStore.saveToServer(newPrefs);
      } catch (err) {
        console.error("Failed to save preferences to server", err);
      }
    }
  }, [theme, user]);

  useEffect(() => {
    let mounted = true;
    const supabase = createSupabaseBrowserClient();
    
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (mounted) {
          if (data.session?.user) setUser(data.session.user);
          setAuthLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
          setAuthLoading(false);
        }
      });
      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } else {
      setAuthLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // Só redireciona para /login se o Supabase estiver configurado
    if (!authLoading && !user && hasSupabaseConfig()) {
      window.location.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    let mounted = true;

    async function loadMaps() {
      try {
        const loadedMaps = await mindMapStore.list();
        if (!mounted) {
          return;
        }
        setMaps(loadedMaps);
        setActiveId(loadedMaps[0]?.id ?? null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar os mapas.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadMaps();
  }, [user]);

  const activeMap = useMemo(
    () => maps.find((map) => map.id === activeId) ?? maps[0] ?? null,
    [activeId, maps],
  );

  const selectedNode = useMemo(() => {
    if (!activeMap || !selectedNodeId) {
      return null;
    }

    return activeMap.nodes.find((node) => node.id === selectedNodeId) ?? null;
  }, [activeMap, selectedNodeId]);

  // Reset lastSavedMapRef and set status to saved when activeId changes
  useEffect(() => {
    if (activeMap) {
      lastSavedMapRef.current = JSON.stringify(activeMap);
      setSaveStatus("saved");
    }
  }, [activeId]);

  // Debounced auto-save activeMap
  useEffect(() => {
    if (!activeMap) return;

    const currentStr = JSON.stringify(activeMap);
    if (currentStr === lastSavedMapRef.current) {
      return;
    }

    setSaveStatus("saving");
    const handler = setTimeout(async () => {
      try {
        await mindMapStore.save(activeMap);
        lastSavedMapRef.current = currentStr;
        setSaveStatus("saved");
      } catch (err) {
        console.error("Auto-save error:", err);
        setSaveStatus("error");
      }
    }, 1500);

    return () => clearTimeout(handler);
  }, [activeMap]);

  const updateMapState = useCallback((nextMap: MindMap) => {
    setMaps((currentMaps) =>
      currentMaps.map((map) =>
        map.id === nextMap.id ? { ...nextMap, updatedAt: new Date().toISOString() } : map,
      ),
    );
  }, []);

  // Viewport is saved separately with a longer debounce (2s) to avoid
  // flooding the DB on every pan/zoom. We use setMaps updater form
  // to read the freshest state at save time.
  const handleViewportChange = useCallback((viewport: Viewport) => {
    // Update in-memory state immediately (no DB call yet)
    setMaps((currentMaps) =>
      currentMaps.map((map) =>
        map.id === activeId ? { ...map, viewport } : map
      )
    );

    // Debounce the actual DB write
    if (viewportDebounceRef.current) clearTimeout(viewportDebounceRef.current);
    viewportDebounceRef.current = setTimeout(() => {
      setMaps((currentMaps) => {
        const mapToSave = currentMaps.find(m => m.id === activeId);
        if (mapToSave) {
          mindMapStore.save({ ...mapToSave, viewport }).catch(console.error);
        }
        return currentMaps; // no state change, just side-effect read
      });
    }, 2000);
  }, [activeId]);

  const createMap = useCallback(async (title: string) => {
    const map = createTemplateMap("blank", title);
    setError(null);
    setSaving(true);

    try {
      const savedMap = await mindMapStore.save(map);
      setMaps((currentMaps) => [savedMap, ...currentMaps]);
      setActiveId(savedMap.id);
      setSelectedNodeId("root");
      setCurrentView("editor");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Não foi possível criar o mapa.");
    } finally {
      setSaving(false);
    }
  }, []);

  const duplicateMap = useCallback(async (map: MindMap) => {
    const now = new Date().toISOString();
    const duplicatedMap: MindMap = {
      ...map,
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `map-${Date.now()}`,
      title: `${map.title} cópia`,
      createdAt: now,
      updatedAt: now,
      nodes: map.nodes.map((node) => ({ ...node, data: { ...node.data }, position: { ...node.position } })),
      edges: map.edges.map((edge) => ({ ...edge })),
    };

    setError(null);
    setSaving(true);

    try {
      const savedMap = await mindMapStore.save(duplicatedMap);
      setMaps((currentMaps) => [savedMap, ...currentMaps]);
      setActiveId(savedMap.id);
      setSelectedNodeId(null);
      setCurrentView("editor");
    } catch (duplicateError) {
      setError(duplicateError instanceof Error ? duplicateError.message : "Não foi possível duplicar o mapa.");
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteMap = useCallback(
    async (id: string) => {
      if (maps.length <= 1) {
        return;
      }

      setError(null);
      setSaving(true);

      try {
        await mindMapStore.delete(id);
        setMaps((currentMaps) => {
          const nextMaps = currentMaps.filter((map) => map.id !== id);
          if (activeId === id) {
            setActiveId(null);
            setSelectedNodeId(null);
            setCurrentView("dashboard");
          }
          return nextMaps;
        });
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : "Não foi possível excluir o mapa.");
      } finally {
        setSaving(false);
      }
    },
    [activeId, maps.length],
  );

  const saveActiveMap = useCallback(async () => {
    if (!activeMap) {
      return;
    }

    setError(null);
    setSaving(true);
    setSaveStatus("saving");

    try {
      const savedMap = await mindMapStore.save(activeMap);
      setMaps((currentMaps) => currentMaps.map((map) => (map.id === savedMap.id ? savedMap : map)));
      lastSavedMapRef.current = JSON.stringify(savedMap);
      setSaveStatus("saved");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar o mapa.");
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  }, [activeMap]);

  const toggleFavorite = useCallback(async (id: string) => {
    const map = maps.find(m => m.id === id);
    if (!map) return;
    const updatedMap = { ...map, isFavorite: !map.isFavorite, updatedAt: new Date().toISOString() };
    try {
      await mindMapStore.save(updatedMap);
      setMaps(current => current.map(m => m.id === id ? updatedMap : m));
    } catch (e) {
      console.error(e);
    }
  }, [maps]);

  const changeStatus = useCallback(async (id: string, status: "draft" | "active" | "archived") => {
    const map = maps.find(m => m.id === id);
    if (!map) return;
    const updatedMap = { ...map, status, updatedAt: new Date().toISOString() };
    try {
      await mindMapStore.save(updatedMap);
      setMaps(current => current.map(m => m.id === id ? updatedMap : m));
    } catch (e) {
      console.error(e);
    }
  }, [maps]);

  const createFromTemplate = useCallback(async (type: string, name: string) => {
    const map = createTemplateMap(type, name);
    setError(null);
    setSaving(true);
    try {
      const savedMap = await mindMapStore.save(map);
      setMaps(current => [savedMap, ...current]);
      setActiveId(savedMap.id);
      setSelectedNodeId("root");
      setCurrentView("editor");
    } catch (e) {
      setError("Não foi possível criar o mapa a partir do modelo.");
    } finally {
      setSaving(false);
    }
  }, []);

  const handleExportJSON = useCallback(() => {
    if (!activeMap) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeMap, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `${activeMap.title.replace(/\s+/g, "_")}.json`);
    dlAnchorElem.click();
  }, [activeMap]);

  const handleExportImage = useCallback(async () => {
    if (!activeMap) return;
    
    // Pegar a div onde o ReactFlow está renderizado
    const flowElement = document.querySelector(".react-flow") as HTMLElement;
    if (!flowElement) return;

    try {
      setSaveStatus("saving");
      // filter out the UI controls to not show in image
      const dataUrl = await toPng(flowElement, {
        backgroundColor: theme === "dark" ? "#1e1e1e" : "#ffffff",
        filter: (node) => {
          if (
            node?.classList?.contains("react-flow__controls") ||
            node?.classList?.contains("react-flow__minimap") ||
            node?.classList?.contains("react-flow__panel")
          ) {
            return false;
          }
          return true;
        },
      });

      const a = document.createElement("a");
      a.setAttribute("download", `${activeMap.title.replace(/\s+/g, "_")}.png`);
      a.setAttribute("href", dataUrl);
      a.click();
      setSaveStatus("saved");
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
    }
  }, [activeMap, theme]);

  const handleImportJSON = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parsedContent = JSON.parse(content);
        
        const validationResult = mindMapSchema.safeParse(parsedContent);
        if (!validationResult.success) {
          setError("O arquivo JSON não é um mapa mental válido ou está corrompido.");
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
        
        const importedMap = validationResult.data as MindMap;
        
        // Crie um novo ID para evitar conflitos
        importedMap.id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `map-${Date.now()}`;
        
        const savedMap = await mindMapStore.save(importedMap);
        setMaps((currentMaps) => [savedMap, ...currentMaps]);
        setActiveId(savedMap.id);
        setCurrentView("editor");
      } catch (err) {
        setError("Formato de arquivo JSON inválido ou incompatível.");
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  }, []);

  if (loading || authLoading) {
    return (
      <main className="grid min-h-dvh place-items-center px-4">
        <div className="inline-flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-3 shadow-[var(--shadow)]">
          <Loader2 className="animate-spin" size={18} />
          <span className="text-sm font-semibold">Carregando mapas mentais</span>
        </div>
      </main>
    );
  }

  // Prevent render if redirecting to login
  if (!user && hasSupabaseConfig()) return null;

  if (currentView === "dashboard" || !activeMap) {
    return (
      <>
        <Dashboard
          maps={maps}
          onCreate={createMap}
          onSelect={(id) => {
            setActiveId(id);
            setSelectedNodeId(null);
            setCurrentView("editor");
          }}
          onToggleFavorite={toggleFavorite}
          onChangeStatus={changeStatus}
          onDuplicate={duplicateMap}
          onDelete={deleteMap}
          onUseTemplate={createFromTemplate}
          storageMode={mindMapStore.mode}
          user={user}
          theme={theme}
          onToggleTheme={toggleTheme}
          error={error}
        />
      </>
    );
  }

  return (
    <main className="flex h-dvh w-full flex-col bg-[var(--panel)] overflow-hidden text-[var(--foreground)]">
      <header className="h-14 flex items-center justify-between px-4 border-b border-[var(--line)] bg-[var(--panel)] z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            className="p-1.5 hover:bg-[var(--line)] rounded-md transition text-[var(--muted)] hover:text-[var(--foreground)]"
            onClick={() => setCurrentView("dashboard")}
          >
            <Loader2 className="hidden" /> {/* just keeping import happy */}
            <span className="font-bold text-xl px-1">←</span>
          </button>
          <div className="w-6 h-6 rounded bg-pink-500 flex items-center justify-center text-white">
            <Sparkles size={12} />
          </div>
          <h2 className="font-bold text-[15px]">{activeMap.title}</h2>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full ml-2 border transition-all duration-200",
            saveStatus === "saved" && "text-green-500 bg-green-500/10 border-green-500/20",
            saveStatus === "saving" && "text-blue-500 bg-blue-500/10 border-blue-500/20",
            saveStatus === "error" && "text-red-500 bg-red-500/10 border-red-500/20"
          )}>
            {saveStatus === "saved" && "Salvo na nuvem"}
            {saveStatus === "saving" && "Salvando..."}
            {saveStatus === "error" && "Erro ao salvar"}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleImportJSON} 
            className="hidden" 
          />
          <Button
            className="h-8 min-h-8 text-xs font-semibold px-3"
            icon={<Upload size={14} />}
            onClick={() => fileInputRef.current?.click()}
            variant="ghost"
          >
            Importar
          </Button>
          <Button
            className="h-8 min-h-8 text-xs font-semibold px-3"
            icon={<Download size={14} />}
            onClick={handleExportJSON}
            variant="ghost"
          >
            JSON
          </Button>
          <Button
            className="h-8 min-h-8 text-xs font-semibold px-3"
            icon={<ImageIcon size={14} />}
            onClick={handleExportImage}
            variant="ghost"
          >
            Imagem
          </Button>
          <div className="w-[1px] h-4 bg-[var(--line)] mx-1" />
          <Button
            className="h-8 min-h-8 text-xs font-semibold px-3"
            icon={<Copy size={14} />}
            onClick={() => duplicateMap(activeMap)}
            variant="ghost"
          >
            Duplicar
          </Button>
          <Button
            className="h-8 min-h-8 text-xs font-semibold px-3 text-red-500 hover:text-red-400 hover:bg-red-500/10"
            icon={<Trash2 size={14} />}
            onClick={() => deleteMap(activeMap.id)}
            variant="ghost"
          >
            Excluir
          </Button>
          <div className="w-[1px] h-4 bg-[var(--line)] mx-1" />
          <Button
            className="h-8 min-h-8 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white border-0 px-4"
            onClick={saveActiveMap}
            variant="primary"
          >
            Salvar Nuvem
          </Button>
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm ml-2">
            {user ? user.email?.charAt(0).toUpperCase() : "R"}
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 relative">
        <section className="flex-1 min-w-0 h-full bg-[var(--panel)] relative">
          <MapCanvas
            map={activeMap}
            onChange={updateMapState}
            onSelectNode={setSelectedNodeId}
            selectedNodeId={selectedNodeId}
            onViewportChange={handleViewportChange}
            theme={theme}
          />
        </section>
      </div>

      <CommandPalette 
        maps={maps} 
        onSelectMap={(id) => {
          setActiveId(id);
          setSelectedNodeId(null);
          setCurrentView("editor");
        }} 
        onSelectNode={(mapId, nodeId) => {
          setActiveId(mapId);
          setSelectedNodeId(nodeId);
          setCurrentView("editor");
        }} 
      />

    </main>
  );
}
