import { useActionMutation } from "@agent-native/core/client/hooks";
import { IconChevronLeft } from "@tabler/icons-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

import { OrDivider, SplitAuth, authApi } from "@/components/campus/auth";
import { ProfileForm, type AccountValues } from "@/components/campus/profile-form";
import { Btn } from "@/components/campus/ui";
import { errorMessage } from "@/lib/campus";

export function meta() {
  return [{ title: "Create account · CampusLost&Found" }];
}

function CreateAccountBody({ twoColumn }: { twoColumn: boolean }) {
  const [busy, setBusy] = useState(false);
  const saveProfile = useActionMutation("save-profile");

  async function onSubmit(values: AccountValues) {
    setBusy(true);
    try {
      await authApi.signUp(values.email, values.password, values.fullName);
      const { email: _e, password: _p, ...campus } = values;
      await saveProfile.mutateAsync(campus);
      window.location.replace("/");
    } catch (err) {
      toast.error(errorMessage(err));
      setBusy(false);
    }
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
