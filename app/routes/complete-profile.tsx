import { IconCheck } from "@tabler/icons-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { ProfileForm } from "@/components/campus/profile-form";
import { useAuth } from "@/components/campus/session";
import { Avatar, Logo, Stepper } from "@/components/campus/ui";
import { errorMessage } from "@/lib/campus";
import { useMyProfile, useSaveProfile } from "@/lib/campus-data";

export function meta() {
  return [{ title: "Complete your profile · CampusLost&Found" }];
}

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const { data, isLoading } = useMyProfile();
  const save = useSaveProfile();

  useEffect(() => {
    if (!loading && !session) navigate("/welcome", { replace: true });
    else if (data?.profile?.profileComplete) navigate("/", { replace: true });
  }, [loading, session, data, navigate]);

  if (loading || !session || isLoading || !data) {
    return <div className="grid min-h-full place-items-center"><Logo /></div>;
  }

  const email = data.email;
  const name = data.profile?.fullName || data.googleName;
  const viaGoogle = session.user.app_metadata?.provider === "google";

  return (
    <div className="min-h-full bg-white lg:bg-surface lg:py-10">
      <div className="px-5 pt-5 lg:flex lg:justify-center lg:px-0 lg:pt-0">
        <Logo />
      </div>
      <div className="mx-auto max-w-[615px] px-5 pb-10 pt-4 lg:mt-6 lg:rounded-3xl lg:bg-white lg:px-8 lg:py-8">
        <div className="max-w-[340px]">
          <Stepper steps={[viaGoogle ? "Google" : "Account", "Your details", "Done"]} current={1} />
        </div>
        <h1 className="mt-4 font-display text-[30px] font-bold text-ink">Complete your profile</h1>
        <p className="mt-2 text-[17px] text-muted-ink">You only do this once. It keeps handovers safe.</p>
        <div className="my-5 flex items-center gap-4 rounded-2xl bg-surface p-4">
          <Avatar name={name || email} className="size-[52px] text-lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold text-ink">{name || "Your account"}</p>
            <p className="truncate text-sm text-muted-ink">{email}</p>
          </div>
          {viaGoogle ? (
            <span className="inline-flex items-center gap-1 text-sm font-bold text-brand">
              <IconCheck size={14} stroke={2.5} /> Google
            </span>
          ) : null}
        </div>
        <ProfileForm
          mode="complete"
          email={email}
          defaults={{ fullName: name }}
          submitLabel="Finish and continue"
          requireTerms
          submitting={save.isPending}
          onSubmit={({ email: _e, password: _p, ...values }) =>
            save.mutate(values, {
              onSuccess: () => navigate("/", { replace: true }),
              onError: (err) => toast.error(errorMessage(err)),
            })
          }
        />
      </div>
    </div>
  );
}
