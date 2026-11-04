import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";

import { useAuth } from "@/components/campus/session";
import { BottomNav, Sidebar } from "@/components/campus/shell";
import { Btn, Logo } from "@/components/campus/ui";
import { useMyProfile, useRealtimeRefresh } from "@/lib/campus-data";
import { supabase } from "@/lib/supabase";

function GateScreen({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const navigate = useNavigate();
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setSlow(true), 8000);
    return () => window.clearTimeout(t);
  }, []);
  const stuck = Boolean(message) || slow;

  async function startOver() {
    await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
    navigate("/welcome", { replace: true });
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-white px-6 text-center" role="status">
      <Logo />
      <span className="max-w-sm text-sm text-muted-ink">
        {message ?? (slow ? "This is taking longer than usual." : "Loading…")}
      </span>
      {stuck ? (
        <div className="flex w-full max-w-xs flex-col gap-3">
          {onRetry ? <Btn onClick={onRetry}>Try again</Btn> : null}
          <Btn variant="secondary" onClick={startOver}>Sign out and start again</Btn>
        </div>
      ) : null}
    </div>
  );
}

export default function AppLayout() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const { data, isLoading, isError, refetch } = useMyProfile();
  useRealtimeRefresh();

  const signedOut = !loading && !session;
  const needsProfile = Boolean(data && !data.profile?.profileComplete);

  useEffect(() => {
    if (signedOut) navigate("/welcome", { replace: true });
    else if (needsProfile) navigate("/complete-profile", { replace: true });
  }, [signedOut, needsProfile, navigate]);

  if (isError && !data) {
    return <GateScreen message="We couldn't load your profile. Check your connection and try again." onRetry={() => refetch()} />;
  }
  if (loading || signedOut || isLoading || !data || needsProfile) {
    return <GateScreen />;
  }

  return (
    <div className="flex h-full bg-white text-ink">
      <Sidebar />
      <div className="min-w-0 flex-1 overflow-y-auto pb-28 lg:pb-0">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
