import type { CampusDetails } from "@/lib/campus-data";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

import { Logo } from "./ui";

function authError(message: string) {
  if (/invalid login credentials/i.test(message)) return new Error("Wrong email or password.");
  if (/email not confirmed/i.test(message)) return new Error("Confirm your email first — check your inbox for the link.");
  if (/already registered/i.test(message)) return new Error("That email already has an account. Sign in instead.");
  if (/database error saving new user/i.test(message)) return new Error("That admission number is already registered.");
  return new Error(message || "Something went wrong. Please try again.");
}

export const authApi = {
  async login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw authError(error.message);
  },
  async signUp(email: string, password: string, details: CampusDetails) {
    const { data: available } = await supabase.rpc("admission_number_available", {
      p_admission_number: details.admissionNumber,
    });
    if (available === false) throw new Error("That admission number is already registered.");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: details.fullName.trim(),
          admission_number: details.admissionNumber.trim(),
          faculty: details.faculty,
          department: details.department,
          level: details.level,
          residence: details.residence,
          phone: details.phone,
        },
      },
    });
    if (error) throw authError(error.message);
    return { needsConfirmation: !data.session };
  },
  async requestReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/signin`,
    });
    if (error) throw authError(error.message);
  },
  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw authError(error.message);
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
    <div className="hidden min-h-full lg:flex">
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
