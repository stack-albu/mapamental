import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type UserPreferences = {
  theme: "light" | "dark";
};

const storageKey = "mapamental:user-preferences";

const defaultPreferences: UserPreferences = {
  theme: "light",
};

export const userPreferencesStore = {
  get(): UserPreferences {
    if (typeof window === "undefined") return defaultPreferences;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error(e);
    }
    return defaultPreferences;
  },

  set(prefs: UserPreferences) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(prefs));
      
      // Update HTML class for dark mode
      if (prefs.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (e) {
      console.error(e);
    }
  },

  async loadFromServer(): Promise<UserPreferences> {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return this.get();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return this.get();

    const { data, error } = await supabase
      .from("user_preferences")
      .select("theme")
      .eq("user_id", userData.user.id)
      .single();

    if (error || !data) {
      // If not in database yet, save local preferences to server
      const local = this.get();
      await this.saveToServer(local);
      return local;
    }

    const prefs: UserPreferences = {
      theme: data.theme as "light" | "dark",
    };
    this.set(prefs);
    return prefs;
  },

  async saveToServer(prefs: UserPreferences) {
    this.set(prefs);

    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    await supabase.from("user_preferences").upsert({
      user_id: userData.user.id,
      theme: prefs.theme,
      updated_at: new Date().toISOString(),
    });
  },
};
