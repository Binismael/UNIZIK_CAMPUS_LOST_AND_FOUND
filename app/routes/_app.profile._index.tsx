import { useActionMutation, useActionQuery } from "@agent-native/core/client/hooks";
import { signOut } from "@agent-native/core/client/sign-out";
import { IconBox, IconChevronRight, IconClipboardCheck } from "@tabler/icons-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

import { AppPage } from "@/components/campus/shell";
import { Btn, initials, shortName } from "@/components/campus/ui";
import { Switch } from "@/components/ui/switch";
import { HELP_EMAIL } from "@/lib/campus-options";
import { errorMessage } from "@/lib/campus";

export function meta() {
  return [{ title: "Profile · CampusLost&Found" }];
}

const rowCls =
  "flex min-h-[64px] items-center justify-between px-6 text-[17px] font-bold text-brand lg:min-h-[58px] lg:px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-link";

export default function Profile() {
  const { data } = useActionQuery("get-my-profile", {});
  const prefs = useActionMutation("update-preferences");
  const [signingOut, setSigningOut] = useState(false);
  const profile = data?.profile;
  if (!data || !profile) return null;

  const toggle = (key: "matchAlerts" | "notifications", value: boolean) =>
    prefs.mutate({ [key]: value }, { onError: (err) => toast.error(errorMessage(err)) });

  return (
    <AppPage title="Profile" brandHeader>
      <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
        <div className="flex flex-col gap-5 lg:gap-4">
          <div className="flex items-center gap-6 rounded-3xl bg-brand px-9 py-9 lg:gap-4 lg:rounded-2xl lg:px-5 lg:py-6">
            <span className="grid size-[88px] shrink-0 place-items-center rounded-full bg-amber text-[32px] font-bold text-brand lg:size-[66px] lg:text-2xl">
              {initials(profile.fullName)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[32px] font-bold text-white lg:text-2xl">{shortName(profile.fullName)}</p>
              <p className="text-[17px] text-white/75 lg:text-[15px]">
                {profile.department} · {profile.level} level
              </p>
              <span className="mt-1 inline-flex h-7 items-center rounded-full bg-amber px-3 text-[15px] font-bold text-brand lg:h-6 lg:text-[13px]">
                Verified student
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5 lg:gap-3">
            <Link to="/posts" className="rounded-2xl bg-surface p-6 hover:bg-divider/60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-link/40 lg:p-4">
              <IconBox size={26} className="text-brand" stroke={1.8} />
              <p className="mt-2 text-xl font-bold text-brand lg:text-lg">My posts</p>
              <p className="text-[15px] text-muted-ink lg:text-sm">{data.newClaims} new claim{data.newClaims === 1 ? "" : "s"}</p>
            </Link>
            <Link to="/claims" className="rounded-2xl bg-surface p-6 hover:bg-divider/60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-link/40 lg:p-4">
              <IconClipboardCheck size={26} className="text-brand" stroke={1.8} />
              <p className="mt-2 text-xl font-bold text-brand lg:text-lg">My claims</p>
              <p className="text-[15px] text-muted-ink lg:text-sm">{data.pendingClaims} pending</p>
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-5 lg:gap-4">
          <div className="flex flex-col divide-y divide-divider overflow-hidden rounded-2xl bg-surface">
            <label className={rowCls} htmlFor="match-alerts">
              Match alerts
              <Switch id="match-alerts" checked={profile.matchAlerts} onCheckedChange={(v) => toggle("matchAlerts", v)} aria-label="Match alerts" />
            </label>
            <label className={rowCls} htmlFor="notifications">
              Notifications
              <Switch id="notifications" checked={profile.notifications} onCheckedChange={(v) => toggle("notifications", v)} aria-label="Notifications" />
            </label>
            <Link to="/profile/edit" className={rowCls}>
              Edit profile <IconChevronRight size={22} className="text-muted-ink" />
            </Link>
            <a href={`mailto:${HELP_EMAIL}?subject=CampusLost%26Found%20feedback`} className={rowCls}>
              Help and feedback <IconChevronRight size={22} className="text-muted-ink" />
            </a>
          </div>
          <Btn
            variant="secondary"
            disabled={signingOut}
            onClick={async () => {
              setSigningOut(true);
              await signOut({ redirectTo: "/welcome" });
            }}
          >
            Sign out
          </Btn>
        </div>
      </div>
    </AppPage>
  );
}
