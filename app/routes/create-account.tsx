import { IconChevronLeft, IconMailCheck } from "@tabler/icons-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import { OrDivider, SplitAuth, authApi } from "@/components/campus/auth";
import { ProfileForm, type AccountValues } from "@/components/campus/profile-form";
import { Btn } from "@/components/campus/ui";
import { errorMessage } from "@/lib/campus";

export function meta() {
  return [{ title: "Create account · CampusLost&Found" }];
}

function CreateAccountBody({ twoColumn }: { twoColumn: boolean }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit({ email, password, ...campus }: AccountValues) {
    setBusy(true);
    try {
      const { needsConfirmation } = await authApi.signUp(email.trim(), password, campus);
      if (needsConfirmation) {
        setSentTo(email.trim());
        setBusy(false);
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      toast.error(errorMessage(err));
      setBusy(false);
    }
  }

  if (sentTo) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface px-6 py-10 text-center">
        <IconMailCheck size={40} className="text-brand" />
        <h2 className="text-xl font-bold text-ink">Check your email</h2>
        <p className="max-w-sm text-[15px] text-muted-ink">
          We sent a confirmation link to <span className="font-bold text-ink">{sentTo}</span>. Tap it to finish creating your account, then sign in.
        </p>
        <Link to="/signin" className="mt-2 font-bold text-link hover:underline">Go to Sign in</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Btn variant="secondary" type="button" onClick={() => authApi.google("/complete-profile")}>
        Sign up with Google
      </Btn>
      <p className="text-center text-sm text-muted-ink">With Google, we ask for your campus details right after you sign in.</p>
      <OrDivider label="or fill in the form" />
      <ProfileForm mode="create" submitLabel="Create account" submitting={busy} onSubmit={onSubmit} twoColumn={twoColumn} />
      <p className="text-center text-[17px] text-muted-ink">
        Already have an account?{" "}
        <Link to="/signin" className="font-bold text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function CreateAccount() {
  return (
    <>
      <div className="min-h-full bg-white px-5 pb-10 pt-5 lg:hidden">
        <div className="flex items-center gap-4">
          <Link to="/welcome" aria-label="Back" className="grid size-11 place-items-center rounded-full bg-surface text-ink">
            <IconChevronLeft size={22} />
          </Link>
          <h1 className="text-[22px] font-bold text-ink">Create account</h1>
        </div>
        <p className="mb-4 mt-3 text-[17px] leading-snug text-muted-ink">Tell us about you so everyone on campus can trust each other.</p>
        <CreateAccountBody twoColumn={false} />
      </div>
      <SplitAuth
        headline="Join the campus network that gets things back."
        sub="Your campus details help finders and owners trust each other."
        leftClassName="lg:w-[45%]"
      >
        <h2 className="mb-5 text-[28px] font-bold text-ink">Create your account</h2>
        <CreateAccountBody twoColumn />
      </SplitAuth>
    </>
  );
}
