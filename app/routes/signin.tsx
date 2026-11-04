import { IconCamera } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import { AuthTabs, MobileAuth, SplitAuth, authApi } from "@/components/campus/auth";
import { useAuth } from "@/components/campus/session";
import { Btn, BtnLink, PasswordInput, Pill, TextInput } from "@/components/campus/ui";
import { errorMessage } from "@/lib/campus";

export function meta() {
  return [{ title: "Sign in · CampusLost&Found" }];
}

function NewPasswordForm() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        if (password.length < 8) {
          toast.error("Password must be at least 8 characters.");
          return;
        }
        setBusy(true);
        try {
          await authApi.updatePassword(password);
          toast.success("Password updated.");
          navigate("/", { replace: true });
        } catch (err) {
          toast.error(errorMessage(err));
          setBusy(false);
        }
      }}
    >
      <h2 className="text-xl font-bold text-ink">Set a new password</h2>
      <PasswordInput label="New password" autoComplete="new-password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Btn type="submit" disabled={busy}>{busy ? "Saving…" : "Save password"}</Btn>
    </form>
  );
}

function SignInForm({ mobile = false }: { mobile?: boolean }) {
  const navigate = useNavigate();
  const { session, recovery } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session && !recovery) navigate("/", { replace: true });
  }, [session, recovery, navigate]);

  if (recovery) return <NewPasswordForm />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await authApi.login(email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Wrong email or password."));
      setBusy(false);
    }
  }

  async function forgot() {
    if (!email.trim()) {
      setError("Enter your student email first, then tap Forgot password.");
      return;
    }
    try {
      await authApi.requestReset(email.trim());
      toast.success("If that email has an account, we've sent a reset link.");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <div className={mobile ? "flex flex-1 flex-col gap-5" : "flex flex-col gap-5"}>
      {mobile ? null : <AuthTabs active="signin" />}
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <TextInput label="Student email" type="email" autoComplete="email" placeholder="you@unizik.edu.ng" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <PasswordInput label="Password" autoComplete="current-password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <div className="-mt-1 flex justify-end">
          <button type="button" onClick={forgot} className="min-h-11 text-[17px] font-bold text-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link rounded">
            Forgot password?
          </button>
        </div>
        {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
        <Btn type="submit" disabled={busy || !email || !password}>
          {busy ? "Signing in…" : "Sign in"}
        </Btn>
      </form>
      {mobile ? (
        <div className="mt-auto flex flex-col gap-3 pt-6">
          <p className="text-center text-[15px] text-muted-ink">New to CampusLost&amp;Found?</p>
          <BtnLink to="/create-account" variant="secondary">
            Create an account
          </BtnLink>
        </div>
      ) : (
        <p className="text-center text-[17px] text-muted-ink">
          New here?{" "}
          <Link to="/create-account" className="font-bold text-brand hover:underline">
            Create an account
          </Link>
        </p>
      )}
    </div>
  );
}

export default function SignIn() {
  return (
    <>
      <MobileAuth headline="Welcome back" sub="Sign in to find or return items on campus.">
        <SignInForm mobile />
      </MobileAuth>
      <SplitAuth
        headline="Welcome back."
        sub="New items are posted every day. Sign in to see if yours is here."
        leftClassName="lg:w-[60%]"
        extra={
          <div className="flex gap-3 rounded-2xl bg-brand-soft p-4">
            <span className="grid size-[66px] shrink-0 place-items-center rounded-xl bg-white/10 text-white">
              <IconCamera size={24} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-white">Black Dell charger</p>
                <Pill kind="found" />
              </div>
              <p className="text-sm text-white/70">Black · Dell · blue tape</p>
              <p className="text-sm text-white/70">Block C, Engineering · 2 hrs ago</p>
            </div>
          </div>
        }
      >
        <h2 className="mb-5 text-[28px] font-bold text-ink">Sign in to your account</h2>
        <SignInForm />
      </SplitAuth>
    </>
  );
}
