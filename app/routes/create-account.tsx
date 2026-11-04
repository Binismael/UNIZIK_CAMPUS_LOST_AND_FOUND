import { IconMailCheck } from "@tabler/icons-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import { MobileAuth, SplitAuth, authApi } from "@/components/campus/auth";
import { ProfileForm, type AccountValues } from "@/components/campus/profile-form";
import { errorMessage } from "@/lib/campus";

export function meta() {
  return [{ title: "Create account · CampusLost&Found" }];
}

function CreateAccountBody({ twoColumn, stepped = false }: { twoColumn: boolean; stepped?: boolean }) {
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
      <ProfileForm mode="create" submitLabel="Create account" submitting={busy} onSubmit={onSubmit} twoColumn={twoColumn} stepped={stepped} />
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
      <MobileAuth backTo="/welcome" headline="Create your account" sub="Two quick steps so finders and owners can trust each other.">
        <CreateAccountBody twoColumn={false} stepped />
      </MobileAuth>
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
