import { useActionQuery } from "@agent-native/core/client/hooks";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

import { BottomNav, Sidebar } from "@/components/campus/shell";
import { Logo } from "@/components/campus/ui";

export default function AppLayout() {
  const navigate = useNavigate();
  const { data, isLoading, isFetching } = useActionQuery("get-my-profile", {}, { refetchOnMount: "always" });
  const needsProfile = Boolean(data && !data.profile?.profileComplete);
  const incomplete = needsProfile && !isFetching;

  useEffect(() => {
    if (incomplete) navigate("/complete-profile", { replace: true });
  }, [incomplete, navigate]);

  if (isLoading || needsProfile) {
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
