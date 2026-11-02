import { useActionMutation, useActionQuery } from "@agent-native/core/client/hooks";
import { useSession } from "@agent-native/core/client/use-session";
import { IconCheck } from "@tabler/icons-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { ProfileForm } from "@/components/campus/profile-form";
import { Avatar, Logo, Stepper } from "@/components/campus/ui";
import { errorMessage } from "@/lib/campus";

export function meta() {
  return [{ title: "Complete your profile · CampusLost&Found" }];
}

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { data, isLoading, isFetching } = useActionQuery("get-my-profile", {}, { refetchOnMount: "always" });
  const save = useActionMutation("save-profile");

  useEffect(() => {
    if (!isFetching && data?.profile?.profileComplete) navigate("/", { replace: true });
  }, [data, isFetching, navigate]);

  if (isLoading || !data || (isFetching && !data.profile)) {
    return <div className="grid min-h-full place-items-center"><Logo /></div>;
  }

  const email = data.email;
  const name = data.profile?.fullName || session?.name || "";

  return (
    <div className="min-h-full bg-white lg:bg-surface lg:py-10">
      <div className="px-5 pt-5 lg:flex lg:justify-center lg:px-0 lg:pt-0">
        <Logo />
      </div>
      <div className="mx-auto max-w-[615px] px-5 pb-10 pt-4 lg:mt-6 lg:rounded-3xl lg:bg-white lg:px-8 lg:py-8">
        <div className="max-w-[340px]">
          <Stepper steps={["Google", "Your details", "Done"]} current={1} />
        </div>
        <h1 className="mt-4 font-display text-[30px] font-bold text-ink">Complete your profile</h1>
        <p className="mt-2 text-[17px] text-muted-ink">You only do this once. It keeps handovers safe.</p>
        <div className="my-5 flex items-center gap-4 rounded-2xl bg-surface p-4">
          <Avatar name={name || email} className="size-[52px] text-lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold text-ink">{name || "Your account"}</p>
            <p className="truncate text-sm text-muted-ink">{email}</p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-brand">
            <IconCheck size={14} stroke={2.5} /> Google
          </span>
        </div>
        <ProfileForm
          mode="complete"
          email={email}
          defaults={{ fullName: name }}
          submitLabel="Finish and continue"
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
