import { createClient, type SupportedStorage } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

// The URL and publishable key are safe to ship to the browser; RLS protects the data.
// Never put the Gemini key or the service-role key here.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://rxbcmhpukhnnvonhvqfu.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_lCUjVcxHZSZOaadtUikiYg_XHIF1f1c";

// Embedded previews can block localStorage; fall back to memory so the app still loads.
const memory = new Map<string, string>();
const safeStorage: SupportedStorage = {
  getItem: (key) => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memory.get(key) ?? null;
    }
  },
  setItem: (key, value) => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      memory.set(key, value);
    }
  },
  removeItem: (key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      memory.delete(key);
    }
  },
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: typeof window !== "undefined",
    autoRefreshToken: true,
    detectSessionInUrl: true,
    ...(typeof window !== "undefined" ? { storage: safeStorage } : {}),
    // The default cross-tab navigator lock can hang session restore in iframes.
    lock: async (_name, _timeout, fn) => fn(),
  },
});

export async function isGoogleSignInEnabled() {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_KEY } });
    const settings = (await res.json()) as { external?: { google?: boolean } };
    return Boolean(settings.external?.google);
  } catch {
    return false;
  }
}
