import { useNavigate } from "react-router";
import { toast } from "sonner";

import { ProfileForm } from "@/components/campus/profile-form";
import { AppPage } from "@/components/campus/shell";
import { BackHeader } from "@/components/campus/ui";
import { errorMessage } from "@/lib/campus";
import { useMyProfile, useSaveProfile } from "@/lib/campus-data";

export function meta() {
  return [{ title: "Edit profile · CampusLost&Found" }];
}

export default function EditProfile() {
  const navigate = useNavigate();
  const { data } = useMyProfile();
  const save = useSaveProfile();
  const p = data?.profile;
  if (!data || !p) return null;

  return (
    <AppPage title="Edit profile">
      <BackHeader title="Edit profile" to="/profile" />
      <div className="mt-5 max-w-[615px] lg:mt-0">
        <ProfileForm
          mode="complete"
          email={data.email}
          defaults={{
            fullName: p.fullName,
            admissionNumber: p.admissionNumber,
            faculty: p.faculty,
            department: p.department,
            level: p.level,
            residence: p.residence,
            phone: p.phone,
          }}
          submitLabel="Save changes"
          submitting={save.isPending}
          onSubmit={({ email: _e, password: _p, ...values }) =>
            save.mutate(values, {
              onSuccess: () => {
                toast.success("Profile saved.");
                navigate("/profile");
              },
              onError: (err) => toast.error(errorMessage(err)),
            })
          }
        />
      </div>
    </AppPage>
  );
}
