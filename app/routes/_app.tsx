import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

import { useAuth } from "@/components/campus/session";
import { BottomNav, Sidebar } from "@/components/campus/shell";
import { Logo } from "@/components/campus/ui";
import { useMyProfile, useRealtimeRefresh } from "@/lib/campus-data";

export default function AppLayout() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const { data, isLoading } = useMyProfile();
  useRealtimeRefresh();

  const signedOut = !loading && !session;
  const needsProfile = Boolean(data && !data.profile?.profileComplete);

  useEffect(() => {
    if (signedOut) navigate("/welcome", { replace: true });
    else if (needsProfile) navigate("/complete-profile", { replace: true });
  }, [signedOut, needsProfile, navigate]);

  if (loading || signedOut || isLoading || !data || needsProfile) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-white" role="status">
        <Logo />
        <span className="text-sm text-muted-ink">Loading…</span>
      </div>
    );
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
