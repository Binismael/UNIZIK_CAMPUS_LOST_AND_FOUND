import { appPath } from "@agent-native/core/client/api-path";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import { Logo } from "./ui";

async function postJson(path: string, body: unknown) {
  const res = await fetch(appPath(path), {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok || data.error) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

export const authApi = {
  login: (email: string, password: string) =>
    postJson("/_agent-native/auth/login", { email, password }),
  async signUp(email: string, password: string, name: string) {
    await postJson("/_agent-native/auth/register", { email, password, name });
    return postJson("/_agent-native/auth/login", { email, password });
  },
  requestReset: (email: string) =>
    postJson("/_agent-native/auth/ba/request-password-reset", {
      email,
      redirectTo: `${window.location.origin}/signin`,
    }),
  async google(returnPath: string) {
    try {
      const res = await fetch(
        appPath(`/_agent-native/google/auth-url?return=${encodeURIComponent(returnPath)}`),
        { credentials: "include" },
      );
      const data = (await res.json().catch(() => ({}))) as { url?: string };
      if (!res.ok || !data.url) throw new Error();
      window.location.href = data.url;
    } catch {
      toast.error("Google sign-in isn't set up yet. Use your student email for now.");
    }
  },
};

export function SplitAuth({
  headline,
  sub,
  extra,
  leftClassName,
  children,
}: {
  headline: string;
  sub: string;
  extra?: React.ReactNode;
  leftClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="hidden min-h-screen lg:flex">
      <section className={cn("flex w-1/2 flex-col justify-center bg-brand px-14", leftClassName)}>
        <div className="max-w-[560px]">
          <Logo light />
          <h1 className="mt-8 font-display text-[46px] font-bold leading-[1.1] text-white">{headline}</h1>
          <p className="mt-6 max-w-[420px] text-lg text-white/75">{sub}</p>
          {extra ? <div className="mt-6 max-w-[420px]">{extra}</div> : null}
        </div>
      </section>
      <section className="flex flex-1 items-center justify-center bg-white px-14 py-10">
        <div className="w-full max-w-[575px]">{children}</div>
      </section>
    </div>
  );
}

export function AuthTabs({ active }: { active: "signin" | "create" }) {
  const base = "flex h-12 flex-1 items-center justify-center rounded-lg text-[17px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link";
  return (
    <div className="flex gap-1 rounded-xl bg-surface p-1.5" role="tablist">
      <a href="/signin" role="tab" aria-selected={active === "signin"} className={cn(base, active === "signin" ? "bg-brand text-white" : "text-muted-ink")}>
        Sign in
      </a>
      <a href="/create-account" role="tab" aria-selected={active === "create"} className={cn(base, active === "create" ? "bg-brand text-white" : "text-muted-ink")}>
        Create account
      </a>
    </div>
  );
}

export function OrDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-4 text-sm text-muted-ink">
      <span className="h-px flex-1 bg-divider" />
      {label}
      <span className="h-px flex-1 bg-divider" />
    </div>
  );
}
