import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type SessionState = { session: Session | null; loading: boolean; recovery: boolean };

const SessionContext = createContext<SessionState>({ session: null, loading: true, recovery: false });

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<SessionState>({ session: null, loading: true, recovery: false });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setState((s) => ({ ...s, session: data.session, loading: false }));
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setState((s) => ({ session, loading: false, recovery: event === "PASSWORD_RECOVERY" ? true : event === "SIGNED_OUT" ? false : s.recovery }));
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        queryClient.invalidateQueries();
      }
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient]);

  return <SessionContext.Provider value={state}>{children}</SessionContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(SessionContext);
  return { ...ctx, user: ctx.session?.user ?? null };
}
