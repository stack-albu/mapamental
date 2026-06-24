import { createStarterMaps } from "@/constants/default-mind-map";
import { createSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/client";
import type { MindMap } from "@/types/mind-map";

const storageKey = "mapamental:mind-maps:v2";

type MindMapRow = {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  status: MindMap["status"];
  is_favorite: boolean | null;
  tags: string[] | null;
  nodes: MindMap["nodes"];
  edges: MindMap["edges"];
  viewport: MindMap["viewport"] | null;
  created_at: string;
  updated_at: string;
};

function toRow(map: MindMap, userId: string | null) {
  return {
    id: map.id,
    user_id: userId,
    title: map.title,
    description: map.description,
    status: map.status,
    is_favorite: map.isFavorite ?? false,
    tags: map.tags,
    nodes: map.nodes,
    edges: map.edges,
    viewport: map.viewport ?? null,
    created_at: map.createdAt,
    updated_at: map.updatedAt,
  };
}

function fromRow(row: MindMapRow): MindMap {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    status: row.status,
    isFavorite: row.is_favorite ?? false,
    tags: row.tags ?? [],
    nodes: row.nodes,
    edges: row.edges,
    viewport: row.viewport ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function readLocalMaps() {
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    const starterMaps = createStarterMaps();
    writeLocalMaps(starterMaps);
    return starterMaps;
  }

  try {
    return JSON.parse(raw) as MindMap[];
  } catch {
    const starterMaps = createStarterMaps();
    writeLocalMaps(starterMaps);
    return starterMaps;
  }
}

function writeLocalMaps(maps: MindMap[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(maps));
}

export const mindMapStore = {
  mode: hasSupabaseConfig() ? "supabase" : "local",

  async list() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      return readLocalMaps();
    }

    const { data, error } = await supabase
      .from("mind_maps")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data as MindMapRow[]).map(fromRow);
  },

  async save(map: MindMap) {
    const nextMap = { ...map, updatedAt: new Date().toISOString() };
    const supabase = createSupabaseBrowserClient();

    // Sempre salva localmente primeiro como fallback de resiliência (Offline-first)
    const maps = readLocalMaps();
    const exists = maps.some((item) => item.id === nextMap.id);
    const nextMaps = exists
      ? maps.map((item) => (item.id === nextMap.id ? nextMap : item))
      : [nextMap, ...maps];
    writeLocalMaps(nextMaps);

    if (!supabase) {
      return nextMap;
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.user) {
      throw new Error("Faça login no Supabase antes de salvar no banco remoto.");
    }

    try {
      const { data, error } = await supabase
        .from("mind_maps")
        .upsert(toRow(nextMap, sessionData.session.user.id))
        .select()
        .single();

      if (error) {
        console.error("Supabase upsert error:", error);
        throw new Error(`Supabase erro: ${error.message} (Código: ${error.code}) - Detalhes: ${error.details || 'Nenhum'}`);
      }
      return fromRow(data as MindMapRow);
    } catch (error) {
      console.error("Falha de sincronização. O mapa foi salvo localmente e tentará sincronizar depois.", error);
      // Propagar o erro para a UI poder mostrar o status de 'Erro ao salvar'
      throw error;
    }
  },

  async delete(id: string) {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      writeLocalMaps(readLocalMaps().filter((map) => map.id !== id));
      return;
    }

    const { error } = await supabase.from("mind_maps").delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  },
};
